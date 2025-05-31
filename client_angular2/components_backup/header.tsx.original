"use client"

import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto py-4 px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            My App
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-pink-500 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-pink-500 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-pink-500 transition-colors">
              Contact
            </Link>
            <Link href="/wallet" className="text-gray-700 hover:text-pink-500 transition-colors">
              Crypto Wallet
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={toggleMenu} className="focus:outline-none">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-100 py-2 px-6">
          <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-pink-500">
            Home
          </Link>
          <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-pink-500">
            About
          </Link>
          <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:text-pink-500">
            Contact
          </Link>
          <Link href="/wallet" className="block px-3 py-2 text-gray-700 hover:text-pink-500">
            Crypto Wallet
          </Link>
        </div>
      )}
    </header>
  )
}
