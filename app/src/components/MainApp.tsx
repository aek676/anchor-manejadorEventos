'use client';

import { useState } from 'react';
import { WalletMultiButton } from '@/components/WalletProvider';
import { CrearEvento } from '@/components/CrearEvento';
import { ListaEventos } from '@/components/ListaEventos';
import { useWallet } from '@solana/wallet-adapter-react';
import { EventosDeColaborador } from './EventosDeColaborador';
import { MisEventos } from './MisEventos';

type Tab = 'crear' | 'eventos' | 'colaboraciones' | 'misEventos';

export function MainApp() {
    const [activeTab, setActiveTab] = useState<Tab>('eventos');
    const { connected } = useWallet();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🎫 Manejador de Eventos
                    </h1>
                    <p className="text-blue-200">
                        Plataforma descentralizada para gestión de eventos en Solana
                    </p>
                </div>
                <WalletMultiButton />
            </header>

            {connected ? (
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                    {/* Navigation Tabs */}
                    <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('eventos')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'eventos'
                                ? 'bg-blue-600 text-white'
                                : 'text-blue-200 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            📋 Ver Eventos
                        </button>
                        <button
                            onClick={() => setActiveTab('crear')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'crear'
                                ? 'bg-blue-600 text-white'
                                : 'text-blue-200 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            ➕ Crear Evento
                        </button>
                        <button
                            onClick={() => setActiveTab('colaboraciones')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'crear'
                                ? 'bg-blue-600 text-white'
                                : 'text-blue-200 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            🤝 Eventos Colaborando
                        </button>
                        <button
                            onClick={() => setActiveTab('misEventos')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'misEventos'
                                ? 'bg-blue-600 text-white'
                                : 'text-blue-200 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            🎟️ Mis eventos
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'eventos' && <ListaEventos />}
                        {activeTab === 'crear' && <CrearEvento />}
                        {activeTab === 'colaboraciones' && <EventosDeColaborador />}
                        {activeTab === 'misEventos' && (
                            <MisEventos />
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-6xl mb-4">🔗</div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Conecta tu Wallet
                        </h2>
                        <p className="text-blue-200 mb-6">
                            Para usar la plataforma de eventos, necesitas conectar tu wallet de Solana.
                            Soportamos Phantom, Solflare y otras wallets populares.
                        </p>
                        <WalletMultiButton />
                    </div>
                </div>
            )}
        </div>
    );
}
