import { Governance, InstructionData } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import { MintInfo } from '@solana/spl-token';
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js';
import { getNameOf } from '@tools/core/script';
import {
  SupportedLendingMarketName as SolendSupportedLendingMarketName,
  SupportedTokenName as SolendSupportedTokenName,
} from '@tools/sdk/solend/configuration';
import { SupportedMintName as QuarryMineSupportedMintName } from '@tools/sdk/quarryMine/configuration';
import {
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  GovernedTokenAccount,
} from '@utils/tokens';
import { SplTokenUIName } from '@utils/splTokens';
import { DepositWithMintAccount, Voter } from 'VoteStakeRegistry/sdk/accounts';
import { LockupKind } from 'VoteStakeRegistry/tools/types';
import { AmountSide } from '@raydium-io/raydium-sdk';
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration';
import { InstructionType } from '@hooks/useGovernanceAssets';
import { SupportedSaberPoolNames } from '@tools/sdk/saberPools/configuration';
import { PoolName as MapleFinancePoolName } from '@tools/sdk/mapleFinance/configuration';
import { PoolNames as LifinityPoolNames } from '@tools/sdk/lifinity/poolList';
import { PoolName as DeltafiPoolName } from '@components/SelectDeltafiPool';
import { WhirlpoolName as OrcaWhirlpoolName } from '@tools/sdk/orca/configuration';
import { WhirlpoolPositionInfo as OrcaWhirlpoolPositionInfo } from '@tools/sdk/orca/configuration';

export interface FormInstructionData {
  serializedInstruction: string;
  isValid: boolean;
  governance: ProgramAccount<Governance> | undefined;
  customHoldUpTime?: number;
  prerequisiteInstructions?: TransactionInstruction[];
  chunkSplitByDefault?: boolean;
  signers?: Keypair[];
  shouldSplitIntoSeparateTxs?: boolean | undefined;
}

export interface SplTokenTransferForm {
  destinationAccount?: string;
  amount?: number;
  governedTokenAccount?: GovernedTokenAccount;
  programId: string | undefined;
  mintInfo?: MintInfo;
}

export interface GrantForm {
  destinationAccount: string;
  amount: number | undefined;
  governedTokenAccount: GovernedTokenAccount | undefined;
  mintInfo: MintInfo | undefined;
  lockupKind: LockupKind;
  startDateUnixSeconds: number;
  periods: number;
  allowClawback: boolean;
}

export interface ClawbackForm {
  governedTokenAccount: GovernedTokenAccount | undefined;
  voter: Voter | null;
  deposit: DepositWithMintAccount | null;
}

export interface SendTokenCompactViewForm extends SplTokenTransferForm {
  description: string;
  title: string;
}

export interface StakingViewForm {
  destinationAccount: GovernedTokenAccount | undefined;
  amount: number | undefined;
  governedTokenAccount: GovernedTokenAccount | undefined;
  description: string;
  title: string;
}

export interface MintForm {
  destinationAccount: string;
  amount: number | undefined;
  mintAccount: GovernedMintInfoAccount | undefined;
  programId: string | undefined;
}

export interface ProgramUpgradeForm {
  governedAccount?: GovernedMultiTypeAccount;
  bufferAddress?: string;
  bufferSpillAddress?: string;
}

export const programUpgradeFormNameOf = getNameOf<ProgramUpgradeForm>();

export interface SetProgramAuthorityForm {
  governedAccount?: GovernedMultiTypeAccount;
  destinationAuthority?: string;
}
export interface Base64InstructionForm {
  governedAccount?: GovernedMultiTypeAccount;
  base64: string;
  holdUpTime: number;
}

export interface EmptyInstructionForm {
  governedAccount?: GovernedMultiTypeAccount;
}

export interface LifinityDepositToPoolForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: LifinityPoolNames;
  uiAmountTokenA?: number;
  uiAmountTokenB?: number;
  amountTokenLP?: number;
  slippage: number;
}

export interface LifinityWithdrawFromPoolForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: LifinityPoolNames;
  uiAmountTokenLP?: number;
  slippage: number;
}

export interface CreateAssociatedTokenAccountForm {
  governedAccount?: GovernedMultiTypeAccount;
  splTokenMintUIName?: SplTokenUIName;
}

export interface CreateSolendObligationAccountForm {
  governedAccount?: GovernedMultiTypeAccount;
  lendingMarketName?: SolendSupportedLendingMarketName;
}

