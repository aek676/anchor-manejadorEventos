use anchor_lang::prelude::*;

use crate::instrucciones::*;

mod colecciones;
mod instrucciones;
mod utilidades;

declare_id!("GcDERhvoXuoZ4Lw2LWPzrAxhSf1N4VuNFZBRKCXPmfdc");

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
}
