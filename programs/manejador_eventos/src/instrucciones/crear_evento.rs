use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::colecciones::Evento;

#[derive(Accounts)]
#[instruction(id: String)]
pub struct CrearEvento<'info> {
    #[account(
        init,
        seeds = [
            id.to_string().as_ref(),
            Evento::SEMILLA_EVENTO.as_bytes(),
            autoridad.key().as_ref(),
        ],
        bump,
        payer = autoridad,
        space = 8 + Evento::INIT_SPACE
    )]
    pub evento: Account<'info, Evento>,

    pub token_aceptado: Account<'info, Mint>,

    #[account(
        init,
        seeds = [
            Evento::SEMILLA_TOKEN_EVENTO.as_bytes(),
            evento.key().as_ref(),
        ],
        bump,
        payer = autoridad,
        mint::decimals = 0,
        mint::authority = evento,
    )]
    pub token_evento: Account<'info, Mint>,

    #[account(
        init,
        payer = autoridad,
        seeds = [
            Evento::SEMILLA_BOVEDA_EVENTO.as_bytes(),
            evento.key().as_ref(),
        ],
        bump,
        token::mint = token_aceptado,
        token::authority = evento,
    )]
    pub boveda_evento: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = autoridad,
        seeds = [
            Evento::SEMILLA_BOVEDA_GANANCIAS.as_bytes(),
            evento.key().as_ref(),
        ],
        bump,
        token::mint = token_aceptado,
        token::authority = evento,
    )]
    pub boveda_ganancias: Account<'info, TokenAccount>,

    #[account(mut)]
    pub autoridad: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

// definicimos el cuerpo de la funcion de la instruccion
pub fn crear_evento(
    ctx: Context<CrearEvento>,
    id: String,
    nombre: String,
    descripcion: String,
    uri_img: Option<String>,
    precio_entrada: f64,
    precio_token: f64,
) -> Result<()> {
    // almacenamos los datos del evento en la cuenta
    ctx.accounts.evento.id = id;
    ctx.accounts.evento.nombre = nombre;
    ctx.accounts.evento.descripcion = descripcion;

    if let Some(uri_img) = uri_img {
        ctx.accounts.evento.uri_img = uri_img;
    } else {
        ctx.accounts.evento.uri_img = Evento::URI_IMG_DEFAULT.to_string();
    }

    // precios
    let factor_decimales = 10_f64.powf(ctx.accounts.token_aceptado.decimals as f64);
    ctx.accounts.evento.precio_entrada = (precio_entrada * factor_decimales) as u64; // Convertimos a lamports
    ctx.accounts.evento.precio_token = (precio_token * factor_decimales) as u64; // Convertimos a lamports

    ctx.accounts.evento.activo = true;
    ctx.accounts.evento.total_sponsors = 0;
    ctx.accounts.evento.sponsors_actuales = 0;

    // cuentas
    ctx.accounts.evento.autoridad = ctx.accounts.autoridad.key();
    ctx.accounts.evento.token_aceptado = ctx.accounts.token_aceptado.key();

    // bumps
    ctx.accounts.evento.bump_evento = ctx.bumps.evento;
    ctx.accounts.evento.bump_token_evento = ctx.bumps.token_evento;
    ctx.accounts.evento.bump_boveda_evento = ctx.bumps.boveda_evento;
    ctx.accounts.evento.bump_boveda_ganancias = ctx.bumps.boveda_ganancias;

    Ok(())
}
