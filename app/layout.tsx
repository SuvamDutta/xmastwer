import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'X Post AI Agent — Crypto Alpha Writer',
  description: 'AI-powered X post writer trained on 100+ top crypto accounts. Write professional crypto & airdrop posts in seconds with voice or text input.',
  keywords: 'crypto, twitter, X, airdrop, ai, post writer, web3, defi',
  openGraph: {
    title: 'X Post AI Agent',
    description: 'Professional crypto X post writer powered by AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
