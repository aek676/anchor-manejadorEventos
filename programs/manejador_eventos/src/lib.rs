use anchor_lang::prelude::*;

use crate::instrucciones::*;

mod colecciones;
mod instrucciones;
mod utilidades;

declare_id!("WAEdkGnMEj3nvktbFLR2eb6uHDEFo5EEbRrfvydPzi8");

#[program]
pub mod manejador_eventos {
    use super::*;

    pub fn crear_evento(
        ctx: Context<CrearEvento>,
        id: String,
        nombre: String,
        descripcion: String,
        precio_entrada: f64,
        precio_token: f64,
    ) -> Result<()> {
        instrucciones::crear_evento(ctx, id, nombre, descripcion, precio_entrada, precio_token)
    }

    pub fn eliminar_evento(ctx: Context<EliminarEvento>) -> Result<()> {
        instrucciones::eliminar_evento(ctx)
    }

    pub fn finalizar_evento(ctx: Context<FinalizarEvento>) -> Result<()> {
        instrucciones::finalizar_evento(ctx)
    }

    pub fn comprar_token_evento(ctx: Context<ComprarTokenEvento>, cantidad: u64) -> Result<()> {
        instrucciones::comprar_token_evento(ctx, cantidad)
    }

    pub fn comprar_entrada_evento(ctx: Context<ComprarEntradaEvento>, cantidad: u64) -> Result<()> {
        instrucciones::comprar_entrada_evento(ctx, cantidad)
    }

    pub fn retirar_fondos(ctx: Context<RetirarFondos>, cantidad: u64) -> Result<()> {
        instrucciones::retirar_fondos(ctx, cantidad)
    }

    pub fn retirar_ganancias(ctx: Context<RetirarGanancias>) -> Result<()> {
        instrucciones::retirar_ganancias(ctx)
    }

    pub fn eliminar_colaborador(ctx: Context<EliminarColaborador>) -> Result<()> {
        instrucciones::eliminar_colaborador(ctx)
    }
}
