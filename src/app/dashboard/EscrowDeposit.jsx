"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { depositToEscrow } from "@/utils/solana-escrow";
import { useState } from "react";

export default function EscrowDeposit({ amount }) {
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!publicKey) return alert("Connect wallet first!");
    setLoading(true);

    try {
      const signature = await depositToEscrow(
        { publicKey, sendTransaction },
        amount
      );
      alert("Escrow funded! Tx: " + signature);
    } catch (e) {
      console.error(e);
      alert("Failed to deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-purple-700 text-white px-4 py-2 mt-4 rounded"
      onClick={handleDeposit}
      disabled={loading}
    >
      {loading ? "Processing..." : `Fund Escrow with ${amount} SOL`}
    </button>
  );
}
