import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ManejadorEventos } from "../target/types/manejador_eventos";
import * as spl from "@solana/spl-token";
import { assert } from "chai";

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

  it("Finalizar evento", async () => {
    const tx = await program.methods.finalizarEvento()
      .accounts({
        evento: evento,
        autoridad: autoridad.publicKey,
      })
      .signers([autoridad])
      .rpc();

    await program.provider.connection.confirmTransaction(tx);

    const infoEvento = await program.account.evento.fetchNullable(evento);
    console.log("Informacion del evento despues de finalizar: ", infoEvento.activo);
  });

  it("Eliminar un evento", async () => {
    // Llamamos a la instruccion del programa para eliminar el evento
    const tx = await program.methods.eliminarEvento()
      .accounts({
        evento: evento,
        tokenEvento: tokenEvento,
        bovedaEvento: bovedaEvento,
        bovedaGanancias: bovedaGanancias,
        autoridad: autoridad.publicKey,
      })
      .signers([autoridad])
      .rpc();

    // Confirmamos la transaccion
    await program.provider.connection.confirmTransaction(tx);

    const infoEvento = await program.account.evento.fetchNullable(evento);
    console.log("Informacion del evento despues de eliminar: ", infoEvento);
    assert.isNull(infoEvento, "El evento no se ha eliminado correctamente");
  });


});
