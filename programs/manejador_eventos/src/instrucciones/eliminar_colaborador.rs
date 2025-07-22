use anchor_lang::prelude::*;
use anchor_spl::associated_token::*;
use anchor_spl::token::*;

use crate::colecciones::*;
use crate::utilidades::*;

#[derive(Accounts)]
pub struct EliminarColaborador<'info> {
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

    #[account(
        mut,
        seeds = [
            Colaborador::SEMILLA_COLABORADOR.as_bytes(),
            evento.key().as_ref(),
            wallet_colaborador.key().as_ref(), // ✅ Usar wallet_colaborador consistentemente
        ],
        bump = colaborador.bump,
        close = wallet_colaborador, // ✅ Cerrar y transferir saldo al colaborador
    )]
    pub colaborador: Account<'info, Colaborador>,

    #[account(
        mut,
        seeds = [
            Evento::SEMILLA_TOKEN_EVENTO.as_bytes(),
            evento.key().as_ref(),
        ],
        bump = evento.bump_token_evento,
    )]
    pub token_evento: Account<'info, Mint>,

    #[account(
        mut,
        constraint = cuenta_colaborador_token_evento.mint == token_evento.key() @ CodigoError::TokenIncorrecto,
        constraint = cuenta_colaborador_token_evento.owner == colaborador.key() @ CodigoError::UsuarioNoAutorizado,
        constraint = cuenta_colaborador_token_evento.amount == 0 @ CodigoError::ColaboradorConSaldo,
        close = wallet_colaborador
    )]
    pub cuenta_colaborador_token_evento: Account<'info, TokenAccount>,

    /// CHECK: Wallet del colaborador que recibe los lamports
    #[account(
        mut,
        constraint = wallet_colaborador.key() == colaborador.wallet @ CodigoError::WalletIncorrecta,
    )]
    pub wallet_colaborador: UncheckedAccount<'info>,

    #[account(mut)]
    pub autoridad: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn eliminar_colaborador(ctx: Context<EliminarColaborador>) -> Result<()> {
    // Solo decrementar sponsors actuales, no el total histórico
    require!(
        ctx.accounts.evento.sponsors_actuales > 0,
        CodigoError::NoHayColaboradores
    );

    ctx.accounts.evento.sponsors_actuales -= 1;

    // Opcional: Emitir evento para auditoría
    emit!(ColaboradorEliminado {
        evento: ctx.accounts.evento.key(),
        colaborador: ctx.accounts.colaborador.wallet,
        autoridad: ctx.accounts.autoridad.key(),
    });

    Ok(())
}

// Evento para auditoría (opcional)
#[event]
pub struct ColaboradorEliminado {
    pub evento: Pubkey,
    pub colaborador: Pubkey,
    pub autoridad: Pubkey,
}
