import { Connection, PublicKey } from '@solana/web3.js';
import AmmImpl, { MAINNET_POOL } from '@mercurial-finance/dynamic-amm-sdk';

export type PoolName =
  // | 'UXD_USDC'
  'USDT_USDC';

export type PoolDescription = {
  displayName: string;
  publicKey: PublicKey;
};

export type Pools = {
  [key in PoolName]: PoolDescription;
};
/*
export type PoolInfo = {
    publicKey: PublicKey;
    liquidity: number;
    positionMint: PublicKey;
    uiLowerPrice: number;
    uiUpperPrice: number;
    tokenAName: string;
    tokenBName: string;
};*/

export class MercurialConfiguration {
  public static readonly instructionsCode = {
    // ...
  };

  public readonly pools: Pools = {
    USDT_USDC: {
      displayName: 'USDT/USDC',
      publicKey: new PublicKey('GRggGuVnFtRtVD2yiiKPDZ8GPzfbGsxd3FNoPSmupH9U'), //new PublicKey(MAINNET_POOL.USDT_USDC),
    },

    /*
        public readonly pools: Pools = {
            USDT_USDC: {
                displayName: 'USDT/USDC',
                publicKey: new PublicKey('GRggGuVnFtRtVD2yiiKPDZ8GPzfbGsxd3FNoPSmupH9U'),
            },
        };
        */
  };

  public loadPool({
    connection,
    pool,
  }: {
    connection: Connection;
    pool: PublicKey;
  }): Promise<AmmImpl> {
    return AmmImpl.create(connection, pool, {
      cluster: 'mainnet-beta',
    });
  }
}

export default new MercurialConfiguration();
