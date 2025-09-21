use rdkafka::config::ClientConfig;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::Message;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::Duration;
use tokio;
use chrono::Utc;
use warp::Filter;
use futures_util::{SinkExt, StreamExt};

#[derive(Deserialize, Debug, Clone)]
struct TradeMessage {
    token_address: String,
    price_in_sol: f64,
}

#[derive(Serialize, Debug, Clone)]
struct RsiMessage {
    token_address: String,
    rsi_value: f64,
    price: f64,
    timestamp: String,
    period_used: usize,
}

#[derive(Serialize, Debug, Clone)]
struct TokenSummary {
    token_address: String,
    latest_price: f64,
    latest_rsi: Option<f64>,
    total_trades: usize,
    last_updated: String,
}

#[derive(Serialize, Debug, Clone)]
struct HistoricalDataPoint {
    timestamp: String,
    price: f64,
    rsi: Option<f64>,
}

#[derive(Serialize, Debug, Clone)]
struct HistoricalData {
    token_address: String,
    data_points: Vec<HistoricalDataPoint>,
}

#[derive(Debug)]
struct RsiCalculator {
    period: usize,
    prices: Vec<f64>,
    avg_gain: Option<f64>,
    avg_loss: Option<f64>,
    total_trades: usize,
    history: Vec<HistoricalDataPoint>,
    max_history: usize,
    last_rsi: Option<f64>,
}

impl RsiCalculator {
    fn new(period: usize) -> Self {
        Self {
            period,
            prices: Vec::new(),
            avg_gain: None,
            avg_loss: None,
            total_trades: 0,
            history: Vec::new(),
            max_history: 200, // Keep last 200 data points
            last_rsi: None,
        }
    }

    fn add_price(&mut self, price: f64) -> Option<f64> {
        // Skip zero or negative prices
        if price <= 0.0 {
            return None;
        }

        self.prices.push(price);
        self.total_trades += 1;
        
        let timestamp = Utc::now().to_rfc3339();
        
        let rsi_value = if self.prices.len() < 2 {
            // Need at least 2 prices to calculate price change
            None
        } else if self.prices.len() <= self.period + 1 {
            // Initial calculation using simple moving average for the first period
            self.calculate_initial_rsi()
        } else {
            // Use Wilder's smoothing for subsequent calculations
            self.calculate_smoothed_rsi()
        };

        // Store the calculated RSI
        self.last_rsi = rsi_value;

        // Add to history
        self.history.push(HistoricalDataPoint {
            timestamp,
            price,
            rsi: rsi_value,
        });

        // Keep only the last max_history data points
        if self.history.len() > self.max_history {
            self.history.drain(0..self.history.len() - self.max_history);
        }

        // Keep reasonable price history for calculations (period + buffer)
        if self.prices.len() > self.period + 100 {
            let excess = self.prices.len() - (self.period + 50);
            self.prices.drain(0..excess);
        }

        rsi_value
    }

    fn calculate_initial_rsi(&mut self) -> Option<f64> {
        // We need at least period+1 prices to calculate initial RSI
        if self.prices.len() <= self.period {
            return None;
        }

        let mut gains = Vec::new();
        let mut losses = Vec::new();

        // Calculate price changes for the period
        let start_index = self.prices.len() - self.period - 1;
        for i in (start_index + 1)..self.prices.len() {
            let change = self.prices[i] - self.prices[i - 1];
            if change > 0.0 {
                gains.push(change);
                losses.push(0.0);
            } else {
                gains.push(0.0);
                losses.push(-change);
            }
        }

        if gains.is_empty() {
            return None;
        }

        // Initial averages (simple moving average for first calculation)
        self.avg_gain = Some(gains.iter().sum::<f64>() / self.period as f64);
        self.avg_loss = Some(losses.iter().sum::<f64>() / self.period as f64);

        self.calculate_rsi_from_averages()
    }

