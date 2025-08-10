// src/components/ui/ContractDraftingVisual.jsx
"use client";
import { motion } from "framer-motion";

const codeLines = [
  { text: "contract Escrow {" },
  { text: "  client:", value: '"0x...aBc"' },
  { text: "  freelancer:", value: '"0x...dEf"' },
  { text: "  amount:", value: "5.0 SOL" },
  { text: "  status:", value: '"funded ✅"' },
  { text: "}" },
];

const listVariants = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2, // Each line appears 0.2s after the previous one
    },
  },
  hidden: {
    opacity: 0,
  },
};

const itemVariants = {
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hidden: { opacity: 0, y: 10 },
};

export default function ContractDraftingVisual() {
  return (
    <div className="h-full w-full bg-zinc-900/50 rounded-lg border border-zinc-700 p-4 flex items-center">
      <motion.div
        className="font-mono text-xs w-full"
        initial="hidden"
        animate="visible"
        variants={listVariants}
      >
        {codeLines.map((line, index) => (
          <motion.p key={index} variants={itemVariants} className="truncate">
            <span className="text-zinc-500">{line.text}</span>
            {line.value && (
              <span className="text-emerald-400 ml-2">{line.value}</span>
            )}
          </motion.p>
        ))}
      </motion.div>
    </div>
  );
}
