// filepath: /Users/oivindlund/date-night-app/client_angular2/app/components-demo/page.tsx
'use client';
import React from 'react';
import EnhancedNavbar from '@/components/enhanced-navbar';

export default function ComponentDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <EnhancedNavbar />
      <main className="mt-16 p-4">
        <h1 className="text-2xl font-bold mb-4">Components Demo</h1>
        {/* Add your component demos below */}
      </main>
    </div>
  );
}