export interface InitSolendObligationAccountForm {
  governedAccount?: GovernedMultiTypeAccount;
  lendingMarketName?: SolendSupportedLendingMarketName;
}

export interface DepositReserveLiquidityAndObligationCollateralForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiAmount: number;
  lendingMarketName?: SolendSupportedLendingMarketName;
  tokenName?: SolendSupportedTokenName;
}

export interface WithdrawObligationCollateralAndRedeemReserveLiquidityForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiAmount: number;
  tokenName?: SolendSupportedTokenName;
  lendingMarketName?: SolendSupportedLendingMarketName;
  destinationLiquidity?: string;
}

export interface RefreshObligationForm {
  governedAccount?: GovernedMultiTypeAccount;
  lendingMarketName?: SolendSupportedLendingMarketName;
}

export interface RefreshReserveForm {
  governedAccount?: GovernedMultiTypeAccount;
  tokenName?: SolendSupportedTokenName;
  lendingMarketName?: SolendSupportedLendingMarketName;
}

export interface AddLiquidityRaydiumForm {
  governedAccount?: GovernedMultiTypeAccount;
  liquidityPool?: string;
  baseAmountIn?: number;
  quoteAmountIn?: number;
  fixedSide: AmountSide;
  slippage: number;
}

export interface RemoveLiquidityRaydiumForm {
  governedAccount?: GovernedMultiTypeAccount;
  liquidityPool: string;
  amountIn: number;
}

export interface UXDInitializeControllerForm {
  governedAccount?: GovernedMultiTypeAccount;
  mintDecimals: number;
}

export interface UXDSetRedeemableGlobalSupplyCapForm {
  governedAccount?: GovernedMultiTypeAccount;
  supplyCap: number;
}

export interface UXDRegisterMercurialVaultDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  collateralName?: string;
  uiRedeemableDepositorySupplyCap?: number;
  mintingFeeInBps?: number;
  redeemingFeeInBps?: number;
}

export interface UXDRegisterCredixLpDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  collateralName?: string;
  uiRedeemableDepositorySupplyCap?: number;
  mintingFeeInBps?: number;
  redeemingFeeInBps?: number;
}

export interface UXDEditMercurialVaultDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  collateralName?: string;
  uiRedeemableAmountUnderManagementCap?: number;
  mintingFeeInBps?: number;
  redeemingFeeInBps?: number;
  mintingDisabled?: boolean;
  profitsBeneficiaryCollateral?: string;
}

export interface UXDEditCredixLpDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  collateralName?: string;
  uiRedeemableAmountUnderManagementCap?: number;
  mintingFeeInBps?: number;
  redeemingFeeInBps?: number;
  mintingDisabled?: boolean;
  profitsBeneficiaryCollateral?: string;
}

export interface UXDEditIdentityDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiRedeemableAmountUnderManagementCap?: number;
  mintingDisabled: boolean;
}

export interface UXDEditControllerForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiRedeemableGlobalSupplyCap?: number;
  identityDepositoryWeightBps?: number;
  mercurialVaultDepositoryWeightBps?: number;
  credixLpDepositoryWeightBps?: number;
  identityDepository?: string;
  mercurialVaultDepository?: string;
  credixLpDepository?: string;
  uiOutflowLimitPerEpochAmount?: number;
  outflowLimitPerEpochBps?: number;
  slotsPerEpoch?: number;
}

export interface UXDMintWithMercurialVaultDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  uxdProgram?: string;
  collateralName?: string;
  uiCollateralAmount?: number;
}

export interface UXDMintWithCredixLpDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  uxdProgram?: string;
  collateralName?: string;
  uiCollateralAmount?: number;
}

export interface UXDRedeemFromMercurialVaultDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  uxdProgram?: string;
  collateralName?: string;
  uiRedeemableAmount?: number;
}

export interface UXDRedeemFromCredixLpDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  uxdProgram?: string;
  collateralName?: string;
  uiRedeemableAmount?: number;
}

export interface SaberPoolsDepositForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: SupportedSaberPoolNames;
  uiTokenAmountA?: number;
  uiTokenAmountB?: number;
  uiMinimumPoolTokenAmount?: number;
}

export interface SaberPoolsWithdrawOneForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: SupportedSaberPoolNames;
  destinationAccount?: PublicKey;
  baseTokenName?: string;
  uiPoolTokenAmount?: number;
  uiMinimumTokenAmount?: number;
}

export interface SaberPoolsSwapForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: SupportedSaberPoolNames;
  uiAmountIn?: number;
  uiMinimumAmountOut?: number;
}

