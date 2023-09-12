import { Connection, PublicKey } from '@solana/web3.js';
import { USyrupJSON } from './idls/syrup';

import { newProgramMap } from '@saberhq/anchor-contrib';
import { SolanaAugmentedProvider } from '@saberhq/solana-contrib';
import { SyrupProgram } from './programs/syrup';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { augmentedProvider } from '../augmentedProvider';
import { SplTokenInformation, SPL_TOKENS } from '@utils/splTokens';
import { Nonce } from '@maplelabs/syrup-sdk';

export type MapleFinancePrograms = {
  Syrup: SyrupProgram;
};

export type PoolName = 'CashManagement';

export type PoolInfo = {
  // lender: PublicKey;
  pool: PublicKey;
  globals: PublicKey;
  poolLocker: PublicKey;
  sharesMint: PublicKey;
  // lockedShares: PublicKey;
  // lenderShares: PublicKey;
  // lenderLocker: PublicKey;
  baseMint: SplTokenInformation;
};

export type Pools = {
  [key in PoolName]: PoolInfo;
};

export class MapleFinance {
  public static readonly SyrupProgramId = new PublicKey(
    '5D9yi4BKrxF8h65NkVE1raCCWFKUs5ngub2ECxhvfaZe',
  );

  public static readonly pools: Pools = {
    CashManagement: {
      pool: new PublicKey('7Vqn5fdwckZadYVoH312aErP8PqNGNUx8WDrvKAHYfMd'),
      globals: new PublicKey('DtnAPKSHwJaYbFdjYibNcjxihVd6pK1agpT86N5tMVPX'),
      poolLocker: new PublicKey('EWiQLJY2CYKKL58KR284MxLvEtctQJbnzKEqWXyQ1z3S'),
      sharesMint: new PublicKey('AxuK8gNvN4Q8HtgHxFbePP6b84SpmcNTPdFA1E164Hgs'),
      baseMint: SPL_TOKENS.USDC,
    },
  };

  public static getPoolInfoByPoolMint(
    poolMint: PublicKey,
  ): PoolInfo | undefined {
    return Object.values(MapleFinance.pools).find((poolInfo) =>
      poolInfo.pool.equals(poolMint),
    );
  }

  public loadPrograms(provider: SolanaAugmentedProvider): MapleFinancePrograms {
    return newProgramMap<MapleFinancePrograms>(
      provider,

      {
        // IDL
        Syrup: USyrupJSON,
      },

      {
        // Addresses
        Syrup: MapleFinance.SyrupProgramId,
      },
    );
  }

  public getMapleFinancePrograms({
    connection,
    wallet,
  }: {
    connection: Connection;
    wallet: SignerWalletAdapter;
  }) {
    const programs = this.loadPrograms(augmentedProvider(connection, wallet));

    if (!programs)
      throw new Error('MapleFinance Configuration error: no programs');
    return programs;
  }

  public static async findLenderAddress(
    poolName: PoolName,
    lenderUser: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('lender'),
          MapleFinance.pools[poolName].pool.toBytes(),
          lenderUser.toBytes(),
        ],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static async findLockedSharesAddress(
    lender: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [Buffer.from('locked_shares'), lender.toBytes()],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static async findWithdrawalRequestAddress(
    lender: PublicKey,
    nonce: Nonce,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [Buffer.from('withdrawal_request'), lender.toBytes(), nonce.value],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static async findWithdrawalRequestLocker(
    withdrawalRequest: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [Buffer.from('withdrawal_request_locker'), withdrawalRequest.toBytes()],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static readonly syrupProgramInstructions = {
    lenderDeposit: 151,
    lenderUnlockDeposit: 17,
    withdrawalRequestInitialize: 121,
    withdrawalRequestExecute: 90,
  };
}

export default new MapleFinance();
