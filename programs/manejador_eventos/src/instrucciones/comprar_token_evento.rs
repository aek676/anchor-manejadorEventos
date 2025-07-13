use crate::colecciones::*;
use crate::utilidades::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::*;
use anchor_spl::token::*;

#[derive(Accounts)]
pub struct ComprarTokenEvento<'info> {
    #[account(
        mut,
        seeds = [
            evento.id.to_string().as_ref(),
            Evento::SEMILLA_EVENTO.as_bytes(),
            evento.autoridad.key().as_ref(),
        ],
        bump,
    )]
    pub evento: Account<'info, Evento>,

    #[account(
        init_if_needed,
        payer = comprador,
        associated_token::mint = token_evento,
        associated_token::authority = comprador,
    )]
    pub cuenta_comprador_token_evento: Account<'info, TokenAccount>,

    pub token_evento: Account<'info, Mint>,

    #[account(
        mut,
        constraint = cuenta_comprador_token_aceptado.mint == evento.token_aceptado @ CodigoError::TokenIncorrecto,
        constraint = cuenta_comprador_token_aceptado.amount > 0 @ CodigoError::SaldoInsuficiente,
    )]
    pub cuenta_comprador_token_aceptado: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            Evento::SEMILLA_BOVEDA_EVENTO.as_bytes(),
            evento.key().as_ref(),
        ],
        bump,
    )]
    pub boveda_evento: Account<'info, TokenAccount>,

    #[account(mut)]
    pub comprador: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn comprar_token_evento(ctx: Context<ComprarTokenEvento>, cantidad: u64) -> Result<()> {
    let semillas_firma: &[&[&[u8]]] = &[&[
        ctx.accounts.evento.id.as_ref(),
        Evento::SEMILLA_EVENTO.as_bytes(),
        ctx.accounts.evento.autoridad.as_ref(),
        &[ctx.accounts.evento.bump_evento],
    ]];

    let total = ctx.accounts.evento.precio_token * cantidad;

    let ctx_transferencia = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx
                .accounts
                .cuenta_comprador_token_aceptado
                .to_account_info(),
            to: ctx.accounts.boveda_evento.to_account_info(),
            authority: ctx.accounts.comprador.to_account_info(),
        },
    );

    transfer(ctx_transferencia, total)?;

    let ctx_mint = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.token_evento.to_account_info(),
            to: ctx.accounts.cuenta_comprador_token_evento.to_account_info(),
            authority: ctx.accounts.evento.to_account_info(),
        },
    )
    .with_signer(semillas_firma);

    mint_to(ctx_mint, cantidad)?;

    ctx.accounts.evento.tokens_vendidos += cantidad;
    ctx.accounts.evento.total_sponsors += 1;
    ctx.accounts.evento.sponsors_actuales += 1;

    Ok(())
}
