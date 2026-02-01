"use client";
import SearchBar from "./searchbar";
import { User, ShoppingCart, Coins } from "lucide-react";
import Link from "next/link";
import { useTokens } from "@/contexts/tokenContext"; // Import our token hook

export default function AppBar() {
  // Get the token balance from context
  const { tokenBalance } = useTokens();

  return (
    <div className="w-full bg-gray-100 shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        {/* App Name */}
        <Link href="/">
          <h1 className="text-3xl font-bold text-gray-800 cursor-pointer hover:underline">
            Carbon Closet
          </h1>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 mx-7">
          <SearchBar className="h-20 text-lg px-4"/>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          {/* Token Balance - Now displays the dynamic token balance */}
          <div className="flex flex-col items-center">
            <Link href="/tokens">
              <button className="p-2 rounded-full hover:bg-gray-200">
                <Coins className="w-5 h-5" /> {/* Coin Icon */}
              </button>
            </Link>
            <span className="text-sm text-gray-600">{tokenBalance} Tokens</span> {/* Dynamic value */}
          </div>
          <Link href="/profile">
            <button className="p-2 rounded-full hover:bg-gray-200">
              <User className="w-8 h-8 text-gray-800" />
            </button>
          </Link>
          {/* Bag Icon */}
          <Link href="/cart">
            <button className="p-2 rounded-full hover:bg-gray-200">
              <ShoppingCart className="w-8 h-8 text-gray-800" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}