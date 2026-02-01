"use client";

import { useState } from "react";

const initialCartItems = [
  { id: 1, name: "Men's T-Shirt", price: 20, quantity: 1 },
  { id: 2, name: "Women's Dress", price: 35, quantity: 2 },
  { id: 3, name: "Wrist Watch", price: 50, quantity: 1 },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const handleQuantityChange = (id, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      {/* Cart Items */}
      {cartItems.length > 0 ? (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md"
            >
              <div>
                <p className="text-lg font-semibold text-gray-800">{item.name}</p>
                <p className="text-gray-600">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                  className="w-16 p-2 border rounded-lg text-center"
                />
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Your cart is empty.</p>
      )}

      {/* Total Price */}
      {cartItems.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md">
          <p className="text-lg font-bold text-gray-800">
            Total: ${calculateTotal().toFixed(2)}
          </p>
          <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}