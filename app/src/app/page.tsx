'use client';

import { SolanaWalletProvider } from '@/components/WalletProvider';
import { UmiProvider } from '@/components/umi-provider'; // o la ruta correcta
import { MainApp } from '@/components/MainApp';

export default function Home() {
  return (
    <SolanaWalletProvider>
      <UmiProvider>
        <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <MainApp />
        </main>
      </UmiProvider>
    </SolanaWalletProvider>
  );
}