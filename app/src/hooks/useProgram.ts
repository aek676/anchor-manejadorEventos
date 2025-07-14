'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl, setProvider } from '@coral-xyz/anchor';
import { ManejadorEventos } from '../anchor/manejador_eventos';
import idl from '../anchor/manejador_eventos.json';
import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';

const PROGRAM_ID = new PublicKey(idl.address);

export function useProgram() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const provider = useMemo(() => {
        if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;

        const walletAdapter = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
        };

        return new AnchorProvider(connection, walletAdapter, {
            commitment: 'confirmed',
        });
    }, [connection, wallet]);

    const program = useMemo(() => {
        if (!provider) return null;

        setProvider(provider);
        return new Program(idl as Idl, provider) as Program<ManejadorEventos>;
    }, [provider]);

    return {
        program,
        provider,
        programId: PROGRAM_ID,
    };
}
