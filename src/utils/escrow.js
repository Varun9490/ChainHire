import * as web3 from "@solana/web3.js";
import { Buffer } from "buffer";
import * as borsh from "borsh";
import BN from "bn.js";

const PROGRAM_ID = new web3.PublicKey(
  process.env.PROGRAM_ID || "ESXbQqfvaBFkVZZVbux1KAxqKbq5pnfPUadXuwCiaq7F"
);

// ✅ 1. Borsh-compatible class
class EscrowInstruction {
  constructor({ variant, amount }) {
    this.variant = variant;
    this.amount = amount;
  }
}

// Define the schema as a simple object instead of Map
const ESCROW_SCHEMA = {
  EscrowInstruction: {
    kind: "struct",
    fields: [
      ["variant", "u8"],
      ["amount", "u64"],
    ],
  },
};

// Manual serialization function as fallback
function serializeEscrowInstruction(variant, amount) {
  const buffer = Buffer.alloc(9); // 1 byte for variant + 8 bytes for amount
  buffer.writeUInt8(variant, 0);
  
  // Convert amount to string and handle it manually
  const amountStr = amount.toString();
  const amountNum = parseInt(amountStr, 10);
  
  // Write as little-endian 64-bit integer
  buffer.writeUInt32LE(amountNum & 0xFFFFFFFF, 1); // Lower 32 bits
  buffer.writeUInt32LE(Math.floor(amountNum / 0x100000000), 5); // Upper 32 bits
  
  return buffer;
}

// ✅ 2. Initialize instruction
function createInitializeInstruction(
  clientPubkey,
  freelancerPubkey,
  escrowPubkey,
  systemProgram,
  amount // number | string | BigInt
) {
  try {
    // Convert amount to BN properly
    let bnAmount;
    if (typeof amount === 'bigint') {
      bnAmount = new BN(amount.toString());
    } else if (typeof amount === 'string') {
      bnAmount = new BN(amount);
    } else {
      bnAmount = new BN(amount);
    }

    console.log('Creating initialize instruction with:', {
      variant: 0,
      amount: bnAmount.toString(),
      amountType: typeof amount,
      bnAmountType: typeof bnAmount
    });

    let serialized;
    
    try {
      // Try Borsh first
      const instructionData = new EscrowInstruction({
        variant: 0,
        amount: bnAmount,
      });
      serialized = borsh.serialize(ESCROW_SCHEMA, instructionData);
      console.log('Using Borsh serialization, length:', serialized.length);
    } catch (borshError) {
      console.log('Borsh serialization failed, using manual serialization');
      // Fallback to manual serialization
      serialized = serializeEscrowInstruction(0, bnAmount);
      console.log('Using manual serialization, length:', serialized.length);
    }

    return new web3.TransactionInstruction({
      keys: [
        { pubkey: clientPubkey, isSigner: true, isWritable: true },
        { pubkey: freelancerPubkey, isSigner: false, isWritable: false },
        { pubkey: escrowPubkey, isSigner: false, isWritable: true },
        { pubkey: systemProgram, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from(serialized),
    });
  } catch (error) {
    console.error('Error in createInitializeInstruction:', error);
    throw error;
  }
}

// ✅ 3. Release instruction
function createReleaseInstruction(
  clientPubkey,
  freelancerPubkey,
  escrowPubkey
) {
  try {
    let serialized;
    
    try {
      // Try Borsh first
      const instructionData = new EscrowInstruction({
        variant: 1,
        amount: new BN(0),
      });
      serialized = borsh.serialize(ESCROW_SCHEMA, instructionData);
    } catch (borshError) {
      console.log('Borsh serialization failed for release, using manual serialization');
      // Fallback to manual serialization
      serialized = serializeEscrowInstruction(1, new BN(0));
    }

    return new web3.TransactionInstruction({
      keys: [
        { pubkey: clientPubkey, isSigner: true, isWritable: true },
        { pubkey: freelancerPubkey, isSigner: true, isWritable: true },
        { pubkey: escrowPubkey, isSigner: false, isWritable: true },
      ],
      programId: PROGRAM_ID,
      data: Buffer.from(serialized),
    });
  } catch (error) {
    console.error('Error in createReleaseInstruction:', error);
    throw error;
  }
}

export { createInitializeInstruction, createReleaseInstruction };
