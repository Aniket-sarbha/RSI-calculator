import csv
import json
import time
from kafka import KafkaProducer
from datetime import datetime
import sys

def create_producer():
    return KafkaProducer(
        bootstrap_servers=['localhost:19092'],
        value_serializer=lambda x: json.dumps(x).encode('utf-8')
    )

def safe_float_convert(value):
    """Safely convert string to float, return 0.0 if empty or invalid"""
    if not value or value.strip() == '':
        return 0.0
    try:
        return float(value)
    except ValueError:
        return 0.0

def safe_int_convert(value):
    """Safely convert string to int, return 0 if empty or invalid"""
    if not value or value.strip() == '':
        return 0
    try:
        return int(value)
    except ValueError:
        return 0

def ingest_csv_data(csv_file_path):
    try:
        producer = create_producer()
        print(f"Connected to Redpanda. Starting to ingest data from {csv_file_path}")
        
        with open(csv_file_path, 'r') as file:
            csv_reader = csv.DictReader(file)
            
            for i, row in enumerate(csv_reader):
                # Convert all fields with proper type handling
                trade_message = {
                    # Basic trade info
                    'block_time': row['block_time'],
                    'transaction_signature': row['transaction_signature'],
                    'block_num': safe_int_convert(row['block_num']),
                    'program_id': row['program_id'],
                    'trade_type': row['trade_type'],
                    'wallet_address': row['wallet_address'],
                    'token_address': row['token_address'],
                    'is_buy': row['is_buy'].lower() == 'true' if row['is_buy'] else False,
                    
                    # Amounts and prices
                    'amount_in_sol': safe_float_convert(row['amount_in_sol']),
                    'amount_in_token': safe_float_convert(row['amount_in_token']),
                    'change_in_sol': safe_float_convert(row['change_in_sol']),
                    'change_in_tokens': safe_float_convert(row['change_in_tokens']),
                    'price_in_sol': safe_float_convert(row['price_in_sol']),
                    
                    # Reserves
                    'virtual_sol_reserves': safe_float_convert(row['virtual_sol_reserves']),
                    'virtual_token_reserves': safe_float_convert(row['virtual_token_reserves']),
                    'real_sol_reserves': safe_float_convert(row['real_sol_reserves']),
                    'real_token_reserves': safe_float_convert(row['real_token_reserves']),
                    
                    # Fee information
                    'fee_recipient': row['fee_recipient'],
                    'fee_basis_points': safe_int_convert(row['fee_basis_points']),
                    'fee_amount': safe_float_convert(row['fee_amount']),
                    'creator_address': row['creator_address'],
                    'creator_fee_basis_points': safe_int_convert(row['creator_fee_basis_points']),
                    'creator_fee_amount': safe_float_convert(row['creator_fee_amount']),
                    
                    # Timestamps
                    'ingested_at': row['ingested_at'],
                    'processed_at': datetime.now().isoformat()
                }
                
                # Send to trade-data topic
                producer.send('trade-data', value=trade_message)
                
                # More detailed logging
                token_short = trade_message['token_address'][:8] + '...' if len(trade_message['token_address']) > 8 else trade_message['token_address']
                trade_type = "BUY" if trade_message['is_buy'] else "SELL"
                
                print(f"Sent trade #{i+1}: {trade_type} {token_short} - Price: {trade_message['price_in_sol']:.8f} SOL - Amount: {trade_message['amount_in_sol']:.6f} SOL")
                
                # Small delay to simulate real-time streaming
                time.sleep(0.05)  # Reduced delay for faster processing
        
        producer.flush()
        producer.close()
        print(f"\nData ingestion completed! Processed {i+1} trades.")
        print("Check the Redpanda Console to see messages in the trade-data topic.")
        print("Console URL: http://localhost:8080")
        
    except FileNotFoundError:
        print(f"Error: Could not find {csv_file_path}")
        print("Make sure the CSV file is in the same directory as this script.")
    except Exception as e:
        print(f"Error during ingestion: {e}")

def preview_csv_data(csv_file_path, num_rows=3):
    """Preview the first few rows of CSV data"""
    try:
        with open(csv_file_path, 'r') as file:
            csv_reader = csv.DictReader(file)
            print(f"Preview of {csv_file_path}:")
            print("=" * 50)
            
            for i, row in enumerate(csv_reader):
                if i >= num_rows:
                    break
                print(f"Row {i+1}:")
                for key, value in row.items():
                    if value and len(str(value)) > 50:
                        value = str(value)[:47] + "..."
                    print(f"  {key}: {value}")
                print()
                
    except Exception as e:
        print(f"Error previewing file: {e}")

if __name__ == "__main__":
    csv_file = 'trades_data.csv'
    
    if len(sys.argv) > 1:
        if sys.argv[1] == 'preview':
            preview_csv_data(csv_file)
            sys.exit()
        else:
            csv_file = sys.argv[1]
    
    # First show a preview
    print("Data Preview:")
    preview_csv_data(csv_file, 2)
    
    # Ask for confirmation
    response = input("\nProceed with ingestion? (y/N): ")
    if response.lower() in ['y', 'yes']:
        ingest_csv_data(csv_file)
    else:
        print("Ingestion cancelled.")