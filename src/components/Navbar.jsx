import React from "react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-4 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">ChainHire</h1>
        <div className="space-x-6">
          <a href="#features" className="hover:underline">
            Features
          </a>
          <a href="#how-it-works" className="hover:underline">
            How it works
          </a>
          <a href="#testimonials" className="hover:underline">
            Testimonials
          </a>
          <a
            href="/login"
            className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200"
          >
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}
