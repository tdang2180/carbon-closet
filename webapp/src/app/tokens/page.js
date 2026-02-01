"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import { useTokens } from "@/contexts/tokenContext"; // Import our token hook
import { motion } from "@/components/ui/motion"; // Import for animation

const bundles = [
  { id: 1, tokens: 50, price: "$5" },
  { id: 2, tokens: 100, price: "$9" },
  { id: 3, tokens: 250, price: "$20" },
  { id: 4, tokens: 500, price: "$35" },
];

export default function BuyTokensPage() {
  // Get token balance and addTokens function from context
  const { tokenBalance, addTokens } = useTokens();
  
  // State for purchase success message
  const [successMessage, setSuccessMessage] = useState("");

  const handlePurchase = (tokens) => {
    // Add tokens to balance using context function
    addTokens(tokens);
    
    // Show success message briefly
    setSuccessMessage(`Successfully purchased ${tokens} tokens!`);
    setTimeout(() => setSuccessMessage(""), 3000); // Clear after 3 seconds
  };

  return (
    <div className="p-6 w-full mx-auto max-w-4xl">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Coins className="w-8 h-8 text-yellow-500" /> Buy Tokens
      </h1>

      {/* Current Token Balance */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <p className="text-lg text-gray-700">
          Current Balance: <span className="font-bold">{tokenBalance} Tokens</span>
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg shadow-md"
        >
          {successMessage}
        </motion.div>
      )}

      {/* Token Bundles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center"
          >
            <p className="text-lg font-bold text-gray-800">{bundle.tokens} Tokens</p>
            <p className="text-gray-600 mb-4">{bundle.price}</p>
            <button
              onClick={() => handlePurchase(bundle.tokens)}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}