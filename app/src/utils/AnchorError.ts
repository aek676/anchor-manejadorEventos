// Enum de códigos de error (debe coincidir con tu programa Rust)
enum CodigoError {
    UsuarioNoAutorizado = 6000,
    EventoConSponsors = 6001,
    BovedaDelEventoNoVacia = 6002,
    BovedaDeGananciasNoVacia = 6003,
    TokenIncorrecto = 6004,
    SaldoInsuficiente = 6005,
    EventoActivo = 6006,
    CantidadInvalida = 6007,
    OverflowError = 6008,
    TokensInsuficientes = 6009,
}

function getMensajeErrorAnchor(errorCode: CodigoError): string {

    switch (errorCode) {
        case CodigoError.EventoActivo:
            return 'No puedes retirar fondos porque el evento sigue activo.';
        case CodigoError.UsuarioNoAutorizado:
            return 'No tienes autorización para realizar esta acción.';
        case CodigoError.SaldoInsuficiente:
            return 'Saldo insuficiente para realizar esta operación.';
        case CodigoError.TokenIncorrecto:
            return 'Token incorrecto para esta operación.';
        case CodigoError.CantidadInvalida:
            return 'La cantidad especificada no es válida.';
        case CodigoError.TokensInsuficientes:
            return 'No tienes suficientes tokens para esta operación.';
        default:
            return `Error del programa (código: ${errorCode})`;
    }
}

export { CodigoError, isAnchorError, getMensajeErrorAnchor };
export type { AnchorError };
