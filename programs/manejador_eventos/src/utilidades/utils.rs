pub fn calcular_porcentaje(total: u64, cantidad: u64) -> f64 {
    let temp = cantidad * 100;
    let porcentaje = (temp as f64) / (total as f64);
    porcentaje
}

pub fn calcular_ganancia(total: u64, porcentaje: f64) -> u64 {
    let temp = (total as f64) * porcentaje;
    let ganancia = (temp as f64) / (100.);
    ganancia.floor() as u64
}
