import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "ESXbQqfvaBFkVZZVbux1KAxqKbq5pnfPUadXuwCiaq7F"
);

export async function releaseEscrow({ payer, receiver, sendTransaction }) {
  const connection = new Connection("https://api.devnet.solana.com");

  const receiverPubkey = new PublicKey(receiver);

  // Example transfer of 0.5 SOL from client to freelancer
  const lamports = 0.5 * 1e9;

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: receiverPubkey,
      lamports,
    })
  );

  const signature = await sendTransaction(tx, connection);
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}
