import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface TokenSelectorProps {
  tokens: string[];
  selectedToken: string | null;
  onTokenSelect: (token: string) => void;
  isConnected?: boolean;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  isConnected = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatTokenDisplay = (token: string) => {
    return `${token.slice(0, 8)}...${token.slice(-4)}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTokenSelect = (token: string) => {
    onTokenSelect(token);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="token-selector" className="text-xs uppercase tracking-wide text-[--color-muted-foreground] font-medium">
          Select Token
        </label>
        {isConnected && (
          <div className="flex items-center gap-1 text-xs text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Auto-discovering • {tokens.length} tokens
          </div>
        )}
      </div>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="card h-10 w-full px-3 pr-8 text-sm text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:opacity-80 transition-all"
        >
          {selectedToken ? formatTokenDisplay(selectedToken) : "Select a token..."}
        </button>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className={`h-4 w-4 text-[--color-muted-foreground] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        
        {isOpen && (
          <div className="card absolute z-50 mt-1 w-full rounded-lg shadow-lg max-h-60 overflow-auto p-0">
            {tokens.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[--color-muted-foreground]">
                No tokens available. Ensure the RSI calculator is running.
              </div>
            ) : (
              <>
                {tokens.map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => handleTokenSelect(token)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors ${
                      token === selectedToken ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {formatTokenDisplay(token)}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
      {tokens.length === 0 && !isOpen && (
        <p className="text-xs text-[--color-muted-foreground]">
          No tokens available. Ensure the RSI calculator is running.
        </p>
      )}
    </div>
  );
};