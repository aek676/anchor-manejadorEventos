use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Colaborador {
    pub evento: Pubkey,        // Referencia al evento
    pub wallet: Pubkey,        // Wallet del colaborador
    pub tokens_comprados: u64, // Tokens comprados por el colaborador

    pub bump: u8,
}

impl Colaborador {
    pub const SEMILLA_COLABORADOR: &'static str = "colaborador"; // Semilla para la PDA del colaborador
}