export interface SaberPeripheryRedeemAllTokensFromMintProxyForm {
  governedAccount?: GovernedMultiTypeAccount;
  mintName?: QuarryMineSupportedMintName;
}

export interface SoceanMintBondedTokensForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiAmount?: number;
  depositFrom?: string;
  bondPool?: string;
  bondedMint?: string;
  mintTo?: string;
}

export interface SoceanDepositToAuctionPoolForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiDepositAmount?: number;
  auction?: string;
  sourceAccount?: string;
  bondedMint?: string;
}

export interface SoceanCloseAuctionForm {
  governedAccount?: GovernedMultiTypeAccount;
  auction?: string;
  bondedMint?: string;
  destinationAccount?: string;
}

export interface SoceanPurchaseBondedTokensForm {
  governedAccount?: GovernedMultiTypeAccount;
  auction?: string;
  bondedMint?: string;
  paymentDestination?: string;
  buyer?: string;
  paymentSource?: string;
  saleDestination?: string;
  uiPurchaseAmount?: number;
  uiExpectedPayment?: number;
  slippageTolerance?: number;
}

export interface SoceanCancelVestForm {
  governedAccount?: GovernedMultiTypeAccount;
  bondPool?: string;
  bondedMint?: string;
  userBondedAccount?: string;
  userTargetAccount?: string;
}

export interface SoceanVestForm {
  governedAccount?: GovernedMultiTypeAccount;
  bondPool?: string;
  bondedMint?: string;
  userBondedAccount?: string;
  uiAmount?: number;
}

export interface TribecaNewVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
  proposal: string;
}

export interface TribecaCastVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
  proposal: string;
  side: 'yes' | 'no' | 'abstain';
}

export interface TribecaCreateEpochGaugeForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
}

export interface TribecaCreateEscrowGovernanceTokenATAForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaCreateGaugeVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
}

export interface TribecaCreateGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaGaugeCommitVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
}

export interface TribecaGaugeRevertVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
}

export interface TribecaLockForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
  uiAmount: number;
  durationSeconds: number;
}

export interface TribecaNewEscrowForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaPrepareEpochGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaResetEpochGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaGaugeSetVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
  weight?: number;
}

export interface QuarryMineCreateMinerForm {
  governedAccount?: GovernedMultiTypeAccount;
  mintName?: QuarryMineSupportedMintName;
}

export interface QuarryMineCreateMinerVaultAccountForm {
  governedAccount?: GovernedMultiTypeAccount;
  mintName?: QuarryMineSupportedMintName;
}

export interface QuarryMineStakeTokensForm {
  governedAccount?: GovernedMultiTypeAccount;
  sourceAccount?: string;
  uiAmount?: number;
  mintName?: QuarryMineSupportedMintName;
}

export interface QuarryMineWithdrawTokensForm {
  governedAccount?: GovernedMultiTypeAccount;
  destinationAccount?: string;
  uiAmount?: number;
  mintName?: QuarryMineSupportedMintName;
}

export interface QuarryMineClaimRewardsForm {
  governedAccount?: GovernedMultiTypeAccount;
  mintName?: QuarryMineSupportedMintName;
}

export interface UXDStakingMigrateStakingCampaignFromV1ToV2Form {
  governedAccount?: GovernedMultiTypeAccount;
  stakingCampaignPda?: string;
}

export interface UXDStakingInitializeStakingCampaignForm {
  governedAccount?: GovernedMultiTypeAccount;
  rewardMintUIName?: SplTokenUIName;
  stakedMintUIName?: SplTokenUIName;
  startTs?: number;
  endTs?: number;
  uiRewardAmountToDeposit?: number;
}

export interface UXDStakingFinalizeStakingCampaignForm {
  governedAccount?: GovernedMultiTypeAccount;
  stakingCampaignPda?: string;
}

export interface UXDStakingAddStakingOptionForm {
  governedAccount?: GovernedMultiTypeAccount;
  stakingCampaignPda?: string;
  stakingOptions: {
    lockupSecs?: number;
    apr?: number;
  }[];
}

export interface UXDStakingActivateStakingOptionForm {
  governedAccount?: GovernedMultiTypeAccount;
  stakingCampaignPda?: string;
  activate?: boolean;
  stakingOptionIdentifier?: number;
}

export interface UXDStakingRefillRewardVaultForm {
  governedAccount?: GovernedMultiTypeAccount;
  stakingCampaignPda?: string;
  uiRewardRefillAmount?: number;
}

