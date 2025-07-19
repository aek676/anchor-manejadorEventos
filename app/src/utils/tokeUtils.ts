export function formatearTokens(valor: number, decimales: number): number {
    if (isNaN(valor) || decimales < 0) {
        throw new Error('Valor o decimales inválidos');
    }
    return Math.round(valor * Math.pow(10, decimales));

}