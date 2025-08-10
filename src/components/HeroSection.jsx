import React from "react";

export default function HeroSection() {
  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-800 to-black text-white px-6">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Revolutionize Freelancing with Web3
        </h1>
        <p className="text-lg max-w-2xl mx-auto">
          Decentralized escrow. Blockchain secured. Empowering freelancers and
          clients with trust.
        </p>
        <a
          href="/signup"
          className="inline-block bg-white text-black px-6 py-3 rounded-lg text-lg font-bold hover:scale-105 transition"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
