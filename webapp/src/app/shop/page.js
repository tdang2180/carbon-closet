"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Gift, Recycle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function ShopPage() {
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token conversion rate (example: $1 = 2 tokens)
  const tokenConversionRate = 10;

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().item,
          price: `$${doc.data().price}`,
          image: doc.data().imageUrl,
          size: doc.data().size,
          gender: doc.data().gender
        }));
        setClothingItems(items);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching listings:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up listener:", err);
      setError("Failed to load products. Please try again later.");
      setLoading(false);
    }
  }, []);

  // Function to convert price string to tokens
  const convertToTokens = (priceStr) => {
    // Extract the numeric value from price string (e.g. "$20" -> 20)
    const priceValue = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
    if (isNaN(priceValue)) return "N/A";
    return Math.round(priceValue * tokenConversionRate);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Placeholder data with dummy images that will definitely exist
  const placeholderItems = [
    { id: 1, name: "Men's T-Shirt", price: "$20", image: "https://via.placeholder.com/300x400?text=T-Shirt" },
    { id: 2, name: "Women's Dress", price: "$35", image: "https://via.placeholder.com/300x400?text=Dress" },
    { id: 3, name: "Wrist Watch", price: "$50", image: "https://via.placeholder.com/300x400?text=Watch" },
    { id: 4, name: "Men's Jacket", price: "$60", image: "https://via.placeholder.com/300x400?text=Jacket" },
    { id: 5, name: "Women's Shoes", price: "$45", image: "https://via.placeholder.com/300x400?text=Shoes" },
    { id: 6, name: "Hat", price: "$15", image: "https://via.placeholder.com/300x400?text=Hat" },
  ];

  // If no real items, use placeholders
  const displayItems = clothingItems.length > 0 ? clothingItems : placeholderItems;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Shop Clothing</h1>
        
        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <Link href="/donate">
            <button className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Recycle className="w-5 h-5 mr-2" />
              Donate Items
            </button>
          </Link>
          <Link href="/">
            <button className="flex items-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Gift className="w-5 h-5 mr-2" />
              Purchase Packs
            </button>
          </Link>
        </div>
      </div>
      
      {clothingItems.length === 0 && (
        <p className="text-gray-500 mb-6">No items available right now. Be the first to donate!</p>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="w-full h-48 relative">
              {/* Handle invalid image URLs gracefully */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x400?text=No+Image";
                }}
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
              <div className="flex justify-between mt-1">
                <div>
                  <p className="text-gray-600">{item.price}</p>
                  <p className="text-yellow-600 font-medium text-sm">
                    {convertToTokens(item.price)} tokens
                  </p>
                </div>
                {item.size && (
                  <p className="text-gray-600">Size: {item.size}</p>
                )}
              </div>
              {item.gender && (
                <p className="text-gray-500 text-sm mt-1">
                  {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
                </p>
              )}
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}