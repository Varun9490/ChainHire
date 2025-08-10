import React from "react";

const steps = [
  "Client posts a job and funds the escrow",
  "Freelancer accepts and completes the work",
  "Client releases payment through Solana smart contract",
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 bg-gradient-to-b from-black via-indigo-900 to-black text-white px-4"
    >
      <div className="max-w-4xl mx-auto text-center space-y-10">
        <h2 className="text-4xl font-bold">How It Works</h2>
        <ul className="space-y-8">
          {steps.map((step, index) => (
            <li
              key={index}
              className="text-lg bg-gray-800 p-4 rounded-lg shadow-md"
            >
              {step}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
