"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

const products = [
  { id: 1, name: "Men's T-Shirt", category: "Men's Clothing", icon: <span>👕</span> },
  { id: 2, name: "Women's Dress", category: "Women's Clothing", icon: <span>👗</span> },
  { id: 3, name: "Wrist Watch", category: "Accessories", icon: <span>⌚</span> },
];

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter(); // Initialize the router

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOptionClick = (name) => {
    setSearchQuery(name); // Fill the search bar with the selected item's name
    setIsFocused(false); // Close the dropdown
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`); // Navigate to the shop page with the search query
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search for clothing, accessories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        onKeyDown={handleKeyDown} // Handle Enter key press
        className="rounded-lg border shadow-md w-full p-2"
      />

      {/* Dropdown Menu */}
      {isFocused && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50">
          <ul>
            {searchQuery === "" ? (
              <li className="p-2 text-gray-500">Type to search for products...</li>
            ) : filteredProducts.length === 0 ? (
              <li className="p-2 text-gray-500">No results found.</li>
            ) : (
              filteredProducts.map((product) => (
                <li
                  key={product.id}
                  className="p-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOptionClick(product.name)} // Handle click
                >
                  {product.icon}
                  <span>{product.name}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}