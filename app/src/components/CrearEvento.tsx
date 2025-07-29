'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '@/hooks/useProgram';
import { ManejadorEventosClient } from '@/utils/eventosClient';
import { PublicKey } from '@solana/web3.js';
import { uploadImage, UploadImageResult } from '@/utils/uploadImage';

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

    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<UploadImageResult | null>(null);

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

            // USDC en devnet tiene 6 decimales
            const tokenAceptado = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

            const eventoId = Date.now().toString();


            const eventoResult = await client.crearEvento(
                eventoId,
                formData.nombre,
                formData.descripcion,
                Number(formData.precioEntrada), // Enviar como número decimal directo
                Number(formData.precioToken),   // Enviar como número decimal directo
                tokenAceptado,
                publicKey,
                result ? result.uri : null // Usar URI de la imagen si se subió
            );

            console.log('Evento creado exitosamente:', eventoResult);

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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        setUploading(true);

        try {
            const uploadResult = await uploadImage(file);
            setResult(uploadResult);
            console.log("File uploaded successfully:", uploadResult);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setUploading(false);
        }
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
                            Precio por Entrada (USDC)
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
                        <p className="text-xs text-blue-300 mt-1">
                            Precio en USDC (ej: 1.50 = 1.50 USDC)
                        </p>
                    </div>

                    <div>
                        <label htmlFor="precioToken" className="block text-sm font-medium text-blue-200 mb-2">
                            Precio por Token del Evento (USDC)
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
                        <p className="text-xs text-blue-300 mt-1">
                            Precio en USDC (ej: 5.00 = 5.00 USDC)
                        </p>
                    </div>
                    <div>
                        <label htmlFor="imagen" className="block text-sm font-medium text-blue-200 mb-2">
                            Imagen del Evento
                        </label>
                        <div className="flex items-center gap-3">
                            <label
                                htmlFor="imagen"
                                className={`cursor-pointer bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow transition-colors ${uploading || result ? 'opacity-60 cursor-not-allowed' : ''}`}
                                style={{ display: 'inline-block' }}
                            >
                                {uploading
                                    ? 'Subiendo...'
                                    : result
                                        ? 'Imagen subida'
                                        : 'Subir Imagen'}
                                <input
                                    id="imagen"
                                    type="file"
                                    onChange={handleFileUpload}
                                    disabled={uploading || !!result}
                                    className="hidden"
                                />
                            </label>
                            {uploading && (
                                <span className="ml-2 text-blue-300 animate-pulse">Subiendo imagen...</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vista previa de los precios */}
                {(formData.precioEntrada || formData.precioToken) && (
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-md p-4">
                        <h3 className="text-sm font-medium text-blue-200 mb-2">Vista Previa:</h3>
                        {formData.precioEntrada && (
                            <p className="text-xs text-blue-300">
                                • Entrada: {formData.precioEntrada} USDC
                            </p>
                        )}
                        {formData.precioToken && (
                            <p className="text-xs text-blue-300">
                                • Token del evento: {formData.precioToken} USDC
                            </p>
                        )}
                    </div>
                )}

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