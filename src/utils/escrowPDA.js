import { PublicKey } from "@solana/web3.js";
const PROGRAM_ID = new PublicKey("ESXbQqfvaBFkVZZVbux1KAxqKbq5pnfPUadXuwCiaq7F");

export async function deriveEscrowPDA(jobId) {
  return await PublicKey.findProgramAddress(
    [Buffer.from("escrow"), Buffer.from(jobId)],
    PROGRAM_ID
  );
}
