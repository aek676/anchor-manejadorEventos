use crate::colecciones::*;
use crate::utilidades::*;
use anchor_lang::prelude::*;
use anchor_spl::token::*;

#[derive(Accounts)]
pub struct ComprarEntradaEvento<'info> {
    #[account(
        mut,
        seeds = [
            evento.id.as_ref(),
            Evento::SEMILLA_EVENTO.as_bytes(),
            evento.autoridad.key().as_ref(),
        ],
        bump = evento.bump_evento,
    )]
    pub evento: Account<'info, Evento>,

    #[account(
        mut,
        constraint = cuenta_comprador_token_aceptado.mint == evento.token_aceptado @ CodigoError::TokenIncorrecto,
        constraint = cuenta_comprador_token_aceptado.amount > 0 @ CodigoError::SaldoInsuficiente,
    )]
    pub cuenta_comprador_token_aceptado: Account<'info, TokenAccount>,

    #[account(
      mut,
        seeds = [
            Evento::SEMILLA_BOVEDA_GANANCIAS.as_bytes(),
            evento.key().as_ref(),
        ],
        bump = evento.bump_boveda_ganancias,
    )]
    pub boveda_ganancias: Account<'info, TokenAccount>,

    #[account(mut)]
    pub comprador: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn comprar_entrada_evento(ctx: Context<ComprarEntradaEvento>, cantidad: u64) -> Result<()> {
    let total = ctx.accounts.evento.precio_entrada * cantidad;

    let ctx_transferencia = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx
                .accounts
                .cuenta_comprador_token_aceptado
                .to_account_info(),
            to: ctx.accounts.boveda_ganancias.to_account_info(),
            authority: ctx.accounts.comprador.to_account_info(),
        },
    );

    transfer(ctx_transferencia, total)?;

    ctx.accounts.evento.entradas_vendidas += cantidad;
    Ok(())
}
