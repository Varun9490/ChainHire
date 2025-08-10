import React from "react";

const features = [
  {
    title: "Escrow Smart Contracts",
    description: "Payments are held securely on Solana until job completion.",
  },
  {
    title: "Secure Authentication",
    description: "Login/signup with encrypted data stored in MongoDB.",
  },
  {
    title: "Sleek Dashboards",
    description: "Minimal UIs built using Aceternity and Kokonut UI.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-900 text-white px-4">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        <h2 className="text-4xl font-bold">Features</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
