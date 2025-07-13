use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Evento {
    #[max_len(16)]
    pub id: String,

    #[max_len(40)]
    pub nombre: String,

    #[max_len(150)]
    pub descripcion: String,

    pub precio_entrada: u64,
    pub precio_token: u64,

    pub activo: bool,
    pub total_sponsors: u64,
    pub sponsors_actuales: u64,
    pub tokens_vendidos: u64,
    pub entradas_vendidas: u64,

    //--------------cuentas ---------------
    pub autoridad: Pubkey,
    pub token_aceptado: Pubkey,

    //----------------- bumps ---------------
    pub bump_evento: u8,
    pub bump_token_evento: u8,
    pub bump_boveda_evento: u8,
    pub bump_boveda_ganancias: u8,
}

impl Evento {
    pub const SEMILLA_EVENTO: &'static str = "evento"; // Semilla para la PDA del evento
    pub const SEMILLA_TOKEN_EVENTO: &'static str = "token_evento"; // Semilla para la PDA del token del evento
    pub const SEMILLA_BOVEDA_GANANCIAS: &'static str = "boveda_ganancias"; // Semilla para la PDA de la boveda de ganancias
    pub const SEMILLA_BOVEDA_EVENTO: &'static str = "boveda_evento"; // Semilla para la PDA de la boveda del evento
}
