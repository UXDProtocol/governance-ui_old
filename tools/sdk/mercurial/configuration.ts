import { PublicKey } from '@solana/web3.js';
import { AmmProgram, Pool } from '@mercurial-finance/dynamic-amm-sdk';

export type PoolName = 'USDT_USDC';

export type PoolDescription = {
  displayName: string;
  publicKey: PublicKey;
};

export type Pools = {
  [key in PoolName]: PoolDescription;
};

export class MercurialConfiguration {
  public static readonly instructionsCode = {
    addImbalanceLiquidity: 79,
  };

  public static readonly poolProgram = new PublicKey(
    '5B23C376Kwtd1vzb5LCJHiHLPnoWSnnx661hhGGDEv8y',
  );

  public static readonly vaultProgram = new PublicKey(
    '24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi',
  );

  public readonly pools: Pools = {
    USDT_USDC: {
      displayName: 'USDT/USDC',
      publicKey: new PublicKey('GRggGuVnFtRtVD2yiiKPDZ8GPzfbGsxd3FNoPSmupH9U'),
    },
  };

  public loadPool({
    ammProgram,
    authority,
    pool,
  }: {
    ammProgram: AmmProgram;
    authority: PublicKey;
    pool: PublicKey;
  }): Promise<Pool> {
    return Pool.load(authority, ammProgram, pool);
  }
}

export default new MercurialConfiguration();
