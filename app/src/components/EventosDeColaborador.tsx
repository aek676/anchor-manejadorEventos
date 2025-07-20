import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '../hooks/useProgram';
import { ManejadorEventosClient, EventoInfo } from '../utils/eventosClient';

export function EventosDeColaborador() {
    const { publicKey } = useWallet();
    const { program, provider } = useProgram();
    const [eventos, setEventos] = useState<EventoInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarEventos = async () => {
            if (!program || !provider || !publicKey) {
                setEventos([]);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const client = new ManejadorEventosClient(program, provider.connection);
                const eventosColaborador = await client.getEventosDeColaborador(publicKey);
                setEventos(eventosColaborador);
            } catch {
                setError('Error al cargar eventos de colaborador');
                setEventos([]);
            } finally {
                setLoading(false);
            }
        };
        cargarEventos();
    }, [program, provider, publicKey]);

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Eventos donde eres colaborador</h2>
            {loading && <p className="text-blue-200">Cargando eventos...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {!loading && eventos.length === 0 && (
                <p className="text-blue-200">No eres colaborador en ningún evento.</p>
            )}
            <ul className="space-y-4">
                {eventos.map(evento => (
                    <li key={evento.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                        <h3 className="text-lg font-semibold text-white">{evento.nombre}</h3>
                        <p className="text-blue-200">{evento.descripcion}</p>
                        <div className="mt-2 text-sm text-blue-300">
                            <span>Precio Entrada: {evento.precioEntrada}</span> | <span>Precio Token: {evento.precioToken}</span>
                        </div>
                        <div className="mt-1 text-xs text-blue-400">
                            <span>Entradas Vendidas: {evento.entradasVendidas}</span> | <span>Sponsors: {evento.totalSponsors}</span>
                        </div>
                        <div className="mt-1 text-xs text-blue-400">
                            <span>Autoridad: {evento.autoridad.toBase58()}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
