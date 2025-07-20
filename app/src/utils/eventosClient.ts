import { PublicKey, Connection } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { ManejadorEventos } from '../anchor/manejador_eventos';
import * as spl from '@solana/spl-token';
import { BN } from 'bn.js';

export interface EventoInfo {
    id: string;
    nombre: string;
    descripcion: string;
    precioEntrada: number;
    precioToken: number;
    entradasVendidas: number;
    totalSponsors: number;
    activo: boolean;
    autoridad: PublicKey;
    tokenAceptado: PublicKey;
}

export class ManejadorEventosClient {
    constructor(
        private program: Program<ManejadorEventos>,
        private connection: Connection
    ) { }

    // Encontrar las PDAs del evento
    findEventoPDAs(id: string, autoridad: PublicKey) {
        // Evento PDA: [id, "evento", autoridad]
        const [evento] = PublicKey.findProgramAddressSync(
            [Buffer.from(id), Buffer.from('evento'), autoridad.toBuffer()],
            this.program.programId
        );

        // Token Evento PDA: ["token_evento", evento_key]
        const [tokenEvento] = PublicKey.findProgramAddressSync(
            [Buffer.from('token_evento'), evento.toBuffer()],
            this.program.programId
        );

        // Bóveda Evento PDA: ["boveda_evento", evento_key]
        const [bovedaEvento] = PublicKey.findProgramAddressSync(
            [Buffer.from('boveda_evento'), evento.toBuffer()],
            this.program.programId
        );

        // Bóveda Ganancias PDA: ["boveda_ganancias", evento_key]
        const [bovedaGanancias] = PublicKey.findProgramAddressSync(
            [Buffer.from('boveda_ganancias'), evento.toBuffer()],
            this.program.programId
        );

        return {
            evento,
            tokenEvento,
            bovedaEvento,
            bovedaGanancias,
        };
    }

    // Crear un evento
    async crearEvento(
        id: string,
        nombre: string,
        descripcion: string,
        precioEntrada: number,
        precioToken: number,
        tokenAceptado: PublicKey,
        autoridad: PublicKey
    ) {
        const pdas = this.findEventoPDAs(id, autoridad);

        const tx = await this.program.methods
            .crearEvento(id, nombre, descripcion, precioEntrada, precioToken)
            .accountsPartial({
                evento: pdas.evento,
                tokenAceptado,
                tokenEvento: pdas.tokenEvento,
                bovedaEvento: pdas.bovedaEvento,
                bovedaGanancias: pdas.bovedaGanancias,
                autoridad,
            })
            .rpc();

        return { tx, ...pdas };
    }

    // Comprar tokens del evento
    async comprarTokenEvento(
        eventoId: string,
        autoridad: PublicKey,
        comprador: PublicKey,
        cantidad: number,
        cuentaCompradorTokenEvento: PublicKey,
        cuentaCompradorTokenAceptado: PublicKey
    ) {
        const pdas = this.findEventoPDAs(eventoId, autoridad);

        const tx = await this.program.methods
            .comprarTokenEvento(new BN(cantidad))
            .accountsPartial({
                evento: pdas.evento,
                cuentaCompradorTokenEvento,
                tokenEvento: pdas.tokenEvento,
                cuentaCompradorTokenAceptado,
                bovedaEvento: pdas.bovedaEvento,
                comprador,
            })
            .rpc();

        return tx;
    }

    // Comprar entradas del evento
    async comprarEntradaEvento(
        eventoId: string,
        autoridad: PublicKey,
        comprador: PublicKey,
        cantidad: number,
        cuentaCompradorTokenAceptado: PublicKey
    ) {
        const pdas = this.findEventoPDAs(eventoId, autoridad);

        const tx = await this.program.methods
            .comprarEntradaEvento(new BN(cantidad))
            .accountsPartial({
                evento: pdas.evento,
                cuentaCompradorTokenAceptado,
                bovedaGanancias: pdas.bovedaGanancias,
                comprador,
            })
            .rpc();

        return tx;
    }