export interface NativeTransferTokensForm {
  governedAccount?: GovernedMultiTypeAccount;
  source?: string;
  destination?: string;
  uiAmount?: string;
}

export interface MapleFinanceLenderDepositForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiDepositAmount?: number;
  sourceAccount?: string;
  poolName?: MapleFinancePoolName;
}

export interface DeltafiPoolDepositForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: DeltafiPoolName;
  uiBaseAmount?: number;
  uiQuoteAmount?: number;
  uiMinBaseShare?: number;
  uiMinQuoteShare?: number;
}

export interface DeltafiFarmDepositForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: DeltafiPoolName;
  uiBaseAmount?: number;
  uiQuoteAmount?: number;
}

export interface DeltafiFarmWithdrawForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: DeltafiPoolName;
  uiBaseAmount?: number;
  uiQuoteAmount?: number;
}

export interface DeltafiPoolWithdrawForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: DeltafiPoolName;
  uiBaseShare?: number;
  uiQuoteShare?: number;
  uiMinBaseAmount?: number;
  uiMinQuoteAmount?: number;
}

export interface DeltafiCreateLiquidityProviderForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: DeltafiPoolName;
}

export interface DeltafiCreateFarmUserForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: DeltafiPoolName;
}

export interface DeltafiClaimFarmRewardsForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: DeltafiPoolName;
}

export interface NativeBurnSplTokensForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiAmount?: number;
  source?: string;
}

export interface OrcaWhirlpoolOpenPositionForm {
  governedAccount?: GovernedMultiTypeAccount;
  whirlpoolName?: OrcaWhirlpoolName;
  uiLowerPrice?: number;
  uiUpperPrice?: number;
}

export interface OrcaWhirlpoolIncreaseLiquidityForm {
  governedAccount?: GovernedMultiTypeAccount;
  whirlpoolName?: OrcaWhirlpoolName;
  positionInfo?: OrcaWhirlpoolPositionInfo;
  uiSlippage?: number;
  uiAmountTokenA?: number;
}

export interface OrcaWhirlpoolUpdateFeesAndRewardsForm {
  governedAccount?: GovernedMultiTypeAccount;
  whirlpoolName?: OrcaWhirlpoolName;
  positionInfo?: OrcaWhirlpoolPositionInfo;
}

export interface OrcaWhirlpoolCollectFeesForm {
  governedAccount?: GovernedMultiTypeAccount;
  whirlpoolName?: OrcaWhirlpoolName;
  positionInfo?: OrcaWhirlpoolPositionInfo;
}

export interface OrcaWhirlpoolDecreaseLiquidityForm {
  governedAccount?: GovernedMultiTypeAccount;
  whirlpoolName?: OrcaWhirlpoolName;
  positionInfo?: OrcaWhirlpoolPositionInfo;
  uiSlippage?: number;
  uiLiquidityAmountToDecrease?: number;
}

export interface OrcaWhirlpoolClosePositionForm {
  governedAccount?: GovernedMultiTypeAccount;
  whirlpoolName?: OrcaWhirlpoolName;
  positionInfo?: OrcaWhirlpoolPositionInfo;
}

export interface OrcaWhirlpoolSwapForm {
  governedAccount?: GovernedMultiTypeAccount;
  whirlpoolName?: OrcaWhirlpoolName;
  outputToken?: 'TokenA' | 'TokenB';
  uiAmount?: number;
  quoteByOutput?: boolean;
}

export interface MercurialPoolDepositForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: SupportedSaberPoolNames;
  uiTokenAmountA?: number;
  uiTokenAmountB?: number;
  slippage?: number;
}

export interface MercurialPoolWithdrawForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: SupportedSaberPoolNames;
  uiLpTokenAmount?: number;
  slippage?: number;
}

export interface NativeIncreaseComputingBudgetForm {
  governedAccount?: GovernedMultiTypeAccount;
  computingBudget?: number;
}

export interface CredixDepositForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiAmount?: number;
}

export interface CredixWithdrawForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiAmount?: number;
}

export interface UXDInitializeIdentityDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
}

export interface UXDMintWithIdentityDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  uxdProgram?: string;
  uiCollateralAmount?: number;
}
export interface UXDRedeemFromIdentityDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  uxdProgram?: string;
  uiRedeemableAmount?: number;
}

