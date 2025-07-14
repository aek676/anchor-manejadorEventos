'use client';

import { SolanaWalletProvider } from '@/components/WalletProvider';
import { MainApp } from '@/components/MainApp';

export default function Home() {
  return (
    <SolanaWalletProvider>
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <MainApp />
      </main>
    </SolanaWalletProvider>
  );
}