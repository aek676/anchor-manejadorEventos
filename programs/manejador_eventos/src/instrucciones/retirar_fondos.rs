use crate::colecciones::*;
use crate::utilidades::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::*;
use anchor_spl::token::*;

#[derive(Accounts)]
#[instruction(cantidad: u64)]
pub struct RetirarFondos<'info> {
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
        init_if_needed,
        payer = autoridad,
        associated_token::mint = token_aceptado,
        associated_token::authority = autoridad,
    )]
    pub cuenta_token_aceptado_autoridad: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            Evento::SEMILLA_BOVEDA_EVENTO.as_bytes(),
            evento.key().as_ref(),
        ],
        bump = evento.bump_boveda_evento,
        constraint = boveda_evento.amount >= (cantidad * 10u64.pow(token_aceptado.decimals.into())) @ CodigoError::SaldoInsuficiente,
    )]
    pub boveda_evento: Account<'info, TokenAccount>,

    pub token_aceptado: Account<'info, Mint>,

    #[account(mut)]
    pub autoridad: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn retirar_fondos(ctx: Context<RetirarFondos>, cantidad: u64) -> Result<()> {
    let semillas_firma: &[&[&[u8]]] = &[&[
        ctx.accounts.evento.id.as_ref(),
        Evento::SEMILLA_EVENTO.as_bytes(),
        ctx.accounts.evento.autoridad.as_ref(),
        &[ctx.accounts.evento.bump_evento],
    ]];

    let total = cantidad * 10_u64.pow(ctx.accounts.token_aceptado.decimals.into());

    let ctx_transferencia = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.boveda_evento.to_account_info(),
            to: ctx
                .accounts
                .cuenta_token_aceptado_autoridad
                .to_account_info(),
            authority: ctx.accounts.evento.to_account_info(),
        },
    )
    .with_signer(semillas_firma);

    transfer(ctx_transferencia, total)?;

    Ok(())
}