    fn calculate_smoothed_rsi(&mut self) -> Option<f64> {
        if self.prices.len() < 2 || self.avg_gain.is_none() || self.avg_loss.is_none() {
            return None;
        }

        let current_price = *self.prices.last().unwrap();
        let previous_price = self.prices[self.prices.len() - 2];
        let price_change = current_price - previous_price;

        let current_gain = if price_change > 0.0 { price_change } else { 0.0 };
        let current_loss = if price_change < 0.0 { -price_change } else { 0.0 };

        // Wilder's smoothing method: EMA with alpha = 1/period
        let alpha = 1.0 / self.period as f64;
        
        self.avg_gain = Some(
            (1.0 - alpha) * self.avg_gain.unwrap() + alpha * current_gain
        );
        self.avg_loss = Some(
            (1.0 - alpha) * self.avg_loss.unwrap() + alpha * current_loss
        );

        self.calculate_rsi_from_averages()
    }

    fn calculate_rsi_from_averages(&self) -> Option<f64> {
        let avg_gain = self.avg_gain?;
        let avg_loss = self.avg_loss?;

        if avg_loss == 0.0 {
            Some(100.0)
        } else if avg_gain == 0.0 {
            Some(0.0)
        } else {
            let rs = avg_gain / avg_loss;
            Some(100.0 - (100.0 / (1.0 + rs)))
        }
    }

    fn get_latest_price(&self) -> Option<f64> {
        self.prices.last().copied()
    }

    fn get_latest_rsi(&self) -> Option<f64> {
        self.last_rsi
    }

    fn get_total_trades(&self) -> usize {
        self.total_trades
    }

    fn get_history(&self) -> &Vec<HistoricalDataPoint> {
        &self.history
    }
}

type SharedState = Arc<RwLock<HashMap<String, (RsiCalculator, Option<RsiMessage>)>>>;

async fn create_consumer() -> Result<StreamConsumer, rdkafka::error::KafkaError> {
    use std::time::{SystemTime, UNIX_EPOCH};
    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    let group_id = format!("rsi-calculator-{}", timestamp);
    
    println!("🔗 Creating consumer with group ID: {}", group_id);
    
    ClientConfig::new()
        .set("group.id", &group_id)
        .set("bootstrap.servers", "localhost:19092")
        .set("auto.offset.reset", "earliest")
        .set("enable.auto.commit", "true")
        .create()
}

async fn create_producer() -> Result<FutureProducer, rdkafka::error::KafkaError> {
    ClientConfig::new()
        .set("bootstrap.servers", "localhost:19092")
        .set("message.timeout.ms", "5000")
        .create()
}

// REST API handlers
async fn get_tokens(state: SharedState) -> Result<impl warp::Reply, warp::Rejection> {
    let tokens = {
        let data = state.read().unwrap();
        data.keys().cloned().collect::<Vec<String>>()
    };
    Ok(warp::reply::json(&tokens))
}

async fn get_token_summary(token: String, state: SharedState) -> Result<impl warp::Reply, warp::Rejection> {
    let summary = {
        let data = state.read().unwrap();
        if let Some((calculator, rsi_message)) = data.get(&token) {
            Some(TokenSummary {
                token_address: token.clone(),
                latest_price: calculator.get_latest_price().unwrap_or(0.0),
                latest_rsi: calculator.get_latest_rsi(),
                total_trades: calculator.get_total_trades(),
                last_updated: rsi_message.as_ref()
                    .map(|msg| msg.timestamp.clone())
                    .unwrap_or_else(|| Utc::now().to_rfc3339()),
            })
        } else {
            None
        }
    };
    
    match summary {
        Some(s) => Ok(warp::reply::json(&s)),
        None => Ok(warp::reply::json(&serde_json::json!({"error": "Token not found"})))
    }
}

async fn get_all_summaries(state: SharedState) -> Result<impl warp::Reply, warp::Rejection> {
    let summaries = {
        let data = state.read().unwrap();
        data.iter().map(|(token, (calculator, rsi_message))| {
            TokenSummary {
                token_address: token.clone(),
                latest_price: calculator.get_latest_price().unwrap_or(0.0),
                latest_rsi: calculator.get_latest_rsi(),
                total_trades: calculator.get_total_trades(),
                last_updated: rsi_message.as_ref()
                    .map(|msg| msg.timestamp.clone())
                    .unwrap_or_else(|| Utc::now().to_rfc3339()),
            }
        }).collect::<Vec<_>>()
    };
    Ok(warp::reply::json(&summaries))
}

