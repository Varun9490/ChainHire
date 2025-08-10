import React from "react";

const testimonials = [
  {
    name: "Arjun Rao",
    quote: "Escrow with Solana was a game changer. Smooth, safe, and fast!",
  },
  {
    name: "Meera Jain",
    quote: "Best freelancing UI I’ve used — animations make it feel alive!",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-black text-white px-4">
      <div className="max-w-5xl mx-auto text-center space-y-12">
        <h2 className="text-4xl font-bold">What People Are Saying</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-gradient-to-tr from-indigo-800 to-purple-800 p-6 rounded-xl shadow-md"
            >
              <p className="italic">“{t.quote}”</p>
              <h4 className="mt-4 font-bold">- {t.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
