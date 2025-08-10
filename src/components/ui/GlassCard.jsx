import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
      className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl ${className}`}
      {...props}
    >
      <Card className="bg-transparent border-none shadow-none">{children}</Card>
    </motion.div>
  );
} 