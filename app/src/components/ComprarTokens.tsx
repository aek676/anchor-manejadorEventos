'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '@/hooks/useProgram';
import { ManejadorEventosClient } from '@/utils/eventosClient';
import { PublicKey } from '@solana/web3.js';
import * as spl from '@solana/spl-token';

export function ComprarTokens() {
    const { publicKey } = useWallet();
    const { program, provider } = useProgram();

    const [formData, setFormData] = useState({
        eventoId: '',
        autoridadEvento: '',
        cantidad: '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!program || !provider || !publicKey) {
            setError('Wallet no conectada');
            return;
        }

        if (!formData.eventoId || !formData.autoridadEvento || !formData.cantidad) {
            setError('Todos los campos son requeridos');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const client = new ManejadorEventosClient(program, provider.connection);
            const autoridadEvento = new PublicKey(formData.autoridadEvento);

            // Obtener las PDAs del evento
            const pdas = client.findEventoPDAs(formData.eventoId, autoridadEvento);

            // Obtener información del evento para el token aceptado
            const eventoInfo = await client.getEventoInfo(formData.eventoId, autoridadEvento);
            if (!eventoInfo) {
                throw new Error('Evento no encontrado');
            }

            // Crear cuentas de token asociadas si no existen
            const cuentaCompradorTokenEvento = await spl.getAssociatedTokenAddress(
                pdas.tokenEvento,
                publicKey
            );

            const cuentaCompradorTokenAceptado = await spl.getAssociatedTokenAddress(
                eventoInfo.tokenAceptado,
                publicKey
            );

            // Verificar que el comprador tenga cuenta de token aceptado
            try {
                await spl.getAccount(provider.connection, cuentaCompradorTokenAceptado);
            } catch {
                throw new Error('No tienes una cuenta del token aceptado. Contacta al creador del evento para obtener tokens.');
            }

            await client.comprarTokenEvento(
                formData.eventoId,
                autoridadEvento,
                publicKey,
                parseInt(formData.cantidad),
                cuentaCompradorTokenEvento,
                cuentaCompradorTokenAceptado
            );

            setSuccess(true);
            setFormData({
                eventoId: '',
                autoridadEvento: '',
                cantidad: '',
            });

        } catch (err) {
            console.error('Error al comprar tokens:', err);
            setError(`Error al comprar tokens: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Comprar Tokens de Evento</h2>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-md p-4 mb-6">
                <p className="text-blue-200 text-sm">
                    💡 <strong>Información:</strong> Los tokens de evento te permiten participar como sponsor.
                    Necesitas tener tokens del tipo aceptado por el evento para hacer la compra.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="eventoId" className="block text-sm font-medium text-blue-200 mb-2">
                        ID del Evento
                    </label>
                    <input
                        type="text"
                        id="eventoId"
                        name="eventoId"
                        value={formData.eventoId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: 1703123456789"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="autoridadEvento" className="block text-sm font-medium text-blue-200 mb-2">
                        Dirección del Creador del Evento
                    </label>
                    <input
                        type="text"
                        id="autoridadEvento"
                        name="autoridadEvento"
                        value={formData.autoridadEvento}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dirección pública del creador"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="cantidad" className="block text-sm font-medium text-blue-200 mb-2">
                        Cantidad de Tokens a Comprar
                    </label>
                    <input
                        type="number"
                        id="cantidad"
                        name="cantidad"
                        value={formData.cantidad}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5"
                        required
                    />
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4">
                        <p className="text-red-200">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-md p-4">
                        <p className="text-green-200">¡Tokens comprados exitosamente! 🎉</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Comprando Tokens...
                        </div>
                    ) : (
                        'Comprar Tokens'
                    )}
                </button>
            </form>
        </div>
    );
}
