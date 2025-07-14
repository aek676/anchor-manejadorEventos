'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '@/hooks/useProgram';
import { ManejadorEventosClient } from '@/utils/eventosClient';
import { PublicKey } from '@solana/web3.js';

export function CrearEvento() {
    const { publicKey } = useWallet();
    const { program, provider } = useProgram();

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precioEntrada: '',
        precioToken: '',
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

        if (!formData.nombre || !formData.descripcion || !formData.precioEntrada || !formData.precioToken) {
            setError('Todos los campos son requeridos');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const client = new ManejadorEventosClient(program, provider.connection);

            // Usar el token mint de USDC en devnet como token aceptado
            // USDC devnet mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
            const tokenAceptado = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

            const eventoId = Date.now().toString();

            const result = await client.crearEvento(
                eventoId,
                formData.nombre,
                formData.descripcion,
                parseFloat(formData.precioEntrada),
                parseFloat(formData.precioToken),
                tokenAceptado,
                publicKey
            );

            console.log('Evento creado exitosamente:', result);

            setSuccess(true);
            setFormData({
                nombre: '',
                descripcion: '',
                precioEntrada: '',
                precioToken: '',
            });

        } catch (err) {
            console.error('Error al crear evento:', err);
            setError(`Error al crear evento: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Crear Nuevo Evento</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-blue-200 mb-2">
                        Nombre del Evento
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Concierto de Rock"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-blue-200 mb-2">
                        Descripción
                    </label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe tu evento..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="precioEntrada" className="block text-sm font-medium text-blue-200 mb-2">
                            Precio por Entrada (tokens)
                        </label>
                        <input
                            type="number"
                            id="precioEntrada"
                            name="precioEntrada"
                            value={formData.precioEntrada}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="2.50"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="precioToken" className="block text-sm font-medium text-blue-200 mb-2">
                            Precio por Token del Evento
                        </label>
                        <input
                            type="number"
                            id="precioToken"
                            name="precioToken"
                            value={formData.precioToken}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="5.00"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4">
                        <p className="text-red-200">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-md p-4">
                        <p className="text-green-200">¡Evento creado exitosamente! 🎉</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Creando Evento...
                        </div>
                    ) : (
                        'Crear Evento'
                    )}
                </button>
            </form>
        </div>
    );
}
