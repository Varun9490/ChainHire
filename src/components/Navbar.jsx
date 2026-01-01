"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const wallet = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    
    // Check if we're on the client side
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/");
    if (wallet.connected) {
      wallet.disconnect();
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-4 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold">ChainHire</Link>
        <div className="space-x-4 md:space-x-6 flex items-center">
          {!isAuthenticated && isClient && (
            <>
              <Link href="#features" className="hover:underline hidden md:inline">
                Features
              </Link>
              <Link href="#how-it-works" className="hover:underline hidden md:inline">
                How it works
              </Link>
              <Link href="#testimonials" className="hover:underline hidden md:inline">
                Testimonials
              </Link>
              <Link
                href="/auth"
                className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
              >
                Login
              </Link>
            </>
          )}
          
          {isAuthenticated && isClient && (
            <>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              {wallet.connected ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-purple-700 border-purple-500 text-white"
                  onClick={() => wallet.disconnect()}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {wallet.publicKey.toString().slice(0, 4)}...{wallet.publicKey.toString().slice(-4)}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-purple-700 border-purple-500 text-white"
                  onClick={() => wallet.connect()}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              )}
              <Button
                variant="outline"
                className="bg-white text-black hover:bg-gray-200"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
