'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '@/hooks/useProgram';
import { ManejadorEventosClient, EventoInfo } from '@/utils/eventosClient';
import { ComprarTokens } from './ComprarTokens';
import { ComprarEntradas } from './ComprarEntradas';
import { URL_IRYS_DEVNET } from '@/utils/uploadImage';

type Tab = 'tokens' | 'entradas' | '';

export function ListaEventos() {
    const { publicKey } = useWallet();
    const { program, provider } = useProgram();

    const [eventos, setEventos] = useState<EventoInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [eventoIdBuscar, setEventoIdBuscar] = useState('');
    const [autoridadBuscar, setAutoridadBuscar] = useState('');
    const [vistaActual, setVistaActual] = useState<'todos' | 'buscar'>('todos');
    const [activeTabs, setActiveTabs] = useState<Record<string, Tab>>({});

    const cargarTodosLosEventos = useCallback(async () => {
        if (!program || !provider) {
            return;
        }

        setLoading(true);
        try {
            const client = new ManejadorEventosClient(program, provider.connection);
            const todosLosEventos = await client.getAllEventos();
            setEventos(todosLosEventos);
        } catch (error) {
            console.error('Error al cargar todos los eventos:', error);
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, [program, provider]);

    // Cargar todos los eventos al montar el componente
    useEffect(() => {
        if (vistaActual === 'todos') {
            cargarTodosLosEventos();
        }
    }, [program, provider, vistaActual, cargarTodosLosEventos]);

    const buscarEvento = async () => {
        if (!program || !provider || !eventoIdBuscar || !autoridadBuscar) {
            return;
        }

        setLoading(true);
        setVistaActual('buscar');
        try {
            const client = new ManejadorEventosClient(program, provider.connection);
            const evento = await client.getEventoInfo(
                eventoIdBuscar,
                new (await import('@solana/web3.js')).PublicKey(autoridadBuscar)
            );

            if (evento) {
                setEventos([evento]);
            } else {
                setEventos([]);
            }
        } catch (error) {
            console.error('Error al buscar evento:', error);
            setEventos([]);
        } finally {
            setLoading(false);
        }
    };

    // Callback para actualizar eventos tras compra
    const handleCompraRealizada = async () => {
        if (vistaActual === 'todos') {
            await cargarTodosLosEventos();
        } else if (vistaActual === 'buscar') {
            await buscarEvento();
        }
    };

    // Función para manejar el toggle de las pestañas por evento
    const handleTabToggle = (eventoId: string, tab: Tab) => {
        setActiveTabs(prev => ({
            ...prev,
            [eventoId]: prev[eventoId] === tab ? '' : tab
        }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Explorar Eventos</h2>

            {/* Pestañas para cambiar entre vistas */}
            <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
                <button
                    onClick={() => setVistaActual('todos')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${vistaActual === 'todos'
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Todos los Eventos
                </button>
                <button
                    onClick={() => setVistaActual('buscar')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${vistaActual === 'buscar'
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                        }`}
                >
                    Buscar Específico
                </button>
            </div>

            {/* Formulario de búsqueda - solo visible en vista buscar */}
            {vistaActual === 'buscar' && (
                <div className="bg-white/5 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Buscar Evento Específico</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                ID del Evento
                            </label>
                            <input
                                type="text"
                                value={eventoIdBuscar}
                                onChange={(e) => setEventoIdBuscar(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: 1703123456789"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-200 mb-2">
                                Dirección del Creador
                            </label>
                            <input
                                type="text"
                                value={autoridadBuscar}
                                onChange={(e) => setAutoridadBuscar(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Dirección pública del creador"
                            />
                        </div>
                    </div>

                    <button
                        onClick={buscarEvento}
                        disabled={loading || !eventoIdBuscar || !autoridadBuscar}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        {loading ? 'Buscando...' : 'Buscar Evento'}
                    </button>
                </div>
            )}

            {/* Botón para recargar todos los eventos */}
            {vistaActual === 'todos' && (
                <div className="flex flex-col md:flex-row md:justify-between items-center gap-2 md:gap-4">
                    <p className="text-blue-200 mb-2 md:mb-0">
                        {eventos.length > 0 ? `Mostrando ${eventos.length} evento(s)` : 'No hay eventos disponibles'}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={cargarTodosLosEventos}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            {loading ? 'Cargando...' : 'Recargar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de eventos */}
            <div className="grid gap-4">
                {eventos.length > 0 ? (
                    eventos.map((evento, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
                            {/* Imagen del evento */}
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={URL_IRYS_DEVNET + evento.uriImg}
                                    alt={`Imagen de ${evento.nombre}`}
                                    className="rounded-lg w-full max-w-xs h-40 object-cover border border-white/20"
                                />
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{evento.nombre}</h3>
                                    <p className="text-blue-200 mb-4">{evento.descripcion}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${evento.activo
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-red-500/20 text-red-300'
                                    }`}>
                                    {evento.activo ? 'Activo' : 'Finalizado'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                    <p className="text-blue-200 text-sm">Precio Entrada</p>
                                    <p className="text-white font-semibold">{evento.precioEntrada} tokens</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-blue-200 text-sm">Precio Token</p>
                                    <p className="text-white font-semibold">{evento.precioToken} tokens</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-blue-200 text-sm">Entradas Vendidas</p>
                                    <p className="text-white font-semibold">{evento.entradasVendidas}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-blue-200 text-sm">Sponsors</p>
                                    <p className="text-white font-semibold">{evento.sponsorsActuales}</p>
                                </div>
                            </div>

                            <div className="text-xs text-blue-300 space-y-1">
                                <p><span className="font-medium">ID:</span> {evento.id}</p>
                                <p><span className="font-medium">Creador:</span> {evento.autoridad.toBase58()}</p>
                                <p><span className="font-medium">Token Aceptado:</span> {evento.tokenAceptado.toBase58()}</p>
                            </div>

                            {publicKey && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className='flex justify-between items-center'>
                                        <div className='flex space-x-2'>
                                            <button
                                                onClick={() => handleTabToggle(evento.id, 'tokens')}
                                                className={`font-medium py-2 px-4 rounded-md transition-colors ${activeTabs[evento.id] === 'tokens'
                                                    ? 'bg-blue-800 text-white'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    }`}
                                            >
                                                {activeTabs[evento.id] === 'tokens' ? 'Cerrar Tokens' : 'Comprar Tokens'}
                                            </button>
                                            <button
                                                onClick={() => handleTabToggle(evento.id, 'entradas')}
                                                className={`font-medium py-2 px-4 rounded-md transition-colors ${activeTabs[evento.id] === 'entradas'
                                                    ? 'bg-green-800 text-white'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                                    }`}
                                            >
                                                {activeTabs[evento.id] === 'entradas' ? 'Cerrar Entradas' : 'Comprar Entradas'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contenido de las pestañas con animación */}
                                    {activeTabs[evento.id] && activeTabs[evento.id] !== '' && (
                                        <div className="mt-4 min-h-[400px] animate-in slide-in-from-top-2 duration-300">
                                            {activeTabs[evento.id] === 'tokens' && (
                                                <ComprarTokens
                                                    eventoId={evento.id}
                                                    autoridadEvento={evento.autoridad}
                                                    onCompraRealizada={handleCompraRealizada}
                                                />
                                            )}
                                            {activeTabs[evento.id] === 'entradas' && (
                                                <ComprarEntradas
                                                    eventoId={evento.id}
                                                    autoridadEvento={evento.autoridad}
                                                    onCompraRealizada={handleCompraRealizada}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">
                            {vistaActual === 'todos' ? '📅' : '🔍'}
                        </div>
                        <p className="text-blue-200">
                            {loading
                                ? (vistaActual === 'todos' ? 'Cargando eventos...' : 'Buscando eventos...')
                                : (vistaActual === 'todos'
                                    ? 'No hay eventos creados en el programa todavía.'
                                    : 'No se encontraron eventos. Busca usando un ID específico.')
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}