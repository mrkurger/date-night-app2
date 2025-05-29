'use client';

import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import EnhancedNavbar from '@/components/enhanced-navbar'; // Corrected import
import { Footer } from '@/components/footer'; // Corrected import
import { Checkbox } from '@/components/components/ui/checkbox'; // Added import for Checkbox

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authContext = useContext(AuthContext);
  const { login, isAuthenticated } = authContext || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  // Check for session_expired parameter
  useEffect(() => {
    const sessionExpired = searchParams.get('session_expired');
    if (sessionExpired === 'true') {
      setShowSessionExpired(true);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!authContext) {
      setError('Authentication context is not available.');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="w-full max-w-md bg-slate-800 shadow-2xl rounded-xl p-8 md:p-10">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-8">
            Welcome Back
          </h1>
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}
          {showSessionExpired && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Session Expired</AlertTitle>
              <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-pink-500 focus:border-pink-500 transition-colors"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-pink-500 focus:border-pink-500 transition-colors"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean | 'indeterminate') =>
                    setRememberMe(checked === true)
                  }
                  className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-slate-600 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white transition-colors"
                />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                  Remember me
                </Label>
              </div>
            </div>
            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-pink-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>
          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-pink-400 hover:text-pink-300 transition-colors ml-1"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
