"use client";

import { createContext, useContext, useState } from "react";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  // Demo wallet state
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(10.0);
  const [loading, setLoading] = useState(false);

  // Demo connect/disconnect
  const connect = async () => {
    setLoading(true);
    setTimeout(() => {
      setConnected(true);
      setPublicKey("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
      setBalance(10.0);
      setLoading(false);
      // Show toast on connect
      if (typeof window !== "undefined") {
        import("react-hot-toast").then(({ toast }) => {
          toast.success("Wallet connected!");
        });
      }
    }, 1000);
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKey(null);
    setBalance(0);
  };

  return (
    <WalletContext.Provider
      value={{ connected, connect, disconnect, publicKey, balance, loading }}
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
