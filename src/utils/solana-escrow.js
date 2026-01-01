import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const programId = new PublicKey("ESXbQqfvaBFkVZZVbux1KAxqKbq5pnfPUadXuwCiaq7F");
const connection = new Connection("https://api.testnet.solana.com", "confirmed");

export async function depositToEscrow(wallet, amountSol) {
  try {
    const lamports = amountSol * 1e9;

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: programId,
        lamports,
      })
    );

    console.log(`Depositing ${amountSol} SOL to escrow`);
    const signature = await wallet.sendTransaction(tx, connection);
    console.log(`Transaction sent: ${signature}`);
    
    const confirmation = await connection.confirmTransaction(signature, "confirmed");
    console.log(`Transaction confirmed: ${JSON.stringify(confirmation)}`);
    
    return signature;
  } catch (error) {
    console.error("Error in depositToEscrow:", error);
    throw error;
  }
}
