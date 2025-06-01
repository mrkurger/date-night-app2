'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Skip if still loading
    if (isLoading) return;

    // If authenticated, check for redirect
    if (isAuthenticated) {
      // Check for redirect parameter in URL
      const redirectUrl = searchParams.get('redirect');

      // Add availability check for sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // Check for stored redirect in session storage
        const storedRedirect = sessionStorage.getItem('redirectAfterLogin');

        // Clear stored redirect
        sessionStorage.removeItem('redirectAfterLogin');

        // Redirect to stored path or default to home
        if (redirectUrl) {
          router.push(decodeURIComponent(redirectUrl));
        } else if (storedRedirect) {
          router.push(storedRedirect);
        } else {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  return null;
}
