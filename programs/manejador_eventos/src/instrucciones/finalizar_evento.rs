use crate::colecciones::*;
use crate::utilidades::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct FinalizarEvento<'info> {
    #[account(
        mut,
        seeds = [
            evento.id.as_ref(),
            Evento::SEMILLA_EVENTO.as_bytes(),
            autoridad.key().as_ref(),
        ],
        bump = evento.bump_evento,
        constraint = evento.autoridad == autoridad.key() @ CodigoError::UsuarioNoAutorizado,
    )]
    pub evento: Account<'info, Evento>,

    #[account(mut)]
    pub autoridad: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn finalizar_evento(ctx: Context<FinalizarEvento>) -> Result<()> {
    ctx.accounts.evento.activo = false;
    Ok(())
}
