import {
  increaseLiquidityQuoteByInputToken,
  PDAUtil,
} from '@orca-so/whirlpools-sdk';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// Have to get this version of the whirlpool so we can use its attributes
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { increaseLiquidityIx } from '@orca-so/whirlpools-sdk/dist/instructions';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';
import Decimal from 'decimal.js';
import { Percentage } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

export async function whirlpoolIncreaseLiquidity({
  whirlpool,
  authority,
  uiAmountTokenA,
  uiSlippage,
  position,
}: {
  whirlpool: WhirlpoolImpl;
  authority: PublicKey;
  uiAmountTokenA: number;
  uiSlippage: number;
  position: PublicKey;
}): Promise<TransactionInstruction> {
  if (uiSlippage < 0 || uiSlippage > 100) {
    throw new Error('Slippage must be between 0 and 100 included');
  }

  const [whirlpoolData, positionData] = await Promise.all([
    whirlpool.fetcher.getPool(whirlpool.address, false),
    whirlpool.fetcher.getPosition(position, false),
  ]);

  if (!whirlpoolData) {
    throw new Error(
      `Cannot find the whirlpool data at address ${whirlpool.address.toBase58()}`,
    );
  }

  if (!positionData) {
    throw new Error(
      `Cannot find the position data at address ${position.toBase58()}`,
    );
  }

  const tickArrayLowerPda = PDAUtil.getTickArrayFromTickIndex(
    positionData.tickLowerIndex,
    whirlpoolData.tickSpacing,
    whirlpool.address,
    whirlpool.ctx.program.programId,
  );

  const tickArrayUpperPda = PDAUtil.getTickArrayFromTickIndex(
    positionData.tickUpperIndex,
    whirlpoolData.tickSpacing,
    whirlpool.address,
    whirlpool.ctx.program.programId,
  );

  const {
    liquidityAmount,
    tokenMaxA,
    tokenMaxB,
  } = increaseLiquidityQuoteByInputToken(
    whirlpoolData.tokenMintA,
    new Decimal(uiAmountTokenA),
    positionData.tickLowerIndex,
    positionData.tickUpperIndex,
    Percentage.fromFraction(new u64(uiSlippage), new u64(100)),
    whirlpool,
  );

  const [
    [positionTokenAccount],
    [tokenOwnerAccountA],
    [tokenOwnerAccountB],
  ] = findMultipleATAAddSync(authority, [
    positionData.positionMint,
    whirlpoolData.tokenMintA,
    whirlpoolData.tokenMintB,
  ]);

  const increaseLiquidityInstruction = increaseLiquidityIx(
    whirlpool.ctx.program,
    {
      liquidityAmount,
      tokenMaxA,
      tokenMaxB,
      position,
      positionTokenAccount,
      tokenOwnerAccountA,
      tokenOwnerAccountB,
      whirlpool: whirlpool.address,
      positionAuthority: authority,
      tokenVaultA: whirlpoolData.tokenVaultA,
      tokenVaultB: whirlpoolData.tokenVaultB,
      tickArrayLower: tickArrayLowerPda.publicKey,
      tickArrayUpper: tickArrayUpperPda.publicKey,
    },
  );

  if (increaseLiquidityInstruction.instructions.length !== 1) {
    throw new Error('increaseLiquidityIx created more than one instruction');
  }

  // @tricks the increaseLiquidityIx returns an Instruction type when we want a TransactionInstruction
  // because we know the Instruction only contains one instruction, we extract it manually
  const [ix] = increaseLiquidityInstruction.instructions;

  return ix;
}
