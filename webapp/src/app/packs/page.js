'use client';

import { useRouter } from 'next/navigation';
import { Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTokens } from '@/contexts/tokenContext'; // Import our token hook
import { useState } from 'react';

const packTypes = [
  { 
    id: 'standard', 
    name: 'Standard Pack', 
    cardCount: 5, 
    description: 'Contains 5 random items with at least one rare or better item guaranteed.', 
    price: 100, // Changed to number
    color: 'bg-blue-500'
  },
  { 
    id: 'premium', 
    name: 'Premium Pack', 
    cardCount: 5, 
    description: 'Contains 5 random items with at least one epic or better item guaranteed.', 
    price: 250, // Changed to number
    color: 'bg-purple-500'
  },
  { 
    id: 'ultimate', 
    name: 'Ultimate Pack', 
    cardCount: 5, 
    description: 'Contains 5 random items with one legendary item guaranteed.', 
    price: 500, // Changed to number
    color: 'bg-yellow-500'
  }
];

export default function PacksPage() {
  const router = useRouter();
  const { tokenBalance, subtractTokens } = useTokens(); // Get token balance and subtractTokens function
  const [error, setError] = useState('');
  
  const handleOpenPack = (packId) => {
    // Find the selected pack
    const selectedPack = packTypes.find(pack => pack.id === packId);
    
    // Check if user has enough tokens
    if (tokenBalance < selectedPack.price) {
      setError(`You don't have enough tokens to purchase this pack. You need ${selectedPack.price} tokens.`);
      // Clear error after 3 seconds
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Deduct tokens for the pack purchase
    subtractTokens(selectedPack.price);
    
    // Store pack type in sessionStorage to use in the opening page
    sessionStorage.setItem('openedPackType', packId);
    
    // Redirect to pack opening page
    router.push('/packs/open');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Item Packs</h1>
          <p className="text-lg text-gray-600">Select a pack to open and discover exclusive clothing items!</p>
          <p className="mt-2 text-md font-medium">Your balance: <span className="text-blue-600">{tokenBalance} Tokens</span></p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-md text-center">
            {error}
          </div>
        )}
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packTypes.map((pack) => (
            <div
              key={pack.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 transition-transform duration-300"
            >
              <div className={`h-2 ${pack.color}`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Package className={`w-6 h-6 ${pack.id === 'ultimate' ? 'text-yellow-500' : pack.id === 'premium' ? 'text-purple-500' : 'text-blue-500'}`} />
                  <h2 className="text-xl font-bold ml-2">{pack.name}</h2>
                </div>
                
                <p className="text-gray-600 mb-6">{pack.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{pack.price} Tokens</span>
                  <button
                    onClick={() => handleOpenPack(pack.id)}
                    className={`px-4 py-2 rounded-lg text-white flex items-center ${
                      tokenBalance < pack.price 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : pack.id === 'ultimate' 
                          ? 'bg-yellow-500 hover:bg-yellow-600' 
                          : pack.id === 'premium' 
                            ? 'bg-purple-500 hover:bg-purple-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    disabled={tokenBalance < pack.price}
                  >
                    {tokenBalance < pack.price ? 'Not Enough Tokens' : 'Open Pack'}
                    {tokenBalance >= pack.price && <ArrowRight className="w-4 h-4 ml-2" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center gap-8">
          <Link href="/tokens">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
              Buy More Tokens
            </button>
          </Link>
          <Link href="/donate">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
              Donate Clothes
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}