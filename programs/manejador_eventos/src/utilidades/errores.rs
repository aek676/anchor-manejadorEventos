use anchor_lang::prelude::*;

// definimos una estructura enum para los errores personalizados

// marcamos con la macro de errores
#[error_code]
pub enum CodigoError {
    #[msg("Solo la autoridad del evento puede eliminarlo")]
    UsuarioNoAutorizado,

    #[msg("No puedes eliminar un evento con colaboradores")]
    EventoConSponsors,

    #[msg("No puedes eliminar el evento si la boveda del evento no esta vacia")]
    BovedaDelEventoNoVacia,

    #[msg("No puedes eliminar el evento si la boveda de ganacias no esta vacia")]
    BovedaDeGananciasNoVacia,

    #[msg("Los tokens almacenados en la cuenta no corresponden al token esperado")]
    TokenIncorrecto,

    #[msg("La cuenta no tiene fondos suficientes")]
    SaldoInsuficiente,

    #[msg("El evento sigue activo")]
    EventoActivo,

    #[msg("La cantidad solicitada es invalida")]
    CantidadInvalida,

    #[msg("Overflow al intentar realizar la operacion")]
    OverflowError,

    #[msg("No hay suficientes tokens disponibles para la compra")]
    TokensInsuficientes,

    #[msg("El colaborador tiene saldo pendiente")]
    ColaboradorConSaldo,

    #[msg("La wallet del colaborador no coincide con la esperada")]
    WalletIncorrecta,
}
