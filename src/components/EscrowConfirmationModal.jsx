import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Coins } from "lucide-react";

export default function EscrowConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  jobTitle, 
  amountINR, 
  amountSOL 
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md mx-4"
      >
        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <CardTitle className="text-white text-xl">
              Confirm Escrow Funding
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 mb-4">
                You are about to fund the escrow for:
              </p>
              <h3 className="text-white font-semibold text-lg mb-2">
                {jobTitle}
              </h3>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Amount (INR):</span>
                <span className="text-white font-semibold">₹{amountINR}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Amount (SOL):</span>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-white font-semibold">{amountSOL.toFixed(4)} SOL</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> This will deduct {amountSOL.toFixed(4)} SOL from your wallet. 
                The funds will be held in escrow until the project is completed and verified.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-600 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Fund Escrow
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 