async fn get_token_history(token: String, state: SharedState) -> Result<impl warp::Reply, warp::Rejection> {
    let history = {
        let data = state.read().unwrap();
        if let Some((calculator, _)) = data.get(&token) {
            Some(HistoricalData {
                token_address: token.clone(),
                data_points: calculator.get_history().clone(),
            })
        } else {
            None
        }
    };
    
    match history {
        Some(h) => Ok(warp::reply::json(&h)),
        None => Ok(warp::reply::json(&serde_json::json!({"error": "Token not found"})))
    }
}

// WebSocket handler for real-time updates
async fn websocket_handler(
    ws: warp::ws::Ws,
    broadcast_rx: Arc<RwLock<Option<tokio::sync::broadcast::Receiver<RsiMessage>>>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    Ok(ws.on_upgrade(move |websocket| async move {
        let (mut ws_tx, _ws_rx) = websocket.split();
        
        // Get a receiver from the broadcast channel
        let mut rx = {
            let receiver_opt = broadcast_rx.write().unwrap();
            if let Some(ref tx) = *receiver_opt {
                tx.resubscribe()
            } else {
                return; // No broadcaster available
            }
        };
        
        while let Ok(rsi_message) = rx.recv().await {
            let msg = warp::ws::Message::text(serde_json::to_string(&rsi_message).unwrap());
            if ws_tx.send(msg).await.is_err() {
                break;
            }
        }
    }))
}

