import React from "react";

export default function CTASection() {
  return (
    <section className="bg-gradient-to-br from-purple-600 to-indigo-800 py-16 text-white text-center">
      <h2 className="text-3xl font-bold mb-6">
        Ready to Decentralize Your Freelancing?
      </h2>
      <a
        href="/signup"
        className="bg-white text-black px-6 py-3 text-lg font-semibold rounded-md hover:scale-105 transition"
      >
        Join Now
      </a>
    </section>
  );
}
