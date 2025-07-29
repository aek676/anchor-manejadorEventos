'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '@/hooks/useProgram';
import { ManejadorEventosClient, EventoInfo, ColaboradorInfo } from '@/utils/eventosClient';
import { PublicKey } from '@solana/web3.js';
import { URL_IRYS_DEVNET } from '@/utils/uploadImage';

export function MisEventos() {
    const { publicKey } = useWallet();
    const { program, provider } = useProgram();
    const [eventos, setEventos] = useState<EventoInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [saldos, setSaldos] = useState<Record<string, number>>({});
    // Nuevo estado para colaboradores por evento
    const [colaboradores, setColaboradores] = useState<Record<string, ColaboradorInfo[]>>({});
    const [loadingColaboradores, setLoadingColaboradores] = useState<Record<string, boolean>>({});

    // Función para cargar colaboradores de un evento específico
    const cargarColaboradoresEvento = useCallback(async (eventoId: string) => {
        if (!program || !provider || !publicKey) return;

        setLoadingColaboradores(prev => ({ ...prev, [eventoId]: true }));

        try {
            const client = new ManejadorEventosClient(program, provider.connection);
            const colaboradoresEvento = await client.getColaboradoresPorEvento(eventoId, publicKey);

            setColaboradores(prev => ({
                ...prev,
                [eventoId]: colaboradoresEvento
            }));
        } catch (error) {
            console.error('Error al obtener colaboradores:', error);
            setColaboradores(prev => ({
                ...prev,
                [eventoId]: []
            }));
        } finally {
            setLoadingColaboradores(prev => ({ ...prev, [eventoId]: false }));
        }
    }, [program, provider, publicKey]);

    const cargarEventos = useCallback(async () => {
        if (!program || !provider || !publicKey) return;
        setLoading(true);
        try {
            const client = new ManejadorEventosClient(program, provider.connection);
            const eventosAutoridad = await client.getEventosPorAutoridad(publicKey);
            setEventos(eventosAutoridad);

            // Cargar saldos
            const nuevosSaldos: Record<string, number> = {};
            for (const evento of eventosAutoridad) {
                const pdas = client.findEventoPDAs(evento.id, publicKey);
                const balanceInfo = await provider.connection.getTokenAccountBalance(pdas.bovedaEvento);
                nuevosSaldos[evento.id] = balanceInfo.value.uiAmount || 0;
            }
            setSaldos(nuevosSaldos);

            for (const evento of eventosAutoridad) {
                cargarColaboradoresEvento(evento.id);
            }
        } catch (error) {
            console.error('Error al cargar tus eventos:', error);
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, [program, provider, publicKey, cargarColaboradoresEvento]);

    useEffect(() => {
        cargarEventos();
    }, [cargarEventos]);

    const handleRetirarFondos = async (evento: EventoInfo) => {
        if (!program || !provider || !publicKey) {
            console.error('Wallet no conectada');
            return;
        }

        try {
            const client = new ManejadorEventosClient(program, provider.connection);
            const cuentaTokenAceptadoAutoridad = await client.getAssociatedTokenAddress(evento.tokenAceptado, publicKey);

            await client.retirarFondos(evento.id, evento.autoridad, saldos[evento.id] || 0, evento.tokenAceptado, cuentaTokenAceptadoAutoridad);
            setSaldos(prev => ({ ...prev, [evento.id]: 0 }));
            // Actualizar colaboradores y eventos tras retirar fondos
            await cargarColaboradoresEvento(evento.id);
            await cargarEventos();
        } catch (error) {
            console.error('Error al retirar fondos:', error);
        }
    }

    const finalizarEvento = async (evento: EventoInfo) => {
        if (!program || !publicKey) return;

        try {
            const client = new ManejadorEventosClient(program, provider!.connection);
            await client.finalizarEvento(evento.id, publicKey);
            // Esperar a que se actualicen colaboradores y eventos antes de continuar
            await Promise.all([
                cargarColaboradoresEvento(evento.id),
                cargarEventos()
            ]);
        } catch (error) {
            console.error('Error al finalizar evento:', error);
        }
    };

    const eliminarEvento = async (evento: EventoInfo) => {
        if (!program || !publicKey) return;

        try {
            const client = new ManejadorEventosClient(program, provider!.connection);
            const verificacion = await client.verificarCondicionesEliminacion(evento.id, publicKey);

            if (!verificacion.puedeEliminar) {
                const razones = verificacion.razones.join('\n- ');
                alert(`No se puede eliminar el evento "${evento.nombre}":\n\n- ${razones}`);
                return;
            }

            const confirmar = window.confirm(
                `¿Estás seguro de que quieres eliminar el evento "${evento.nombre}"?\n\n` +
                'Esta acción no se puede deshacer.'
            );

            if (!confirmar) return;

            await client.eliminarEvento(evento.id, publicKey);
            alert(`Evento "${evento.nombre}" eliminado exitosamente.`);
            // Actualizar eventos tras eliminar
            await cargarEventos();
        } catch (error: unknown) {
            console.error('Error al eliminar evento:', error);

            let errorMessage = 'Error desconocido al eliminar el evento.';

            if (error instanceof Error && error.message) {
                if (error.message.includes('EventoConSponsors')) {
                    errorMessage = 'No se puede eliminar: El evento aún tiene sponsors.';
                } else if (error.message.includes('BovedaDelEventoNoVacia')) {
                    errorMessage = 'No se puede eliminar: La bóveda del evento no está vacía.';
                } else if (error.message.includes('BovedaDeGananciasNoVacia')) {
                    errorMessage = 'No se puede eliminar: La bóveda de ganancias no está vacía.';
                } else if (error.message.includes('UsuarioNoAutorizado')) {
                    errorMessage = 'No tienes autorización para eliminar este evento.';
                } else {
                    errorMessage = `Error: ${error.message}`;
                }
            }

            alert(errorMessage);
        }
    };

    // Nueva función para eliminar colaborador con validaciones
    const eliminarColaborador = async (eventoId: string, colaborador: PublicKey) => {
        if (!program || !publicKey) return;

        try {
            const client = new ManejadorEventosClient(program, provider!.connection);
            // Buscar el evento actual
            const evento = eventos.find(e => e.id === eventoId);
            if (!evento) {
                alert('No se encontró el evento.');
                return;
            }
            if (evento.activo) {
                alert('Solo puedes eliminar colaboradores de eventos finalizados.');
                return;
            }
            // Consultar saldo de ganancias del colaborador
            const pdas = client.findEventoPDAs(eventoId, publicKey);
            // Usar la bóveda de ganancias asociada al colaborador
            const balanceInfo = await provider!.connection.getTokenAccountBalance(pdas.bovedaGanancias);
            const saldoGanancias = balanceInfo.value.uiAmount || 0;
            if (saldoGanancias > 0) {
                alert('El colaborador debe retirar todas sus ganancias antes de ser eliminado.');
                return;
            }
            await client.eliminarColaborador(eventoId, publicKey, colaborador);
            // Actualizar colaboradores y eventos tras eliminar colaborador
            await cargarColaboradoresEvento(eventoId);
            await cargarEventos();
        } catch (error) {
            console.error('Error al eliminar colaborador:', error);
        }
    };

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
                            {/* Imagen del evento */}
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={URL_IRYS_DEVNET + evento.uriImg}
                                    alt={`Imagen de ${evento.nombre}`}
                                    className="rounded-lg w-full max-w-xs h-40 object-cover border border-white/20"
                                    style={{ width: '100%', maxWidth: '20rem', height: '10rem', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}
                                />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{evento.nombre}</h3>
                            <p className="text-blue-200 mb-2">{evento.descripcion}</p>
                            <div className="text-xs text-blue-300 space-y-1 mb-2">
                                <p><span className="font-medium">ID:</span> {evento.id}</p>
                                <p><span className="font-medium">Token Aceptado:</span> {evento.tokenAceptado.toBase58()}</p>
                                <p><span className="font-medium">Entradas Vendidas:</span> {evento.entradasVendidas}</p>
                                <p><span className="font-medium">Sponsors:</span> {evento.sponsorsActuales}</p>
                                <p><span className="font-medium">Activo:</span> {evento.activo ? 'Sí' : 'No'}</p>
                                <p><span className="font-medium">Fondos en bóveda:</span> {saldos[evento.id] ?? 'Cargando...'} </p>
                            </div>
                            <div className="flex gap-4 mt-2 items-center">
                                <span className="bg-blue-700 text-white px-3 py-1 rounded">Precio Entrada: {evento.precioEntrada}</span>
                                <span className="bg-blue-700 text-white px-3 py-1 rounded">Precio Token: {evento.precioToken}</span>
                                <div className="flex-1 flex justify-end space-x-2.5">
                                    <button
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                                        onClick={() => handleRetirarFondos(evento)}
                                    >
                                        Retirar fondos
                                    </button>
                                    {evento.activo ? (
                                        <button
                                            onClick={() => finalizarEvento(evento)}
                                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                        >
                                            Finalizar Evento
                                        </button>) : (
                                        <button
                                            onClick={() => eliminarEvento(evento)}
                                            className="bg-red-800 hover:bg-red-900 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                        >
                                            🗑️ Eliminar Evento
                                        </button>)
                                    }
                                </div>
                            </div>

                            {/* Sección de Colaboradores - Ahora usando el estado */}
                            <div className="mt-4">
                                <h4 className="text-lg font-semibold text-white mb-2">Colaboradores</h4>
                                {loadingColaboradores[evento.id] ? (
                                    <p className="text-blue-200">Cargando colaboradores...</p>
                                ) : colaboradores[evento.id] && colaboradores[evento.id].length > 0 ? (
                                    <ul className="space-y-2">
                                        {colaboradores[evento.id].map((colaborador, index) => (
                                            <li key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                                                <span className="text-blue-300 font-mono text-sm">
                                                    {colaborador.wallet.toBase58()}
                                                </span>
                                                <button
                                                    onClick={() => eliminarColaborador(evento.id, colaborador.wallet)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Eliminar colaborador"
                                                >
                                                    🗑️
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No hay colaboradores para este evento.</p>
                                )}

                                {/* Botón para recargar colaboradores manualmente si es necesario */}
                                <button
                                    onClick={() => cargarColaboradoresEvento(evento.id)}
                                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                                    disabled={loadingColaboradores[evento.id]}
                                >
                                    {loadingColaboradores[evento.id] ? 'Cargando...' : 'Actualizar colaboradores'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}