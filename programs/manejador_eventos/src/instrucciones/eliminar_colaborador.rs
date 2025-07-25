use crate::colecciones::*;
use crate::utilidades::*; // Assuming CodigoError is defined here
use anchor_lang::prelude::*;
use anchor_spl::associated_token::*;
use anchor_spl::token::{Mint, Token};

#[derive(Accounts)]
pub struct EliminarColaborador<'info> {
    #[account(
        mut,
        seeds = [
            evento.id.to_string().as_ref(),
            Evento::SEMILLA_EVENTO.as_bytes(),
            evento.autoridad.key().as_ref(),
        ],
        bump = evento.bump_evento,
        has_one = autoridad @ CodigoError::UsuarioNoAutorizado // Ensure only the event authority can delete
    )]
    pub evento: Account<'info, Evento>,

    #[account(
        mut,
        close = colaborador_wallet, // Return SOL to the collaborator's wallet (original payer)
        seeds = [
            Colaborador::SEMILLA_COLABORADOR.as_bytes(),
            evento.key().as_ref(),
            colaborador.wallet.as_ref(), // Use the collaborator's wallet key in the seed
        ],
        bump = colaborador.bump,
        constraint = colaborador.evento == evento.key() @ CodigoError::ColaboradorNoPertenece, // Ensure collaborator belongs to this event
    )]
    pub colaborador: Account<'info, Colaborador>,

    #[account(
        seeds = [
            Evento::SEMILLA_TOKEN_EVENTO.as_bytes(),
            evento.key().as_ref(),
        ],
        bump = evento.bump_token_evento,
    )]
    pub token_evento: Account<'info, Mint>, // The mint of the event token

    #[account(mut)]
    pub autoridad: Signer<'info>, // The signer performing the deletion (event authority)

    /// CHECK: This account receives the lamports from the closed `colaborador` and `cuenta_comprador_token_evento` accounts.
    /// It's not a signer but needs to be mutable to receive SOL. Its address is derived from `colaborador.wallet`.
    #[account(mut)]
    pub colaborador_wallet: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn eliminar_colaborador(ctx: Context<EliminarColaborador>) -> Result<()> {
    // Crucial check: Ensure the `colaborador_wallet` account passed in
    // is indeed the wallet address stored in the `colaborador` account.
    require!(
        ctx.accounts.colaborador_wallet.key() == ctx.accounts.colaborador.wallet.key(),
        CodigoError::WalletIncorrecta
    );

    // Decrement the current sponsors count in the event
    ctx.accounts.evento.sponsors_actuales = ctx
        .accounts
        .evento
        .sponsors_actuales
        .checked_sub(1)
        .ok_or(CodigoError::OverflowError)?;

    // The 'colaborador' and 'cuenta_comprador_token_evento' accounts are automatically closed
    // and SOL is transferred to 'colaborador_wallet' due to the `close = colaborador_wallet` constraints.

    Ok(())
}