    // Finalizar evento
    async finalizarEvento(eventoId: string, autoridad: PublicKey) {
        const pdas = this.findEventoPDAs(eventoId, autoridad);

        const tx = await this.program.methods
            .finalizarEvento()
            .accountsPartial({
                evento: pdas.evento,
                autoridad,
            })
            .rpc();

        return tx;
    }

    // Eliminar evento
    async eliminarEvento(eventoId: string, autoridad: PublicKey) {
        const pdas = this.findEventoPDAs(eventoId, autoridad);

        const tx = await this.program.methods
            .eliminarEvento()
            .accountsPartial({
                evento: pdas.evento,
                bovedaEvento: pdas.bovedaEvento,
                bovedaGanancias: pdas.bovedaGanancias,
                tokenEvento: pdas.tokenEvento,
                autoridad,
            })
            .rpc();

        return tx;
    }

    async retirarFondos(eventoId: string, autoridad: PublicKey, cantidad: number, tokenAceptado: PublicKey, cuentaTokenAceptadoAutoridad: PublicKey) {
        const pdas = this.findEventoPDAs(eventoId, autoridad);

        const tx = await this.program.methods
            .retirarFondos(new BN(cantidad))
            .accountsPartial({
                evento: pdas.evento,
                bovedaEvento: pdas.bovedaEvento,
                tokenAceptado,
                cuentaTokenAceptadoAutoridad,
                autoridad,
            })
            .rpc();

        return tx;
    }

    async retirarGanancias(eventoId: string, autoridad: PublicKey, cuentaColaboradorTokenAceptado: PublicKey, cuentaColaboradorTokenEvento: PublicKey, colaborador: PublicKey) {
        const pdas = this.findEventoPDAs(eventoId, autoridad);

        const tx = await this.program.methods
            .retirarGanancias()
            .accountsPartial({
                evento: pdas.evento,
                tokenEvento: pdas.tokenEvento,
                bovedaGanancias: pdas.bovedaGanancias,
                cuentaColaboradorTokenAceptado,
                cuentaColaboradorTokenEvento,
                colaborador: colaborador,
            })
            .transaction();

        return tx;
    }


    // Verificar si un evento puede ser eliminado
    async verificarCondicionesEliminacion(eventoId: string, autoridad: PublicKey): Promise<{
        puedeEliminar: boolean;
        razones: string[];
    }> {
        try {
            const pdas = this.findEventoPDAs(eventoId, autoridad);
            const eventoAccount = await this.program.account.evento.fetch(pdas.evento);

            const razones: string[] = [];

            // Verificar si el evento está activo
            if (eventoAccount.activo) {
                razones.push('El evento aún está activo (debe ser finalizado primero)');
            }

            // Verificar sponsors
            if (eventoAccount.totalSponsors.toNumber() > 0) {
                razones.push(`El evento tiene ${eventoAccount.totalSponsors.toNumber()} sponsor(s)`);
            }

            // Verificar bóvedas
            try {
                const bovedaEvento = await this.connection.getTokenAccountBalance(pdas.bovedaEvento);
                if (bovedaEvento.value.uiAmount !== 0) {
                    razones.push(`La bóveda del evento tiene ${bovedaEvento.value.uiAmount} tokens`);
                }
            } catch {
                razones.push('Error al verificar la bóveda del evento');
            }

            try {
                const bovedaGanancias = await this.connection.getTokenAccountBalance(pdas.bovedaGanancias);
                if (bovedaGanancias.value.uiAmount !== 0) {
                    razones.push(`La bóveda de ganancias tiene ${bovedaGanancias.value.uiAmount} tokens`);
                }
            } catch {
                razones.push('Error al verificar la bóveda de ganancias');
            }

            return {
                puedeEliminar: razones.length === 0,
                razones
            };
        } catch (error) {
            console.error('Error al verificar condiciones de eliminación:', error);
            return {
                puedeEliminar: false,
                razones: ['Error al verificar las condiciones del evento']
            };
        }
    }

