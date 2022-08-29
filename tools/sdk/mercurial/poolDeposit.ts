import Vault from '@mercurial-finance/vault-sdk';
import { AmmProgram, Pool } from '@mercurial-finance/dynamic-amm-sdk';
import { BN, Provider, Wallet } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, tryGetMint } from '@utils/tokens';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';
import { uiAmountToNativeBN } from '../units';
import { MercurialConfiguration } from './configuration';

export async function poolDeposit({
  connection,
  authority,
  pool,
  uiTokenAmountA,
  uiTokenAmountB,
  ammProgram,
  poolPubkey,
}: {
  connection: Connection;
  authority: PublicKey;
  pool: Pool;
  uiTokenAmountA: number;
  uiTokenAmountB: number;
  ammProgram: AmmProgram;
  poolPubkey: PublicKey;
}) {
  const [tokenAInfo, tokenBInfo, lpTokenInfo] = await Promise.all([
    tryGetMint(connection, pool.state.tokenAMint),
    tryGetMint(connection, pool.state.tokenBMint),
    tryGetMint(connection, pool.state.lpMint),
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

  await Promise.all([
    vaultA.init(pool.state.tokenAMint),
    vaultB.init(pool.state.tokenBMint),
  ]);

  if (!vaultA.state || !vaultB.state) {
    throw new Error('Cannot load vaults states');
  }

  const [
    [userAToken],
    [userBToken],
    [userPoolLp],
  ] = findMultipleATAAddSync(authority, [
    pool.state.tokenAMint,
    pool.state.tokenBMint,
    pool.state.lpMint,
  ]);

  const tokenAAmount = uiAmountToNativeBN(
    uiTokenAmountA,
    tokenAInfo.account.decimals,
  );

  const tokenBAmount = uiAmountToNativeBN(
    uiTokenAmountB,
    tokenBInfo.account.decimals,
  );

  const minimumPoolTokenAmount = new BN(0);

  return ammProgram.methods
    .addImbalanceLiquidity(minimumPoolTokenAmount, tokenAAmount, tokenBAmount)
    .accounts({
      pool: poolPubkey,
      lpMint: pool.state.lpMint,
      userPoolLp,
      aVaultLp: pool.state.aVaultLp,
      bVaultLp: pool.state.bVaultLp,
      aVault: pool.state.aVault,
      bVault: pool.state.bVault,
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
