use anchor_lang::prelude::*;
use anchor_spl::token::*;

use crate::colecciones::*;
use crate::utilidades::*;

#[derive(Accounts)]
pub struct EliminarEvento<'info> {
    // Cuentas
    #[account(
        mut,
        seeds = [
            evento.id.as_ref(),
            Evento::SEMILLA_EVENTO.as_bytes(),
            autoridad.key().as_ref(),
        ],
        bump = evento.bump_evento,
        constraint = evento.total_sponsors == 0 @ CodigoError::EventoConSponsors,
        constraint = evento.autoridad == autoridad.key() @ CodigoError::UsuarioNoAutorizado,
        close = autoridad
    )]
    pub evento: Account<'info, Evento>,

    #[account(
        mut,
        seeds = [
            Evento::SEMILLA_BOVEDA_EVENTO.as_bytes(),
            evento.key().as_ref(),
        ],
        bump = evento.bump_boveda_evento,
        constraint = boveda_evento.amount == 0 @ CodigoError::BovedaDelEventoNoVacia,
        // No se agrega el Close porque se cierra por CPI
    )]
    pub boveda_evento: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            Evento::SEMILLA_BOVEDA_GANANCIAS.as_bytes(),
            evento.key().as_ref(),
        ],
        bump = evento.bump_boveda_ganancias,
        constraint = boveda_ganancias.amount == 0 @ CodigoError::BovedaDeGananciasNoVacia,
        // No se agrega el Close porque se cierra por CPI
    )]
    pub boveda_ganancias: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            Evento::SEMILLA_TOKEN_EVENTO.as_bytes(),
            evento.key().as_ref(),
        ],
        bump = evento.bump_token_evento,
    )]
    pub token_evento: Account<'info, Mint>,

    // AUTORIDAD
    #[account(mut)]
    pub autoridad: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn eliminar_evento(ctx: Context<EliminarEvento>) -> Result<()> {
    let semillas_firma: &[&[&[u8]]] = &[&[
        ctx.accounts.evento.id.as_ref(),
        Evento::SEMILLA_EVENTO.as_bytes(),
        ctx.accounts.evento.autoridad.as_ref(),
        &[ctx.accounts.evento.bump_evento],
    ]];

    let cerrar_boveda_evento: CpiContext<'_, '_, '_, '_, CloseAccount<'_>> = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.boveda_evento.to_account_info(),
            destination: ctx.accounts.autoridad.to_account_info(),
            authority: ctx.accounts.evento.to_account_info(),
        },
    )
    .with_signer(semillas_firma);

    close_account(cerrar_boveda_evento)?;

    let cerrar_boveda_ganancias = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.boveda_ganancias.to_account_info(),
            destination: ctx.accounts.autoridad.to_account_info(),
            authority: ctx.accounts.evento.to_account_info(),
        },
    )
    .with_signer(semillas_firma);

    close_account(cerrar_boveda_ganancias)?;

    let revocar_autoridad = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        SetAuthority {
            account_or_mint: ctx.accounts.token_evento.to_account_info(),
            current_authority: ctx.accounts.evento.to_account_info(),
        },
    )
    .with_signer(semillas_firma);

    set_authority(
        revocar_autoridad,
        spl_token::instruction::AuthorityType::MintTokens,
        None,
    )?;

    Ok(())
}
