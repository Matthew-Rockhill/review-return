// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME || 'Review Return',
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME || 'Review Return'}`,
  },
  description: 'Help your business collect data, get more Google reviews, and increase customer retention.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}