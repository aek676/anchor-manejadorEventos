
'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '@/hooks/useProgram';
import { ManejadorEventosClient, EventoInfo } from '@/utils/eventosClient';

export function MisEventos() {
    const { publicKey } = useWallet();
    const { program, provider } = useProgram();
    const [eventos, setEventos] = useState<EventoInfo[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const cargarEventos = async () => {
            if (!program || !provider || !publicKey) return;
            setLoading(true);
            try {
                const client = new ManejadorEventosClient(program, provider.connection);
                const eventosAutoridad = await client.getEventosPorAutoridad(publicKey);
                setEventos(eventosAutoridad);
            } catch (error) {
                console.error('Error al cargar tus eventos:', error);
                setEventos([]);
            } finally {
                setLoading(false);
            }
        };
        cargarEventos();
    }, [program, provider, publicKey]);

    return (
        <div className="max-w-3xl mx-auto py-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Mis Eventos</h2>
            {loading ? (
                <div className="text-center text-blue-200">Cargando tus eventos...</div>
            ) : eventos.length === 0 ? (
                <div className="text-center text-blue-200">No tienes eventos creados.</div>
            ) : (
                <div className="space-y-6">
                    {eventos.map(evento => (
                        <div key={evento.id} className="bg-white/10 rounded-lg p-6 shadow-md border border-white/20">
                            <h3 className="text-xl font-semibold text-white mb-2">{evento.nombre}</h3>
                            <p className="text-blue-200 mb-2">{evento.descripcion}</p>
                            <div className="text-xs text-blue-300 space-y-1 mb-2">
                                <p><span className="font-medium">ID:</span> {evento.id}</p>
                                <p><span className="font-medium">Token Aceptado:</span> {evento.tokenAceptado.toBase58()}</p>
                                <p><span className="font-medium">Entradas Vendidas:</span> {evento.entradasVendidas}</p>
                                <p><span className="font-medium">Tokens Vendidos:</span> {evento.totalSponsors}</p>
                                <p><span className="font-medium">Activo:</span> {evento.activo ? 'Sí' : 'No'}</p>
                            </div>
                            <div className="flex gap-4 mt-2">
                                <span className="bg-blue-700 text-white px-3 py-1 rounded">Precio Entrada: {evento.precioEntrada}</span>
                                <span className="bg-blue-700 text-white px-3 py-1 rounded">Precio Token: {evento.precioToken}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
