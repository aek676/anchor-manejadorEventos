# Manejador de Eventos en Solana con Anchor

Este proyecto es una aplicación basada en Solana y Anchor para la gestión de eventos y entradas, con frontend en Next.js y backend en Rust.

## Clonar el repositorio

```bash
git clone https://github.com/aek676/anchor-manejadorEventos.git
cd anchor-manejadorEventos
```

## Ejecutar Docker Compose

Asegúrate de tener Docker y Docker Compose instalados. Luego ejecuta:

```bash
docker-compose up --build
```

Esto levantará los servicios necesarios para el desarrollo local.

## Instalar Phantom Wallet

1. Ve a [https://phantom.app/download](https://phantom.app/download)
2. Instala la extensión para tu navegador (Chrome, Firefox, Edge, Brave, etc.)
3. Crea una nueva wallet o importa una existente.

## Configurar Phantom en Devnet

1. Abre Phantom Wallet.
2. Haz clic en la imagen de la Cuenta y despues clic en el icono de configuración (⚙️).
3. Ve a "Ajustes para desarroladores".
4. Despues activa el "Modo Testnet".
5. Y dentro de "Solana" estar en **Solana Devnet**.
<img width="384" height="685" alt="image" src="https://github.com/user-attachments/assets/159a3843-b2e9-4fce-b067-35b6f76df7d9" />

## Conseguir SOL en Devnet

1. Copia la dirección de tu wallet en Phantom.
![image](https://github.com/user-attachments/assets/baa7ffa4-5bdc-4a5a-8da8-829d964beebd)
3. Ve a [https://faucet.solana.com/](https://faucet.solana.com/).
4. Pega tu dirección y solicita SOL gratis para pruebas.

## Conseguir USDC en Devnet

1. Ve a [https://spl-token-faucet.com/?token-name=USDC-Dev](https://spl-token-faucet.com/?token-name=USDC-Dev)
2. Conecta tu wallet y solicita USDC

---

¡Listo! Ahora puedes usar la aplicación y probar todas sus funcionalidades en el entorno de desarrollo.
