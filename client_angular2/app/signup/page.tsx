'use client';

import * as React from 'react';
import { useState, useEffect, Suspense, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import EnhancedNavbar from '@/components/enhanced-navbar'; // Corrected import
import { Footer } from '@/components/footer'; // Corrected import
import Link from 'next/link';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authContext = useContext(AuthContext);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the terms and conditions.');
      setIsLoading(false);
      return;
    }

    if (!authContext || !authContext.register) {
      setError('Authentication context is not available.');
      setIsLoading(false);
      return;
    }

    try {
      // Call register from auth context
      await authContext.register(name, email, password);
      // On successful signup, redirect to home page
      window.location.href = '/'; // Using window.location to ensure a full page reload
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="w-full max-w-lg bg-slate-800 shadow-2xl rounded-xl p-8 md:p-10">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-8">
            Create Your Account
          </h1>
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Your Name"
                required
                className="w-full bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <Label
                htmlFor="email-signup"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Email Address
              </Label>
              <Input
                id="email-signup"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <Label
                htmlFor="password-signup"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Password
              </Label>
              <Input
                id="password-signup"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                minLength={8}
                className="w-full bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div>
              <Label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Repeat your password"
                required
                className="w-full bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <div className="flex items-start">
              <Checkbox
                id="agree-terms"
                checked={agreeTerms}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  setAgreeTerms(checked === true)
                }
                className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-slate-600 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white mt-0.5"
              />
              <Label htmlFor="agree-terms" className="ml-3 block text-sm text-slate-400">
                I agree to the{''}
                <Link
                  href="/terms"
                  className="font-medium text-pink-400 hover:text-pink-300 transition-colors underline ml-1"
                >
                  Terms and Conditions
                </Link>
              </Label>
            </div>
            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-pink-500 disabled:opacity-70"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </div>
          </form>
          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{''}
            <Link
              href="/login"
              className="font-medium text-pink-400 hover:text-pink-300 transition-colors ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
      <Suspense fallback={<div>Loading footer...</div>}>
        <Footer />
      </Suspense>
    </>
  );
};

export default SignupPage;