async fn kafka_processor(
    shared_state: SharedState, 
    producer: FutureProducer, 
    broadcast_tx: tokio::sync::broadcast::Sender<RsiMessage>
) -> Result<(), Box<dyn std::error::Error>> {
    let consumer = create_consumer().await?;
    consumer.subscribe(&["trade-data"])?;
    
    println!("🔄 Kafka processor started, listening for trade data...");
    
    let mut message_count = 0;

    loop {
        match consumer.recv().await {
            Ok(message) => {
                message_count += 1;
                
                if let Some(payload) = message.payload() {
                    if let Ok(trade_str) = std::str::from_utf8(payload) {
                        match serde_json::from_str::<TradeMessage>(trade_str) {
                            Ok(trade) => {
                                let (rsi_message_opt, trade_count) = {
                                    let mut data = shared_state.write().unwrap();
                                    let (calculator, _) = data
                                        .entry(trade.token_address.clone())
                                        .or_insert_with(|| (RsiCalculator::new(14), None));

                                    let trade_count = calculator.get_total_trades();
                                    
                                    if let Some(rsi_value) = calculator.add_price(trade.price_in_sol) {
                                        let rsi_message = RsiMessage {
                                            token_address: trade.token_address.clone(),
                                            rsi_value,
                                            price: trade.price_in_sol,
                                            timestamp: Utc::now().to_rfc3339(),
                                            period_used: 14,
                                        };
                                        
                                        // Update shared state
                                        data.get_mut(&trade.token_address).unwrap().1 = Some(rsi_message.clone());
                                        
                                        (Some(rsi_message), trade_count + 1)
                                    } else {
                                        (None, trade_count + 1)
                                    }
                                };

                                if let Some(rsi_message) = rsi_message_opt {
                                    // Send to Kafka
                                    let rsi_json = serde_json::to_string(&rsi_message)?;
                                    let record = FutureRecord::to("rsi-data")
                                        .payload(&rsi_json)
                                        .key(&trade.token_address);

                                    if let Err(e) = producer.send(record, Duration::from_secs(0)).await {
                                        eprintln!("❌ Failed to send RSI message: {:?}", e);
                                    }

                                    // Send to WebSocket broadcast
                                    let _ = broadcast_tx.send(rsi_message.clone());

                                    let token_short = if trade.token_address.len() > 8 {
                                        format!("{}...", &trade.token_address[..8])
                                    } else {
                                        trade.token_address.clone()
                                    };
                                    
                                    println!(
                                        "📊 RSI: {} = {:.2} (Price: {:.8} SOL) [Trades: {}]",
                                        token_short,
                                        rsi_message.rsi_value,
                                        trade.price_in_sol,
                                        trade_count
                                    );
                                } else {
                                    // Still early in the data collection phase
                                    if message_count % 50 == 0 {
                                        let token_short = if trade.token_address.len() > 8 {
                                            format!("{}...", &trade.token_address[..8])
                                        } else {
                                            trade.token_address.clone()
                                        };
                                        println!(
                                            "📈 Building data: {} (Price: {:.8} SOL) [Trades: {}/{}]",
                                            token_short,
                                            trade.price_in_sol,
                                            trade_count,
                                            14 + 1 // period + 1 needed for RSI
                                        );
                                    }
                                }
                            }
                            Err(e) => {
                                if message_count <= 5 {
                                    eprintln!("❌ Failed to parse trade message: {:?}", e);
                                    eprintln!("Raw message: {}", trade_str);
                                }
                            }
                        }
                    }
                }

                if message_count % 100 == 0 {
                    let token_count = shared_state.read().unwrap().len();
                    println!("📈 Processed {} messages. Active tokens: {}", message_count, token_count);
                }
            }
            Err(e) => {
                eprintln!("❌ Error receiving message: {:?}", e);
                tokio::time::sleep(Duration::from_secs(1)).await;
            }
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting RSI Calculator Service with Web API");
    println!("📊 Using proper Wilder's RSI calculation method");
    
    // Shared state for token data
    let shared_state: SharedState = Arc::new(RwLock::new(HashMap::new()));
    
    // Create broadcast channel for WebSocket updates
    let (broadcast_tx, _broadcast_rx) = tokio::sync::broadcast::channel::<RsiMessage>(1000);
    let broadcast_rx_for_ws = Arc::new(RwLock::new(Some(broadcast_tx.subscribe())));
    
    // Create Kafka producer
    let producer = create_producer().await?;

    // Clone shared state for different tasks
    let state_for_kafka = shared_state.clone();
    let state_for_api = shared_state.clone();
    let state_for_token = shared_state.clone();
    let state_for_summaries = shared_state.clone();
    let state_for_history = shared_state.clone();

    // Start Kafka processing task
    let kafka_task = tokio::spawn(async move {
        if let Err(e) = kafka_processor(state_for_kafka, producer, broadcast_tx).await {
            eprintln!("❌ Kafka processor error: {:?}", e);
        }
    });

    // CORS configuration
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type"])
        .allow_methods(vec!["GET", "POST", "OPTIONS"]);

    // REST API routes
    let api = warp::path("api");
    
    let tokens_route = api
        .and(warp::path("tokens"))
        .and(warp::path::end())
        .and(warp::get())
        .and(warp::any().map(move || state_for_api.clone()))
        .and_then(get_tokens);

    let token_summary_route = api
        .and(warp::path("token"))
        .and(warp::path::param::<String>())
        .and(warp::path::end())
        .and(warp::get())
        .and(warp::any().map(move || state_for_token.clone()))
        .and_then(get_token_summary);

    let summaries_route = api
        .and(warp::path("summaries"))
        .and(warp::path::end())
        .and(warp::get())
        .and(warp::any().map(move || state_for_summaries.clone()))
        .and_then(get_all_summaries);

    let history_route = api
        .and(warp::path("history"))
        .and(warp::path::param::<String>())
        .and(warp::path::end())
        .and(warp::get())
        .and(warp::any().map(move || state_for_history.clone()))
        .and_then(get_token_history);

    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(warp::any().map(move || broadcast_rx_for_ws.clone()))
        .and_then(websocket_handler);

    let routes = tokens_route
        .or(token_summary_route)
        .or(summaries_route)
        .or(history_route)
        .or(ws_route)
        .with(cors);

    println!("🌐 Web server starting on http://localhost:3001");
    println!("📡 WebSocket endpoint: ws://localhost:3001/ws");
    println!("🔗 API endpoints:");
    println!("   GET /api/tokens - List all tokens");
    println!("   GET /api/summaries - Get all token summaries");
    println!("   GET /api/token/<address> - Get specific token summary");
    println!("   GET /api/history/<address> - Get historical price/RSI data");
    println!("⚠️  Note: RSI values will appear after {} trades per token", 14 + 1);

    // Start web server
    let server_task = tokio::spawn(async move {
        warp::serve(routes)
            .run(([0, 0, 0, 0], 3001))
            .await;
    });

    // Wait for both tasks
    tokio::select! {
        _ = kafka_task => println!("Kafka task completed"),
        _ = server_task => println!("Server task completed"),
    }

    Ok(())
}