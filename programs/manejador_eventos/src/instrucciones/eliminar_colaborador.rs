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
            wallet_colaborador.key().as_ref(),
        ],
        bump = colaborador.bump,
        constraint = colaborador.evento == evento.key() @ CodigoError::ColaboradorNoPertenece,
        constraint = colaborador.wallet == wallet_colaborador.key() @ CodigoError::WalletIncorrecta,
        close = wallet_colaborador, // Cerrar cuenta y transferir lamports al colaborador
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
        constraint = cuenta_colaborador_token_evento.owner == wallet_colaborador.key() @ CodigoError::UsuarioNoAutorizado,
        constraint = cuenta_colaborador_token_evento.amount == 0 @ CodigoError::ColaboradorConSaldo,
        close = wallet_colaborador // Cerrar cuenta de token y transferir lamports al colaborador
    )]
    pub cuenta_colaborador_token_evento: Account<'info, TokenAccount>,

    /// CHECK: Wallet del colaborador que recibe los lamports de las cuentas cerradas
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
    // Verificar que hay colaboradores para eliminar
    require!(
        ctx.accounts.evento.sponsors_actuales > 0,
        CodigoError::NoHayColaboradores
    );

    // Verificar que el colaborador no tiene tokens pendientes
    require!(
        ctx.accounts.cuenta_colaborador_token_evento.amount == 0,
        CodigoError::ColaboradorConSaldo
    );

    // Decrementar el contador de sponsors actuales
    ctx.accounts.evento.sponsors_actuales = ctx
        .accounts
        .evento
        .sponsors_actuales
        .checked_sub(1)
        .ok_or(CodigoError::OverflowError)?;

    // Emitir evento para auditoría
    emit!(ColaboradorEliminado {
        evento: ctx.accounts.evento.key(),
        colaborador_wallet: ctx.accounts.colaborador.wallet,
        autoridad: ctx.accounts.autoridad.key(),
        sponsors_restantes: ctx.accounts.evento.sponsors_actuales,
    });

    Ok(())
}

// Evento para auditoría
#[event]
pub struct ColaboradorEliminado {
    pub evento: Pubkey,
    pub colaborador_wallet: Pubkey,
    pub autoridad: Pubkey,
    pub sponsors_restantes: u64,
}
