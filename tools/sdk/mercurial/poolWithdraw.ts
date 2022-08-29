import Vault from '@mercurial-finance/vault-sdk';
import { AmmProgram, Pool } from '@mercurial-finance/dynamic-amm-sdk';
import { Provider, Wallet } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, tryGetMint } from '@utils/tokens';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';
import { uiAmountToNativeBN } from '../units';
import { MercurialConfiguration } from './configuration';

export async function poolWithdraw({
  connection,
  authority,
  pool,
  uiPoolTokenAmount,
  uiMinimumATokenOut,
  uiMinimumBTokenOut,
  ammProgram,
  poolPubkey,
}: {
  connection: Connection;
  authority: PublicKey;
  pool: Pool;
  uiPoolTokenAmount: number;
  uiMinimumATokenOut: number;
  uiMinimumBTokenOut: number;
  ammProgram: AmmProgram;
  poolPubkey: PublicKey;
}) {
  const {
    state: {
      tokenAMint,
      tokenBMint,
      lpMint,
      aVaultLp,
      bVaultLp,
      aVault,
      bVault,
    },
  } = pool;

  const [tokenAInfo, tokenBInfo, lpTokenInfo] = await Promise.all([
    tryGetMint(connection, tokenAMint),
    tryGetMint(connection, tokenBMint),
    tryGetMint(connection, lpMint),
  ]);

  if (!tokenAInfo || !tokenBInfo || !lpTokenInfo) {
    throw new Error('Cannot load mint info');
  }

  const provider = new Provider(
    connection,
    (null as unknown) as Wallet,
    Provider.defaultOptions(),
  );

  const vaultA: Vault = new Vault(provider as any, authority);
  const vaultB: Vault = new Vault(provider as any, authority);

  await Promise.all([vaultA.init(tokenAMint), vaultB.init(tokenBMint)]);

  if (!vaultA.state || !vaultB.state) {
    throw new Error('Cannot load vaults states');
  }

  const [
    [userAToken],
    [userBToken],
    [userPoolLp],
  ] = findMultipleATAAddSync(authority, [tokenAMint, tokenBMint, lpMint]);

  const minimumATokenOut = uiAmountToNativeBN(
    uiMinimumATokenOut,
    tokenAInfo.account.decimals,
  );

  const minimumBTokenOut = uiAmountToNativeBN(
    uiMinimumBTokenOut,
    tokenBInfo.account.decimals,
  );

  const poolTokenAmount = uiAmountToNativeBN(
    uiPoolTokenAmount,
    lpTokenInfo.account.decimals,
  );

  return ammProgram.methods
    .removeBalanceLiquidity(poolTokenAmount, minimumATokenOut, minimumBTokenOut)
    .accounts({
      pool: poolPubkey,
      lpMint,
      userPoolLp,
      aVaultLp,
      bVaultLp,
      aVault,
      bVault,
      aVaultLpMint: vaultA.state.lpMint,
      bVaultLpMint: vaultB.state.lpMint,
      aTokenVault: vaultA.state.tokenVault,
      bTokenVault: vaultB.state.tokenVault,
      userAToken,
      userBToken,
      user: authority,
      vaultProgram: MercurialConfiguration.vaultProgram,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
}