export enum InstructionEnum {
  Transfer,
  ProgramUpgrade,
  SetProgramAuthority,
  Mint,
  Base64,
  None,
  // Grant,
  // Clawback,
  CreateAssociatedTokenAccount,
  LifinityDepositToPool,
  LifinityWithdrawFromPool,
  QuarryClaimRewards,
  QuarryCreateMiner,
  QuarryCreateMinerVaultAccount,
  QuarryStakeTokens,
  QuarryWithdrawTokens,
  RaydiumAddLiquidity,
  RaydiumRemoveLiquidity,
  SaberPoolsDeposit,
  SaberPoolsWithdrawOne,
  SaberPoolsSwap,
  SaberPeripheryRedeemAllTokensFromMintProxy,
  SolendCreateObligationAccount,
  SolendInitObligationAccount,
  SolendDepositReserveLiquidityAndObligationCollateral,
  SolendWithdrawObligationCollateralAndRedeemReserveLiquidity,
  SolendRefreshObligation,
  SolendRefreshReserve,
  SoceanMintBondedTokens,
  SoceanDepositToAuctionPool,
  SoceanCloseAuction,
  SoceanPurchaseBondedTokens,
  SoceanCancelVest,
  SoceanVest,
  TribecaCreateEpochGauge,
  TribecaCreateEscrowGovernanceTokenATA,
  TribecaCreateGaugeVote,
  TribecaCreateGaugeVoter,
  TribecaGaugeCommitVote,
  TribecaGaugeRevertVote,
  TribecaLock,
  TribecaNewEscrow,
  TribecaNewVote,
  TribecaCastVote,
  TribecaPrepareEpochGaugeVoter,
  TribecaResetEpochGaugeVoter,
  TribecaGaugeSetVote,
  UXDInitializeController,
  UXDSetRedeemableGlobalSupplyCap,
  UXDRegisterMercurialVaultDepository,
  UXDRegisterCredixLpDepository,
  UXDEditMercurialVaultDepository,
  UXDEditCredixLpDepository,
  UXDEditController,
  UXDMintWithMercurialVaultDepository,
  UXDMintWithCredixLpDepository,
  UXDInitializeIdentityDepository,
  UXDMintWithIdentityDepository,
  UXDRedeemFromIdentityDepository,
  UXDRedeemFromMercurialVaultDepository,
  UXDRedeemFromCredixLpDepository,
  UXDEditIdentityDepository,
  UXDStakingInitializeStakingCampaign,
  UXDStakingFinalizeStakingCampaign,
  UXDStakingAddStakingOption,
  UXDStakingActivateStakingOption,
  UXDStakingRefillRewardVault,
  UXDStakingMigrateStakingCampaignFromV1ToV2,
  NativeTransferTokensForm,
  MapleFinanceLenderDepositForm,
  DeltafiPoolDeposit,
  DeltafiCreateLiquidityProvider,
  DeltafiPoolWithdraw,
  DeltafiCreateFarmUser,
  DeltafiFarmDeposit,
  DeltafiFarmWithdraw,
  DeltafiClaimFarmRewards,
  NativeBurnSplTokens,
  OrcaWhirlpoolOpenPosition,
  OrcaWhirlpoolIncreaseLiquidity,
  OrcaWhirlpoolUpdateFeesAndRewards,
  OrcaWhirlpoolCollectFees,
  OrcaWhirlpoolDecreaseLiquidity,
  OrcaWhirlpoolClosePosition,
  OrcaWhirlpoolSwap,
  MercurialPoolDeposit,
  MercurialPoolWithdraw,
  NativeIncreaseComputingBudget,
  CredixDeposit,
  CredixWithdraw,
}

export enum PackageEnum {
  Native = 1,
  // VoteStakeRegistry,
  Solend,
  Raydium,
  UXD,
  UXDStaking,
  Tribeca,
  Socean,
  Saber,
  Quarry,
  Lifinity,
  MapleFinance,
  Deltafi,
  Orca,
  Mercurial,
  Credix,
}

export type createParams = [
  rpc: RpcContext,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  holdUpTime: number,
  proposalIndex: number,
  instructionsData: InstructionData[],
  isDraft: boolean,
];

export interface ComponentInstructionData {
  governedAccount?: ProgramAccount<Governance>;
  getInstruction?: () => Promise<FormInstructionData>;
  type?: InstructionType;
}

export interface InstructionsContext {
  instructions: ComponentInstructionData[];
  handleSetInstruction: (
    val: Partial<ComponentInstructionData>,
    idx: number,
  ) => void;
}
