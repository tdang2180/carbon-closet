'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import './pack-animations.css';
import { useTokens } from "@/contexts/tokenContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function OpenPack() {
  // Number of rerolls allowed per pack

  const { addTokens } = useTokens;  
  const MAX_REROLLS = 1;
  const [packOpened, setPackOpened] = useState(false);
  const [packAnimating, setPackAnimating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [showAllCards, setShowAllCards] = useState(false);
  const [direction, setDirection] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rerollsLeft, setRerollsLeft] = useState(MAX_REROLLS);
  const [isRerolling, setIsRerolling] = useState(false);
  const [allListings, setAllListings] = useState([]);
  const [convertedItems, setConvertedItems] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const packRef = useRef(null);

  // Reference to keep track of used rerolls per item (to show visual indicator)
  const [rerolledItems, setRerolledItems] = useState([]);
  
  // Reset all states when pack is opened
  const resetStates = () => {
    setRerollsLeft(MAX_REROLLS);
    setRerolledItems([]);
    setConvertedItems([]);
    setTotalTokens(0);
  };
  
  // Minimum swipe distance required (in px)
  const minSwipeDistance = 50;
  
  // Define rarity mapping based on price ranges
  const getRarityFromPrice = (price) => {
    const numericPrice = typeof price === 'string' 
      ? parseFloat(price.replace(/[^0-9.-]+/g, ""))
      : price;
    
    if (isNaN(numericPrice)) return 'common';
    
    if (numericPrice >= 100) return 'legendary';
    if (numericPrice >= 60) return 'epic';
    if (numericPrice >= 30) return 'rare';
    if (numericPrice >= 15) return 'uncommon';
    return 'common';
  };
  
  // Define token values based on rarity
  const getTokenValueFromRarity = (rarity) => {
    switch (rarity) {
      case 'legendary': return 50;
      case 'epic': return 30;
      case 'rare': return 15;
      case 'uncommon': return 10;
      default: return 5;
    }
  };
  
  // Fetch listings from the backend
  useEffect(() => {
    try {
      setLoading(true);
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().item,
          price: `$${doc.data().price}`,
          image: doc.data().imageUrl,
          size: doc.data().size,
          gender: doc.data().gender
        }));
        
        if (data.length === 0) {
          throw new Error("No listings available");
        }
        
        // Store all listings for potential rerolls
        setAllListings(data);
        
        // Randomly select 5 items
        let selectedItems = [];
        if (data.length <= 5) {
          selectedItems = [...data];
        } else {
          // Shuffle array and take the first 5
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          selectedItems = shuffled.slice(0, 5);
        }
        
        // Format the items to match the expected card structure
        const formattedCards = selectedItems.map(item => {
          const rarity = getRarityFromPrice(item.price);
          return {
            id: item.id,
            rarity: rarity,
            name: item.name || 'Unknown Item',
            image: item.image || '/placeholder.jpg',
            tokenValue: getTokenValueFromRarity(rarity),
            size: item.size || '',
            gender: item.gender || ''
          };
        });
        
        setCards(formattedCards);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching listings:", err);
        setError(err.message || "Failed to load items. Please try again later.");
        
        // Fallback to example cards if there was an error
        setCards([
          { id: 1, rarity: 'common', name: 'Basic T-Shirt', image: '/images/tshirt.jpg', tokenValue: 5 },
          { id: 2, rarity: 'rare', name: 'Designer Dress', image: '/images/dress.jpg', tokenValue: 15 },
          { id: 3, rarity: 'epic', name: 'Luxury Watch', image: '/images/watch.jpg', tokenValue: 30 },
          { id: 4, rarity: 'uncommon', name: 'Vintage Jacket', image: '/images/jacket.jpg', tokenValue: 10 },
          { id: 5, rarity: 'legendary', name: 'Limited Edition Shoes', image: '/images/shoes.jpg', tokenValue: 50 },
        ]);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up listener:", err);
      setError("Failed to load items. Please try again later.");
      setLoading(false);
    }
  }, []);

  const openPack = () => {
    if (packAnimating || loading) return;
    
    setPackAnimating(true);
    
    // Add opening class to start animation
    if (packRef.current) {
      packRef.current.classList.add('opening');
    }
    
    // Wait for animation to complete before showing cards
    setTimeout(() => {
      setPackOpened(true);
      setPackAnimating(false);
    }, 1500); // Animation duration
  };

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setDirection('right');
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1);
      }, 300);
    } else {
      // Reached the end of the cards
      setShowAllCards(true);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setDirection('left');
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex - 1);
      }, 300);
    }
  };
  
  // Reset direction after animation completes
  useEffect(() => {
    if (direction) {
      const timer = setTimeout(() => {
        setDirection(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [direction]);
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextCard();
    }
    if (isRightSwipe) {
      prevCard();
    }
  };
  
  // Function to convert an item to tokens
  const convertItemToTokens = async (index) => {
    if (convertedItems.includes(index) || isConverting) return;
    
    setIsConverting(true);
    
    try {
      // Get the token value of the item
      const itemTokenValue = cards[index].tokenValue;
      
      // Add a small delay to make the conversion feel more substantial
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Add the token value to the total tokens
      setTotalTokens(prev => prev + itemTokenValue);
      
      // add tokens to the global token balance using context

      // Mark the item as converted
      setConvertedItems(prev => [...prev, index]);
      
      // Update the card's rarity to 'converted'
      const updatedCards = [...cards];
      updatedCards[index] = {
        ...updatedCards[index],
        originalRarity: updatedCards[index].rarity, // Store original rarity
        rarity: 'converted'
      };
      setCards(updatedCards);
      
      // In a real app, you would make an API call to update the user's token balance
      // For example:
      // await fetch('/api/convert-item', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ itemId: cards[index].id, tokenValue: itemTokenValue })
      // });
      
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Failed to convert item to tokens. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };
  
  // Function to reroll a specific item
  const rerollItem = async (index) => {
    // Don't allow rerolling if no rerolls left or already rerolling
    if (rerollsLeft <= 0 || isRerolling) return;
    
    setIsRerolling(true);
    
    try {
      // Check if we have enough items to reroll
      if (allListings.length <= 1) {
        throw new Error("Not enough items available for reroll");
      }
      
      // Filter out items that are already in the pack to avoid duplicates
      const currentIds = cards.map(card => card.id);
      const availableItems = allListings.filter(item => !currentIds.includes(item.id));
      
      // If no unique items are available, allow duplicates
      const rerollPool = availableItems.length > 0 ? availableItems : allListings.filter(item => item.id !== cards[index].id);
      
      if (rerollPool.length === 0) {
        throw new Error("No items available for reroll");
      }
      
      // Get a random item from the available pool
      const randomIndex = Math.floor(Math.random() * rerollPool.length);
      const newItem = rerollPool[randomIndex];
      
      // Format the new item
      const rarity = getRarityFromPrice(newItem.price);
      const formattedItem = {
        id: newItem.id,
        rarity: rarity,
        name: newItem.name || 'Unknown Item',
        image: newItem.image || '/placeholder.jpg',
        tokenValue: getTokenValueFromRarity(rarity),
        size: newItem.size || '',
        gender: newItem.gender || ''
      };
      
      // Create a new cards array with the rerolled item
      const newCards = [...cards];
      newCards[index] = formattedItem;
      
      // Add a small delay to make the reroll feel more substantial
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the cards and decrement rerolls
      setCards(newCards);
      setRerollsLeft(prevRerolls => prevRerolls - 1);
      
      // Add index to rerolled items list for visual indicator
      setRerolledItems(prev => [...prev, index]);
      
    } catch (err) {
      console.error("Reroll error:", err);
      alert(err.message || "Failed to reroll. Please try again.");
    } finally {
      setIsRerolling(false);
    }
  };

  // Define rarity colors
  const rarityColors = {
    common: 'bg-gray-400',
    uncommon: 'bg-green-400',
    rare: 'bg-blue-400',
    epic: 'bg-purple-400',
    legendary: 'bg-yellow-400',
    converted: 'bg-gray-500' // Add converted color
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pack contents...</p>
        </div>
      </div>
    );
  }

  if (error && !packOpened && cards.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <p className="mb-4">No items are available to open in packs right now.</p>
          <Link href="/shop">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center mx-auto">
              <Home className="w-5 h-5 mr-2" />
              Return to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {!packOpened ? (
        // Pack opening screen
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Open Your Pack</h1>
          
          {/* Pack animation */}
          <div className="pack-container">
            <div 
              ref={packRef}
              className="pack"
              onClick={() => !packAnimating && openPack()}
            >
              <div className="pack-front">
                <div className="pack-shine"></div>
                <div className="pack-logo">
                  <div>CARBON</div>
                  <div>CLOSET</div>
                  <div className="text-sm mt-2">Premium Pack</div>
                </div>
              </div>
              <div className="pack-back">
                <div className="text-white text-center text-lg">
                  <div className="mb-2">✨</div>
                  <div>Opening...</div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="mt-6 text-center text-gray-600">
            Contains {cards.length} random clothing items with different rarities
          </p>
          
          <button 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mx-auto block"
            onClick={openPack}
            disabled={packAnimating}
          >
            {packAnimating ? 'Opening...' : 'Click to Open'}
          </button>
        </div>
      ) : showAllCards ? (
        // Show all cards screen after viewing individually
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Your Collection Items</h1>
          
          {totalTokens > 0 && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-6 text-center">
              <p className="text-yellow-800">
                <span className="font-bold">Tokens earned:</span> {totalTokens}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
              <div 
                key={card.id} 
                className={`card-reveal w-full bg-white rounded-lg shadow-md overflow-hidden ${
                  card.rarity === 'converted' ? 'rarity-converted' :
                  card.rarity === 'legendary' ? 'rarity-legendary' : 
                  card.rarity === 'epic' ? 'rarity-epic' : 
                  card.rarity === 'rare' ? 'rarity-rare' : 
                  card.rarity === 'uncommon' ? 'rarity-uncommon' : 
                  'rarity-common'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-2 ${rarityColors[card.rarity]}`}></div>
                {rerolledItems.includes(index) && card.rarity !== 'converted' && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    Rerolled
                  </div>
                )}
                <div className="p-3">
                  <div className="relative">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="w-full h-40 object-cover rounded-md mb-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x400?text=No+Image";
                      }}
                    />
                    {card.rarity === 'legendary' && <div className="card-shine"></div>}
                  </div>
                  <h2 className="text-sm font-semibold truncate">{card.name}</h2>
                  {card.size && <p className="text-xs text-gray-500">Size: {card.size}</p>}
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full capitalize text-white ${rarityColors[card.rarity === 'converted' ? (card.originalRarity || 'common') : card.rarity]}`}>
                      {card.rarity === 'converted' ? (card.originalRarity || 'common') : card.rarity}
                    </span>
                    <span className="text-yellow-600 font-bold text-xs">
                      {card.rarity === 'converted' ? 'Converted' : `${card.tokenValue} tokens`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/shop">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Back to Shop
              </button>
            </Link>
          </div>
        </div>
      ) : (
        // Card swipe view
        <div className="w-full max-w-xs">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Card {currentCardIndex + 1} of {cards.length}
          </h1>
          
          <div 
            className="swipe-container card-container"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div 
              className={`card-reveal ${
                cards[currentCardIndex]?.rarity === 'legendary' ? 'card-glow' : ''
              } ${
                direction === 'left' ? 'card-swipe-left' : 
                direction === 'right' ? 'card-swipe-right' : ''
              }`}
            >
              <div className={`w-full bg-white rounded-xl shadow-xl overflow-hidden relative ${
                cards[currentCardIndex]?.rarity === 'converted' ? 'rarity-converted' :
                cards[currentCardIndex]?.rarity === 'legendary' ? 'rarity-legendary' : 
                cards[currentCardIndex]?.rarity === 'epic' ? 'rarity-epic' : 
                cards[currentCardIndex]?.rarity === 'rare' ? 'rarity-rare' : 
                cards[currentCardIndex]?.rarity === 'uncommon' ? 'rarity-uncommon' : 
                'rarity-common'
              }`}>
                <div className={`h-3 ${rarityColors[cards[currentCardIndex]?.rarity === 'converted' ? (cards[currentCardIndex]?.originalRarity || 'common') : cards[currentCardIndex]?.rarity]}`}></div>
                <div className="p-4">
                  <div className="relative">
                    <img 
                      src={cards[currentCardIndex]?.image} 
                      alt={cards[currentCardIndex]?.name} 
                      className="w-full h-72 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x400?text=No+Image";
                      }}
                    />
                    <div className="card-shine"></div>
                  </div>
                  
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-bold mb-2">{cards[currentCardIndex]?.name}</h2>
                    
                    {cards[currentCardIndex]?.size && (
                      <p className="text-gray-600 mb-2">Size: {cards[currentCardIndex].size}</p>
                    )}
                    
                    {cards[currentCardIndex]?.gender && (
                      <p className="text-gray-600 mb-2">
                        {cards[currentCardIndex].gender.charAt(0).toUpperCase() + cards[currentCardIndex].gender.slice(1)}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-sm font-medium px-3 py-1 rounded-full text-white capitalize ${rarityColors[cards[currentCardIndex]?.rarity === 'converted' ? (cards[currentCardIndex]?.originalRarity || 'common') : cards[currentCardIndex]?.rarity]}`}>
                        {cards[currentCardIndex]?.rarity === 'converted' 
                          ? (cards[currentCardIndex]?.originalRarity || 'common')
                          : cards[currentCardIndex]?.rarity}
                      </span>
                      <span className="text-yellow-600 font-bold text-lg">
                        {cards[currentCardIndex]?.rarity === 'converted' 
                          ? 'Converted' 
                          : `${cards[currentCardIndex]?.tokenValue} tokens`}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 mt-4">
                      <button
                        onClick={() => rerollItem(currentCardIndex)}
                        disabled={rerollsLeft <= 0 || isRerolling || convertedItems.includes(currentCardIndex)}
                        className={`w-full py-2 rounded-lg flex items-center justify-center transition-colors ${
                          rerollsLeft > 0 && !isRerolling && !convertedItems.includes(currentCardIndex)
                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isRerolling ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Rerolling...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            Reroll ({rerollsLeft} left)
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => convertItemToTokens(currentCardIndex)}
                        disabled={isConverting || convertedItems.includes(currentCardIndex)}
                        className={`w-full py-2 rounded-lg flex items-center justify-center transition-colors ${
                          !isConverting && !convertedItems.includes(currentCardIndex)
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isConverting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Converting...
                          </>
                        ) : convertedItems.includes(currentCardIndex) ? (
                          "Converted to Tokens"
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Convert to {cards[currentCardIndex]?.tokenValue} Tokens
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Touch swipe indicators */}
          <div className="relative mt-6">
            <div className="flex justify-between w-72 mx-auto">
              <button
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className={`p-3 rounded-full ${
                  currentCardIndex === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={nextCard}
                className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Swipe instructions */}
            <p className="text-center text-gray-500 text-sm mt-4">
              Swipe left or right to navigate
            </p>
          </div>
          
          {/* View all button */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setShowAllCards(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center mx-auto"
            >
              View All Items
            </button>
            
            <div className="flex justify-between text-sm text-gray-600 px-1">
              <p>Rerolls: {rerollsLeft}/{MAX_REROLLS}</p>
              <p>Tokens earned: <span className="text-yellow-600 font-medium">{totalTokens}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}