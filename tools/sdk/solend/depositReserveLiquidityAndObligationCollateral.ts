import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { depositReserveLiquidityAndObligationCollateralInstruction } from '@solendprotocol/solend-sdk';
import { findATAAddrSync } from '@utils/ataTools';
import SolendConfiguration, {
  SupportedLendingMarketName,
  SupportedTokenName,
} from './configuration';
import { deriveObligationAddressFromWalletAndSeed } from './utils';

export async function depositReserveLiquidityAndObligationCollateral({
  obligationOwner,
  liquidityAmount,
  lendingMarketName,
  tokenName,
}: {
  obligationOwner: PublicKey;
  liquidityAmount: number | BN;
  lendingMarketName: SupportedLendingMarketName;
  tokenName: SupportedTokenName;
}) {
  const {
    supportedTokens,
    lendingMarket,
    lendingMarketAuthority,
    seed,
  } = SolendConfiguration.getSupportedLendingMarketInformation(
    lendingMarketName,
  );

  if (!supportedTokens[tokenName]) {
    throw new Error(
      `Unsupported token ${tokenName} for Lending market ${lendingMarketName}`,
    );
  }

  const {
    relatedCollateralMint,
    mint,
    reserve,
    reserveLiquiditySupply,
    pythOracle,
    switchboardFeedAddress,
    reserveCollateralSupplySplTokenAccount,
  } = supportedTokens[tokenName]!;

  const reserveCollateralMint = relatedCollateralMint.mint;

  const [usdcTokenAccount] = findATAAddrSync(obligationOwner, mint);
  const [cusdcTokenAccount] = findATAAddrSync(
    obligationOwner,
    relatedCollateralMint.mint,
  );

  const sourceLiquidity = usdcTokenAccount;
  const sourceCollateral = cusdcTokenAccount;
  const destinationCollateral = reserveCollateralSupplySplTokenAccount;

  const obligation = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner,
    seed,
  );

  const transferAuthority = obligationOwner;

  return depositReserveLiquidityAndObligationCollateralInstruction(
    liquidityAmount,

    // Example: USDC token account address (owned by obligationOwner)
    sourceLiquidity,

    // Destination Collateral Token Account
    // Example: cUSDC's token account address (owned by obligationOwner)
    sourceCollateral,

    // Solend Reserve Progam Id (must be related to sourceLiquidity)
    // Complete list of reserves mint: https://docs.solend.fi/protocol/addresses
    // Example: BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw for USDC reserve
    reserve,

    // Solend Reserve SPL Token account address (must be related to sourceLiquidity)
    // Example: 8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf for USDC (there are no list for it)
    reserveLiquiditySupply,

    // Example: cUSDC mint (must be related to sourceLiquidity)
    reserveCollateralMint,

    lendingMarket,
    lendingMarketAuthority,

    destinationCollateral,
    obligation,
    obligationOwner,
    pythOracle,
    switchboardFeedAddress,

    // Wallet address of the one creating the proposal
    transferAuthority,
    SolendConfiguration.programID,
  );
}
