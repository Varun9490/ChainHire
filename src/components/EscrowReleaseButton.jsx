"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { releaseEscrow } from "@/utils/release-escrow";

export default function EscrowReleaseButton({ jobId, freelancerAddress, amount, onSuccess }) {
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleReleaseEscrow = async () => {
    if (!publicKey) {
      setStatus({
        success: false,
        message: "Please connect your wallet first"
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const result = await releaseEscrow({
        payer: { publicKey, sendTransaction },
        receiver: freelancerAddress,
        jobId,
        amount,
        sendTransaction
      });

      setStatus(result);
      
      if (result.success && onSuccess) {
        onSuccess(result.signature);
      }
    } catch (error) {
      console.error("Error releasing escrow:", error);
      setStatus({
        success: false,
        message: error.message || "Failed to release escrow funds"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleReleaseEscrow}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Releasing Funds...
          </>
        ) : (
          "Release Funds to Freelancer"
        )}
      </Button>

      {status && (
        <div className={`p-3 rounded-lg ${status.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <div className="flex items-start gap-2">
            {status.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <p className={`text-sm ${status.success ? 'text-green-300' : 'text-red-300'}`}>
              {status.message}
            </p>
          </div>
          {status.success && status.signature && (
            <p className="text-xs text-green-300 mt-2 break-all">
              Transaction: {status.signature}
            </p>
          )}
        </div>
      )}
    </div>
  );
}