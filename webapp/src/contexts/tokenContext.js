'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Create a context for token balance
const TokenContext = createContext({
  tokenBalance: 0,
  addTokens: () => {},
  subtractTokens: () => {},
});

export const TokenProvider = ({ children }) => {
  // Initialize token balance from localStorage if available (client-side only)
  const [tokenBalance, setTokenBalance] = useState(0);
  
  // Load token balance from localStorage on component mount
  useEffect(() => {
    const storedBalance = localStorage.getItem('tokenBalance');
    if (storedBalance) {
      setTokenBalance(parseInt(storedBalance, 10));
    } else {
      // Default starting balance
      setTokenBalance(100);
      localStorage.setItem('tokenBalance', '100');
    }
  }, []);

  // Function to add tokens
  const addTokens = (amount) => {
    setTokenBalance(prev => {
      const newBalance = prev + amount;
      // Save to localStorage
      localStorage.setItem('tokenBalance', newBalance.toString());
      return newBalance;
    });
  };

  // Function to subtract tokens
  const subtractTokens = (amount) => {
    setTokenBalance(prev => {
      const newBalance = Math.max(0, prev - amount); // Prevent negative balance
      // Save to localStorage
      localStorage.setItem('tokenBalance', newBalance.toString());
      return newBalance;
    });
  };

  return (
    <TokenContext.Provider value={{ tokenBalance, addTokens, subtractTokens }}>
      {children}
    </TokenContext.Provider>
  );
};

// Custom hook to use the token context
export const useTokens = () => useContext(TokenContext);