    // Obtener información del evento
    async getEventoInfo(eventoId: string, autoridad: PublicKey): Promise<EventoInfo | null> {
        try {
            const pdas = this.findEventoPDAs(eventoId, autoridad);
            const eventoAccount = await this.program.account.evento.fetch(pdas.evento);

            return {
                id: eventoAccount.id,
                nombre: eventoAccount.nombre,
                descripcion: eventoAccount.descripcion,
                precioEntrada: eventoAccount.precioEntrada.toNumber() / 100, // Convertir de centavos
                precioToken: eventoAccount.precioToken.toNumber() / 100,
                entradasVendidas: eventoAccount.entradasVendidas.toNumber(),
                totalSponsors: eventoAccount.totalSponsors.toNumber(),
                activo: eventoAccount.activo,
                autoridad: eventoAccount.autoridad,
                tokenAceptado: eventoAccount.tokenAceptado,
            };
        } catch (error) {
            console.error('Error al obtener información del evento:', error);
            return null;
        }
    }

    async getEventosPorAutoridad(autoridad: PublicKey): Promise<EventoInfo[]> {
        const eventos = await this.getAllEventos();
        return eventos.filter(evento => evento.autoridad.equals(autoridad));
    }

    // Obtener todos los eventos del programa
    async getAllEventos(): Promise<EventoInfo[]> {
        try {
            const eventosAccounts = await this.program.account.evento.all();

            const eventosInfo = await Promise.all(eventosAccounts.map(async eventoAccount => {
                const mintInfo = await spl.getMint(this.connection, eventoAccount.account.tokenAceptado);
                return {
                    id: eventoAccount.account.id,
                    nombre: eventoAccount.account.nombre,
                    descripcion: eventoAccount.account.descripcion,
                    precioEntrada: eventoAccount.account.precioEntrada.toNumber() / Math.pow(10, mintInfo.decimals),
                    precioToken: eventoAccount.account.precioToken.toNumber() / Math.pow(10, mintInfo.decimals),
                    entradasVendidas: eventoAccount.account.entradasVendidas.toNumber(),
                    totalSponsors: eventoAccount.account.totalSponsors.toNumber(),
                    activo: eventoAccount.account.activo,
                    autoridad: eventoAccount.account.autoridad,
                    tokenAceptado: eventoAccount.account.tokenAceptado,
                };
            }));
            return eventosInfo;
        } catch (error) {
            console.error('Error al obtener todos los eventos:', error);
            return [];
        }
    }

    // Obtener todos los eventos donde una wallet es colaborador
    async getEventosDeColaborador(colaborador: PublicKey): Promise<EventoInfo[]> {
        // La cuenta Colaborador tiene: discriminante (8) + evento (32) + wallet (32)
        // El campo wallet empieza en offset 40
        const colaboradorAccounts = await this.program.account.colaborador.all([
            {
                memcmp: {
                    offset: 40,
                    bytes: colaborador.toBase58(),
                }
            }
        ]);

        // Obtener los eventos únicos
        const eventoPubkeys = colaboradorAccounts.map(c => c.account.evento);
        const eventosInfo: EventoInfo[] = [];
        for (const eventoPubkey of eventoPubkeys) {
            try {
                const eventoAccount = await this.program.account.evento.fetch(eventoPubkey);
                const mintInfo = await spl.getMint(this.connection, eventoAccount.tokenAceptado);
                eventosInfo.push({
                    id: eventoAccount.id,
                    nombre: eventoAccount.nombre,
                    descripcion: eventoAccount.descripcion,
                    precioEntrada: eventoAccount.precioEntrada.toNumber() / Math.pow(10, mintInfo.decimals),
                    precioToken: eventoAccount.precioToken.toNumber() / Math.pow(10, mintInfo.decimals),
                    entradasVendidas: eventoAccount.entradasVendidas.toNumber(),
                    totalSponsors: eventoAccount.totalSponsors.toNumber(),
                    activo: eventoAccount.activo,
                    autoridad: eventoAccount.autoridad,
                    tokenAceptado: eventoAccount.tokenAceptado,
                });
            } catch {
                // Si no se puede obtener el evento, lo ignoramos
            }
        }
        return eventosInfo;
    }



    // Obtener dirección de cuenta de token asociada
    async getAssociatedTokenAddress(
        tokenMint: PublicKey,
        owner: PublicKey
    ) {
        return await spl.getAssociatedTokenAddress(tokenMint, owner);
    }

}