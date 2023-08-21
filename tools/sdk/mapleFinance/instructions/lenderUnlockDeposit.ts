import { getATAAddress } from '@saberhq/token-utils';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

import { MapleFinancePrograms, MapleFinance, PoolName } from '../configuration';

export async function lenderUnlockDeposit({
  poolName,
  authority: lenderUser,
  programs,
}: {
  poolName: PoolName;
  authority: PublicKey;
  programs: MapleFinancePrograms;
}): Promise<TransactionInstruction> {
  const { pool, globals, sharesMint } = MapleFinance.pools[poolName];

  const lender = await MapleFinance.findLenderAddress(poolName, lenderUser);

  const lockedShares = await MapleFinance.findLockedSharesAddress(lender);

  const lenderShares = await getATAAddress({
    mint: sharesMint,
    owner: lenderUser,
  });

  return programs.Syrup.instruction.lenderUnlockDeposit({
    accounts: {
      lender,
      lenderUser,
      pool,
      globals,
      lockedShares,
      lenderShares,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}

export default lenderUnlockDeposit;
