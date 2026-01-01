"use client";

import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null); // This will be a string
  const [balance, setBalance] = useState(10.0);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true);
    toast.loading("Connecting wallet...", { id: "connect" });
    setTimeout(() => {
      setConnected(true);
      // This is a string, not a PublicKey object
      setPublicKey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
      setBalance(10.0);
      setLoading(false);
      toast.success("Wallet connected!", { id: "connect" });
    }, 1500);
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKey(null);
    setBalance(0);
    toast.success("Wallet disconnected!");
  };

  // ✅ ADDED: Mock sendTransaction function to simulate a real transaction
  const sendTransaction = async (transaction, connection) => {
    console.log("Simulating transaction send:", transaction);
    setLoading(true);
    toast.loading("Simulating transaction...", { id: "tx" });

    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        toast.success("Transaction successful!", { id: "tx" });
        // Return a fake signature
        resolve(
          "5fJpGngiFNBsVky2d1v1T1h8iCRaZ8Xb3zHj6a9KqL2jVn7yWb8pZc3Ea1dGfHj5kLgYpX"
        );
      }, 2000);
    });
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connect,
        disconnect,
        publicKey,
        balance,
        loading,
        sendTransaction, // ✅ EXPORT THE NEW FUNCTION
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
