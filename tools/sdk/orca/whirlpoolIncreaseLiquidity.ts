import {
  increaseLiquidityQuoteByInputToken,
  PDAUtil,
  PositionData,
} from '@orca-so/whirlpools-sdk';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// Have to get this version of the whirlpool so we can use its attributes
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { increaseLiquidityIx } from '@orca-so/whirlpools-sdk/dist/instructions';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';
import Decimal from 'decimal.js';
import { Percentage } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

async function getTickInitializationIx({
  payer,
  whirlpool,
  positionData,
}: {
  payer: PublicKey;
  whirlpool: WhirlpoolImpl;
  positionData: PositionData;
}): Promise<TransactionInstruction[] | null> {
  const transactionBuilder = await whirlpool.initTickArrayForTicks(
    [positionData.tickLowerIndex, positionData.tickUpperIndex],
    payer,
    true,
  );

  if (!transactionBuilder) {
    return null;
  }

  const transactionPayload = transactionBuilder?.build();

  return [...(await transactionPayload).transaction.instructions];
}

export async function whirlpoolIncreaseLiquidity({
  payer,
  whirlpool,
  authority,
  uiAmountTokenA,
  uiSlippage,
  position,
}: {
  payer: PublicKey;
  whirlpool: WhirlpoolImpl;
  authority: PublicKey;
  uiAmountTokenA: number;
  uiSlippage: number;
  position: PublicKey;
}): Promise<{
  tickInitializationIxs: null | TransactionInstruction[];
  increaseLiquidityIx: TransactionInstruction;
}> {
  if (uiSlippage < 0 || uiSlippage > 100) {
    throw new Error('Slippage must be between 0 and 100 included');
  }

  const {
    tickSpacing,
    tokenMintA,
    tokenMintB,
    tokenVaultA,
    tokenVaultB,
  } = whirlpool.getData();

  const positionData = await whirlpool.ctx.fetcher.getPosition(position, false);

  if (!positionData) {
    throw new Error(
      `Cannot find the position data at address ${position.toBase58()}`,
    );
  }

  const tickArrayLowerPda = PDAUtil.getTickArrayFromTickIndex(
    positionData.tickLowerIndex,
    tickSpacing,
    whirlpool.address,
    whirlpool.ctx.program.programId,
  );

  const tickArrayUpperPda = PDAUtil.getTickArrayFromTickIndex(
    positionData.tickUpperIndex,
    tickSpacing,
    whirlpool.address,
    whirlpool.ctx.program.programId,
  );

  const tickInitializationIxs = await getTickInitializationIx({
    payer,
    whirlpool,
    positionData,
  });

  const {
    liquidityAmount,
    tokenMaxA,
    tokenMaxB,
  } = increaseLiquidityQuoteByInputToken(
    tokenMintA,
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
    tokenMintA,
    tokenMintB,
  ]);

  console.log('Authority', authority.toBase58());
  console.log('tokenMintA', tokenMintA.toBase58());
  console.log('tokenOwnerAccountA', tokenOwnerAccountA.toBase58());
  console.log('tokenMintB', tokenMintB.toBase58());
  console.log('tokenOwnerAccountB', tokenOwnerAccountB.toBase58());

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
      tokenVaultA,
      tokenVaultB,
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

  return {
    tickInitializationIxs,
    increaseLiquidityIx: ix,
  };
}
