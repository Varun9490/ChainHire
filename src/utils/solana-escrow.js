import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const programId = new PublicKey("ESXbQqfvaBFkVZZVbux1KAxqKbq5pnfPUadXuwCiaq7F");
const connection = new Connection("https://api.devnet.solana.com");

export async function depositToEscrow(wallet, amountSol) {
  const lamports = amountSol * 1e9;

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: programId,
      lamports,
    })
  );

  const signature = await wallet.sendTransaction(tx, connection);
  await connection.confirmTransaction(signature, "confirmed");
  return signature;
}
