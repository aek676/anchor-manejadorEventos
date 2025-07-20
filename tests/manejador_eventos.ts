import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ManejadorEventos } from "../target/types/manejador_eventos";
import * as spl from "@solana/spl-token";
import { assert } from "chai";
import { BN } from "bn.js";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";

describe("Test", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.manejadorEventos as Program<ManejadorEventos>;

  let autoridad = (anchor.getProvider().wallet as anchor.Wallet).payer;

  let tokenAceptado: anchor.web3.PublicKey;

  // PDAs
  let evento: anchor.web3.PublicKey;
  let tokenEvento: anchor.web3.PublicKey;
  let bovedaEvento: anchor.web3.PublicKey;
  let bovedaGanancias: anchor.web3.PublicKey;

  // Id del evento
  let id: string = Date.now().toString();

  // CUENTA DE BOB
  let bob: anchor.web3.Keypair;

  let cuentaTokenAceptadoBob: anchor.web3.PublicKey;
  let cuentaTokenEventoBob: anchor.web3.PublicKey;

  // CUENTA ALICE
  let alice: anchor.web3.Keypair;

  let cuentaTokenAceptadoAlice: anchor.web3.PublicKey;
  let cuentaTokenEventoAlice: anchor.web3.PublicKey;

  // Cuenta de autoridad del token aceptado
  let cuentaAutoridadTokenAceptado: anchor.web3.PublicKey;

  // creamos todo la necesario antes de correr el test
  before(async () => {
    // buscamos la PDA del evento
    [evento] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(id), Buffer.from("evento"), autoridad.publicKey.toBuffer()],
      program.programId
    );
    console.log("cuenta del evento: ", evento.toBase58());

    // PDA del token del evento
    [tokenEvento] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token_evento"), evento.toBuffer()],
      program.programId
    );
    console.log("cuenta del token del evento: ", tokenEvento.toBase58());

    // PDA de la boveda del evento
    [bovedaEvento] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("boveda_evento"), evento.toBuffer()],
      program.programId
    );
    console.log("cuenta de la boveda del evento: ", bovedaEvento.toBase58());

    // PDA boveda de ganancias
    [bovedaGanancias] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("boveda_ganancias"), evento.toBuffer()],
      program.programId
    );
    console.log("cuenta de la boveda de ganancias: ", bovedaGanancias.toBase58());

    // creamos el mint del token aceptado (para comprar entradas y tokens)
    tokenAceptado = await spl.createMint(
      program.provider.connection,
      autoridad,
      autoridad.publicKey,
      autoridad.publicKey,
      2 // Decimales del token
    );

    // Inicializamos la cuenta de token aceptado de Bob
    bob = anchor.web3.Keypair.generate();
    await tranferirSOL(bob.publicKey, 1.0);

    cuentaTokenAceptadoBob = await spl.createAssociatedTokenAccount(
      program.provider.connection,
      bob,
      tokenAceptado,
      bob.publicKey
    );

    await spl.mintTo(
      program.provider.connection,
      bob,
      tokenAceptado,
      cuentaTokenAceptadoBob,
      autoridad,
      20000
    );

    cuentaTokenEventoBob = await spl.getAssociatedTokenAddress(
      tokenEvento,
      bob.publicKey,
    );

    /// COMPRA DE ENTRADAS DE ALICE
    alice = anchor.web3.Keypair.generate();
    await tranferirSOL(alice.publicKey, 0.01);

    cuentaTokenAceptadoAlice = await spl.createAssociatedTokenAccount(
      program.provider.connection,
      alice,
      tokenAceptado,
      alice.publicKey
    );

    await spl.mintTo(
      program.provider.connection,
      autoridad,
      tokenAceptado,
      cuentaTokenAceptadoAlice,
      autoridad,
      20000
    );

    cuentaTokenEventoAlice = await spl.getAssociatedTokenAddress(
      tokenEvento,
      alice.publicKey,
    );

    cuentaAutoridadTokenAceptado = await spl.getAssociatedTokenAddress(
      tokenAceptado,
      autoridad.publicKey,
    );
  });


  it("Crear un evento", async () => {
    // Datos basicos del evento
    const nombre = "Mi primer evento";
    const descripcion = "El mejor evento del mundo!";
    const precioEntrada = 2.1;
    const precioToken = 5.0;

    // Llamamos a la instruccion del programa
    const tx = await program.methods.crearEvento(id, nombre, descripcion, precioEntrada, precioToken)
      .accounts({
        evento: evento,
        tokenAceptado: tokenAceptado,
        tokenEvento: tokenEvento,
        bovedaEvento: bovedaEvento,
        bovedaGanancias: bovedaGanancias,
        autoridad: autoridad.publicKey,
      })
      .rpc();

    // Confirmamos la transaccion 
    await program.provider.connection.confirmTransaction(tx);

    // Podemos ver la informacion almacenada en la cuenta del evento
    const infoEvento = await program.account.evento.fetch(evento);

    console.log("Informacion del evento: ", infoEvento);

    // con la informacion del evento podemos hacer comprobacion
    // comprobamos que el precio del token sea correcto
    assert.equal(infoEvento.precioToken.toNumber(), precioToken * 10 ** 2);
  });

  it("Comprar token de evento", async () => {
    let infoCuentaTokenAceptadoBob = await spl.getAccount(
      program.provider.connection,
      cuentaTokenAceptadoBob
    );

    console.log("Saldo token aceptado de Bob, Antes: ", infoCuentaTokenAceptadoBob.amount);

    const cantidad = new BN(5);
    const tx = await program.methods.comprarTokenEvento(cantidad)
      .accounts({
        evento: evento,
        cuentaCompradorTokenEvento: cuentaTokenEventoBob,
        tokenEvento: tokenEvento,
        cuentaCompradorTokenAceptado: cuentaTokenAceptadoBob,
        bovedaEvento: bovedaEvento,
        comprador: bob.publicKey,
      })
      .signers([bob])
      .rpc();

    const latestBlockhash = await program.provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: tx,
    });

    const infoCuentaTokenEventoBob = await spl.getAccount(
      program.provider.connection,
      cuentaTokenEventoBob
    );
    console.log("Tokens del evento de Bob: ", infoCuentaTokenEventoBob.amount);

    infoCuentaTokenAceptadoBob = await spl.getAccount(
      program.provider.connection,
      cuentaTokenAceptadoBob
    );
    console.log("Saldo token aceptado de Bob, Despues: ", infoCuentaTokenAceptadoBob.amount);

    const colaboradores = await program.account.colaborador.all([
      {
        memcmp: {
          offset: 8, // Offset del campo 'evento' en la cuenta de colaborador al ser el primero
          bytes: evento.toBase58(), // Convertimos la PDA a base58
        }
      }
    ]);

    const colaboradorBob = colaboradores.find(c => c.account.wallet.toBase58() === bob.publicKey.toBase58());
    assert(colaboradorBob !== undefined, "Bob debería estar en la lista de colaboradores");
  });

  it("Alice compra 2 entradas del evento", async () => {
    let infoCuentaTokenAceptadoAlice = await spl.getAccount(
      program.provider.connection,
      cuentaTokenAceptadoAlice
    );

    console.log("Saldo token aceptado de Alice, Antes: ", infoCuentaTokenAceptadoAlice.amount);

    const cantidad = new BN(2);
    const tx = await program.methods.comprarEntradaEvento(cantidad)
      .accounts({
        evento: evento,
        cuentaCompradorTokenAceptado: cuentaTokenAceptadoAlice,
        bovedaGanancias: bovedaGanancias,
        comprador: alice.publicKey,
      })
      .signers([alice])
      .rpc();

    const latestBlockhash = await program.provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: tx,
    });

    infoCuentaTokenAceptadoAlice = await spl.getAccount(
      program.provider.connection,
      cuentaTokenAceptadoAlice
    );
    console.log("Saldo token aceptado Alice, Despues: ", infoCuentaTokenAceptadoAlice.amount);

    // Obtener información actualizada del evento para ver entradas vendidas
    const infoEventoActualizado = await program.account.evento.fetch(evento);
    assert.equal(infoEventoActualizado.entradasVendidas.toNumber(), cantidad.toNumber());
  });
  it("Finalizar evento", async () => {
    const tx = await program.methods.finalizarEvento()
      .accounts({
        evento: evento,
        autoridad: autoridad.publicKey,
      })
      .signers([autoridad]) // No haria falta
      .rpc();

    await program.provider.connection.confirmTransaction(tx);

    const infoEvento = await program.account.evento.fetchNullable(evento);
    console.log("Informacion del evento despues de finalizar: ", infoEvento.activo);
  });

  it("No se puede eliminar el evento creado anteriormente", async () => {
    let error: anchor.AnchorError;
    // Llamamos a la instruccion del programa para eliminar el evento
    const tx = await program.methods.eliminarEvento()
      .accounts({
        evento: evento,
        tokenEvento: tokenEvento,
        bovedaEvento: bovedaEvento,
        bovedaGanancias: bovedaGanancias,
        autoridad: autoridad.publicKey,
      })
      .signers([autoridad]) // No haria falta
      .rpc()
      .catch(e => {
        error = e;
      });

    assert.equal(error.error.errorCode.code, "EventoConSponsors");

    const infoEvento = await program.account.evento.fetchNullable(evento);

    console.log("Sponsors del evento: ", infoEvento.totalSponsors.toNumber());
  });

  it("El usuario creador del evento retirar 2 tokens", async () => {
    let infoBovedaEvento = await spl.getAccount(program.provider.connection, bovedaEvento);
    console.log("Saldo de la boveda del evento, Antes: ", infoBovedaEvento.amount);

    const cantidad = new BN(2);

    const tx = await program.methods.retirarFondos(cantidad)
      .accounts({
        evento: evento,
        cuentaAutoridadTokenAceptado: cuentaAutoridadTokenAceptado,
        bovedaEvento: bovedaEvento,
        tokenAceptado: tokenAceptado,
        autoridad: autoridad.publicKey,
      })
      .rpc();

    const latestBlockhash = await program.provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: tx,
    });

    infoBovedaEvento = await spl.getAccount(program.provider.connection, bovedaEvento);
    console.log("Saldo de la boveda del evento, Despues: ", infoBovedaEvento.amount);
  });

  it("Alice compra 12 tokens del evento", async () => {
    let infoCuentaTokenAceptadoAlice = await spl.getAccount(
      program.provider.connection,
      cuentaTokenAceptadoAlice
    );
    console.log("Saldo token aceptado de Alice, Antes: ", infoCuentaTokenAceptadoAlice.amount);

    const cantidad = new BN(12);

    const tx = await program.methods.comprarTokenEvento(cantidad)
      .accounts({
        evento: evento,
        cuentaCompradorTokenEvento: cuentaTokenEventoAlice,
        tokenEvento: tokenEvento,
        cuentaCompradorTokenAceptado: cuentaTokenAceptadoAlice,
        bovedaEvento: bovedaEvento,
        comprador: alice.publicKey,
      })
      .signers([alice])
      .rpc();

    const latestBlockhash = await program.provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: tx,
    });

    const infoCuentaTokenEventoAlice = await spl.getAccount(
      program.provider.connection,
      cuentaTokenEventoAlice
    );
    console.log("Tokens del evento de Alice: ", infoCuentaTokenEventoAlice.amount);
  });

  it("El usuario Bob retirar sus ganancias", async () => {
    let infoBovedaGanancias = await spl.getAccount(program.provider.connection, bovedaGanancias);
    console.log("Saldo de la boveda de ganancias, Antes: ", infoBovedaGanancias.amount);

    const cantidad = new BN(5);

    const tx = await program.methods.retirarGanancias()
      .accountsPartial({
        evento: evento,
        tokenEvento: tokenEvento,
        bovedaGanancias: bovedaGanancias,
        cuentaColaboradorTokenEvento: cuentaTokenEventoBob,
        cuentaColaboradorTokenAceptado: cuentaTokenAceptadoBob,
        colaborador: bob.publicKey,
      })
      .signers([bob])
      .rpc();

    const latestBlockhash = await program.provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: tx,
    });

    infoBovedaGanancias = await spl.getAccount(program.provider.connection, bovedaGanancias);
    console.log("Saldo de la boveda de ganancias, Despues: ", infoBovedaGanancias.amount);
  });
});

const tranferirSOL = async (destinatario: anchor.web3.PublicKey, cantidad = 1.0) => {
  let transaccion = new anchor.web3.Transaction().add(
    anchor.web3.SystemProgram.transfer({
      fromPubkey: anchor.getProvider().wallet.publicKey,
      toPubkey: destinatario,
      lamports: cantidad * anchor.web3.LAMPORTS_PER_SOL,
    })
  );
  await anchor.web3.sendAndConfirmTransaction(
    anchor.getProvider().connection,
    transaccion,
    [anchor.getProvider().wallet.payer]
  );
};