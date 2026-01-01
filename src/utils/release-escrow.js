import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { createReleaseInstruction } from "./escrow";
import { deriveEscrowPDA } from "./escrowPDA";

const PROGRAM_ID = new PublicKey(
  "ESXbQqfvaBFkVZZVbux1KAxqKbq5pnfPUadXuwCiaq7F"
);

export async function releaseEscrow({ payer, receiver, jobId, amount, sendTransaction }) {
  try {
    const connection = new Connection("https://api.testnet.solana.com", "confirmed");
    const receiverPubkey = new PublicKey(receiver);
    
    // Convert SOL to lamports
    const lamports = amount * 1e9;
    
    // Derive the escrow PDA for this job
    const [escrowPDA] = await deriveEscrowPDA(jobId);
    
    console.log(`Releasing ${amount} SOL from escrow for job ${jobId}`);
    console.log(`Escrow PDA: ${escrowPDA.toBase58()}`);
    console.log(`Receiver: ${receiverPubkey.toBase58()}`);
    
    // Create the release instruction
    const releaseInstruction = createReleaseInstruction(
      payer.publicKey,
      receiverPubkey,
      escrowPDA
    );
    
    // Create and send the transaction
    const tx = new Transaction().add(releaseInstruction);
    
    console.log("Sending release transaction...");
    const signature = await sendTransaction(tx, connection);
    console.log(`Transaction sent: ${signature}`);
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, "confirmed");
    console.log(`Transaction confirmed: ${JSON.stringify(confirmation)}`);
    
    return {
      signature,
      success: true,
      message: `Successfully released ${amount} SOL to ${receiverPubkey.toBase58()}`
    };
  } catch (error) {
    console.error("Error in releaseEscrow:", error);
    return {
      success: false,
      message: error.message || "Failed to release escrow funds",
      error
    };
  }
}
