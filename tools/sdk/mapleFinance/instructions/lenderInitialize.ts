import { getATAAddress } from '@saberhq/token-utils';
import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';

import { MapleFinancePrograms, MapleFinance, PoolName } from '../configuration';

export async function lenderInitialize({
  poolName,
  authority: lenderUser,
  programs,
  payer,
}: {
  poolName: PoolName;
  authority: PublicKey;
  programs: MapleFinancePrograms;
  payer?: PublicKey;
}): Promise<TransactionInstruction> {
  const { pool, sharesMint } = MapleFinance.pools[poolName];

  const lender = await MapleFinance.findLenderAddress(poolName, lenderUser);
  const lockedShares = await MapleFinance.findLockedSharesAddress(lender);

  const lenderShares = await getATAAddress({
    mint: sharesMint,
    owner: lenderUser,
  });

  return programs.Syrup.instruction.lenderInitialize({
    accounts: {
      payer: payer ?? lenderUser,
      owner: lenderUser,
      pool,
      sharesMint,
      lender,
      lockedShares,
      lenderShares,
      systemProgram: SYSTEM_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    },
  });
}

export default lenderInitialize;
