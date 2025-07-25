use crate::colecciones::*;
use crate::utilidades::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::*;
use anchor_spl::token::*;

#[derive(Accounts)]
pub struct RetirarGanancias<'info> {
    #[account(
        mut,
        seeds = [
            evento.id.as_ref(),
            Evento::SEMILLA_EVENTO.as_bytes(),
            evento.autoridad.key().as_ref(),
        ],
        bump = evento.bump_evento,
        constraint = evento.activo == false @ CodigoError::EventoActivo,
    )]
    pub evento: Account<'info, Evento>,

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
        constraint = cuenta_colaborador_token_aceptado.mint == evento.token_aceptado @ CodigoError::TokenIncorrecto,
    )]
    pub cuenta_colaborador_token_aceptado: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = cuenta_colaborador_token_evento.mint == token_evento.key() @ CodigoError::TokenIncorrecto,
    )]
    pub cuenta_colaborador_token_evento: Account<'info, TokenAccount>,

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
    pub colaborador: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn retirar_ganancias(ctx: Context<RetirarGanancias>) -> Result<()> {
    let total_token_vendidos = ctx.accounts.evento.tokens_vendidos;
    let tokens_colaborador = ctx.accounts.cuenta_colaborador_token_evento.amount;
    let total_boveda_ganancias = ctx.accounts.boveda_ganancias.amount;

    // calculamos la ganancia del colaborador
    let porcentaje = calcular_porcentaje(total_token_vendidos, tokens_colaborador);

    // calculamos el total a transferir con el porcentaje anterior
    let total_ganancias_colaborador = calcular_ganancia(total_boveda_ganancias, porcentaje);

    let ctx_quemar = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.token_evento.to_account_info(),
            from: ctx
                .accounts
                .cuenta_colaborador_token_evento
                .to_account_info(),
            authority: ctx.accounts.colaborador.to_account_info(),
        },
    );

    burn(ctx_quemar, tokens_colaborador)?;

    msg!("Cerrando cuenta de token del colaborador");

    let ctx_cerrar_cuenta_evento = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx
                .accounts
                .cuenta_colaborador_token_evento
                .to_account_info(),
            destination: ctx.accounts.colaborador.to_account_info(),
            authority: ctx.accounts.colaborador.to_account_info(),
        },
    );

    close_account(ctx_cerrar_cuenta_evento)?;

    let semillas_firma: &[&[&[u8]]] = &[&[
        ctx.accounts.evento.id.as_ref(),
        Evento::SEMILLA_EVENTO.as_bytes(),
        ctx.accounts.evento.autoridad.as_ref(),
        &[ctx.accounts.evento.bump_evento],
    ]];

    let ctx_transferencia = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.boveda_ganancias.to_account_info(),
            to: ctx
                .accounts
                .cuenta_colaborador_token_aceptado
                .to_account_info(),
            authority: ctx.accounts.evento.to_account_info(),
        },
    )
    .with_signer(semillas_firma);

    transfer(ctx_transferencia, total_ganancias_colaborador)?;

    Ok(())
}
