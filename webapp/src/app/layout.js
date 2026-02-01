import { Geist } from "next/font/google";
import "./globals.css";
import { TokenProvider } from "@/contexts/tokenContext"; // Import our TokenProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

import AppBar from "@/components/ui/appbar"; // Import the AppBar component

export const metadata = {
  title: "Carbon Closet",
  description: "Shop the best clothing and accessories",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="bg-gray-50">
        {/* Wrap the entire app with TokenProvider */}
        <TokenProvider>
          {/* AppBar is always displayed */}
          <AppBar />
          {/* Render the page content */}
          <main className="p-6">{children}</main>
        </TokenProvider>
      </body>
    </html>
  );
}