"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [purchaseHistory] = useState([
    { id: 1, item: "Men's T-Shirt", date: "2025-04-01", price: "$20" },
    { id: 2, item: "Women's Dress", date: "2025-03-15", price: "$35" },
  ]);

  const [shippingAddress] = useState({
    name: "John Doe",
    address: "123 Main Street, Springfield, USA",
    phone: "+1 234 567 890",
  });

  const [donatedClothesHistory] = useState([
    { id: 1, item: "Winter Jacket", date: "2025-02-10" },
    { id: 2, item: "Sneakers", date: "2025-01-25" },
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile</h1>

      {/* Shipping Address */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Shipping Address</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-800"><strong>Name:</strong> {shippingAddress.name}</p>
          <p className="text-gray-800"><strong>Address:</strong> {shippingAddress.address}</p>
          <p className="text-gray-800"><strong>Phone:</strong> {shippingAddress.phone}</p>
        </div>
      </div>

      {/* Purchase History */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Purchase History</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          {purchaseHistory.length > 0 ? (
            <ul className="space-y-4">
              {purchaseHistory.map((purchase) => (
                <li key={purchase.id} className="flex justify-between">
                  <span>{purchase.item}</span>
                  <span>{purchase.date}</span>
                  <span>{purchase.price}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No purchase history available.</p>
          )}
        </div>
      </div>

      {/* Donated Clothes History */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Donated Clothes History</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          {donatedClothesHistory.length > 0 ? (
            <ul className="space-y-4">
              {donatedClothesHistory.map((donation) => (
                <li key={donation.id} className="flex justify-between">
                  <span>{donation.item}</span>
                  <span>{donation.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No donation history available.</p>
          )}
        </div>
      </div>
    </div>
  );
}