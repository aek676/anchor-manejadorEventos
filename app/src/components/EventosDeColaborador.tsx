import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '../hooks/useProgram';
import { ManejadorEventosClient, EventoInfo } from '../utils/eventosClient';
import { CodigoError, getMensajeErrorAnchor } from '@/utils/AnchorError';
import { SendTransactionError } from '@solana/web3.js';

export function EventosDeColaborador() {
    const { publicKey, wallet, signTransaction } = useWallet();
    const { program, provider } = useProgram();
    const [eventos, setEventos] = useState<EventoInfo[]>([]);
    const [ganancias, setGanancias] = useState<{ [eventoId: string]: number }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarEventos = async () => {
            if (!program || !provider || !publicKey) {
                setEventos([]);
                setGanancias({});
                return;
            }
            setLoading(true);
            setError('');
            try {
                const client = new ManejadorEventosClient(program, provider.connection);
                const eventosColaborador = await client.getEventosDeColaborador(publicKey);
                setEventos(eventosColaborador);
                // Consultar ganancias para cada evento
                const gananciasObj: { [eventoId: string]: number } = {};
                for (const evento of eventosColaborador) {
                    const pdas = client.findEventoPDAs(evento.id, publicKey);
                    try {
                        const balance = await provider.connection.getTokenAccountBalance(pdas.bovedaGanancias);
                        gananciasObj[evento.id] = balance.value.uiAmount ?? 0;
                    } catch {
                        gananciasObj[evento.id] = 0;
                    }
                }
                setGanancias(gananciasObj);
            } catch {
                setError('Error al cargar eventos de colaborador');
                setEventos([]);
                setGanancias({});
            } finally {
                setLoading(false);
            }
        };
        cargarEventos();
    }, [program, provider, publicKey]);

    const handleRetirarGanancias = async (evento: EventoInfo) => {
        if (evento.activo) {
            alert(getMensajeErrorAnchor(CodigoError.EventoActivo));
            return;
        }

        if (!program || !provider || !publicKey || !wallet || !signTransaction) {
            console.error('Wallet no conectada');
            return;
        }

        try {
            const client = new ManejadorEventosClient(program, provider.connection);
            const cuentaColaboradorTokenAceptado = await client.getAssociatedTokenAddress(evento.tokenAceptado, publicKey);
            const pdas = client.findEventoPDAs(evento.id, publicKey);
            const cuentaColaboradorTokenEvento = await client.getAssociatedTokenAddress(pdas.tokenEvento, publicKey);

            const tx = await client.retirarGanancias(evento.id, evento.autoridad, cuentaColaboradorTokenAceptado, cuentaColaboradorTokenEvento, publicKey);
            tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = publicKey;

            const signedTx = await signTransaction(tx);

            const signature = await provider.connection.sendRawTransaction(signedTx.serialize());

            const confirmation = await provider.connection.confirmTransaction({
                signature,
                blockhash: tx.recentBlockhash,
                lastValidBlockHeight: (await provider.connection.getLatestBlockhash()).lastValidBlockHeight
            }, 'confirmed');

            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }

            console.log('Ganancias retiradas correctamente: ', signature);
        } catch (error: unknown) {
            console.error('Error al retirar fondos:', error);
            if (error instanceof SendTransactionError) {
                console.error('Error de transacción:', error.getLogs(provider.connection));
            }
        }
    }

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
                        <div className="mt-1 text-xs text-green-400">
                            <span>Ganancias disponibles: {ganancias[evento.id] ?? 0}</span>
                        </div>
                        <div className="flex-1 flex justify-end">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow" onClick={() => handleRetirarGanancias(evento)}>Retirar fondos</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
