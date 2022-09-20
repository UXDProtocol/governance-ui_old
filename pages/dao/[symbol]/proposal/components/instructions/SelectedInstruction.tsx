import { GovernedMultiTypeAccount } from '@utils/tokens';
import { InstructionEnum } from '@utils/uiTypes/proposalCreationTypes';
import ProgramUpgrade from './bpfUpgradeableLoader/ProgramUpgrade';
import CreateAssociatedTokenAccount from './native/CreateAssociatedTokenAccount';
import RaydiumAddLiquidityToPool from './raydium/AddLiquidityToPool';
import RaydiumRemoveLiquidityFromPool from './raydium/RemoveLiquidityFromPool';
import FriktionDeposit from './friktion/Deposit';
import FriktionWithdraw from './friktion/Withdraw';
import FriktionClaim from './friktion/Claim';
import NativeMint from './native/Mint';
import NativeEmpty from './native/Empty';
import NativeCustomBase64 from './native/CustomBase64';
import SetProgramAuthority from './native/SetProgramAuthority';
import SplTokenTransfer from './native/SplTokenTransfer';
import LifinityDepositToPool from './lifinity/DepositToPool';
import LifinityWithdrawFromPool from './lifinity/WithdrawFromPool';
import QuarryClaimRewards from './quarryMine/ClaimRewards';
import QuarryCreateMiner from './quarryMine/CreateMiner';
import QuarryCreateMinerVaultAccount from './quarryMine/CreateMinerVaultAccount';
import QuarryStakeTokens from './quarryMine/StakeTokens';
import QuarryWithdrawTokens from './quarryMine/WithdrawTokens';
import SaberPeripheryRedeemAllTokenFromMintProxy from './saberPeriphery/RedeemAllTokensFromMintProxy';
import SaberPoolsDeposit from './saberPools/Deposit';
import SaberPoolsWithdrawOne from './saberPools/WithdrawOne';
import SaberPoolsSwap from './saberPools/Swap';
import SoceanCancelVest from './socean/CancelVest';
import SoceanCloseAuction from './socean/CloseAuction';
import SoceanDepositToAuctionPool from './socean/DepositToAuctionPool';
import SoceanMintBondedTokens from './socean/MintBondedTokens';
import SoceanPurchaseBondedTokens from './socean/PurchaseBondedTokens';
import SoceanVest from './socean/Vest';
import SolendCreateObligationAccount from './solend/CreateObligationAccount';
import SolendDepositReserveLiquidityAndObligationCollateral from './solend/DepositReserveLiquidityAndObligationCollateral';
import SolendInitObligationAccount from './solend/InitObligationAccount';
import SolendRefreshObligation from './solend/RefreshObligation';
import SolendRefreshReserve from './solend/RefreshReserve';
import SolendWithdrawObligationCollateralAndRedeemReserveLiquidity from './solend/WithdrawObligationCollateralAndRedeemReserveLiquidity';
import TribecaCreateEpochGauge from './tribeca/CreateEpochGauge';
import TribecaCreateEscrowGovernanceTokenATA from './tribeca/CreateEscrowGovernanceTokenATA';
import TribecaCreateGaugeVote from './tribeca/CreateGaugeVote';
import TribecaCreateGaugeVoter from './tribeca/CreateGaugeVoter';
import TribecaGaugeCommitVote from './tribeca/GaugeCommitVote';
import TribecaGaugeRevertVote from './tribeca/GaugeRevertVote';
import TribecaLock from './tribeca/Lock';
import TribecaNewEscrow from './tribeca/NewEscrow';
import TribecaPrepareEpochGaugeVoter from './tribeca/PrepareEpochGaugeVoter';
import TribecaResetEpochGaugeVoter from './tribeca/ResetEpochGaugeVoter';
import TribecaGaugeSetVote from './tribeca/SetGaugeVote';
import UXDDepositInsuranceToMangoDepository from './uxd/DepositInsuranceToMangoDepository';
import UXDInitializeController from './uxd/InitializeController';
import UXDRegisterMangoDeposiory from './uxd/RegisterMangoDepository';
import UXDSetMangoDepositoriesRedeemableSoftCap from './uxd/SetMangoDepositoriesRedeemableSoftCap';
import UXDSetRedeemableGlobalSupplyCap from './uxd/SetRedeemGlobalSupplyCap';
import UXDWithdrawInsuranceFromMangoDepository from './uxd/WithdrawInsuranceFromMangoDepository';
import UXDDisableDepositoryMinting from './uxd/DisableDepositoryMinting';
import UXDQuoteMintWithMangoDepository from './uxd/QuoteMintWithMangoDepository';
import UXDQuoteRedeemWithMangoDepository from './uxd/QuoteRedeemWithMangoDepository';
import UXDSetMangoDepositoryQuoteMintAndRedeemFee from './uxd/SetMangoDepositoryQuoteMintAndRedeemFee';
import UXDSetMangoDepositoryQuoteMintAndRedeemSoftCap from './uxd/SetMangoDepositoryQuoteMintAndRedeemSoftCap';
import UXDStakingInitializeStakingCampaign from './uxdStaking/InitializeStakingCampaign';
import UXDStakingMigrateStakingCampaignFromV1ToV2 from './uxdStaking/MigrateStakingCampaignFromV1ToV2';
import UXDStakingFinalizeStakingCampaign from './uxdStaking/FinalizeStakingCampaign';
import UXDStakingAddStakingOption from './uxdStaking/AddStakingOption';
import UXDStakingActivateStakingOption from './uxdStaking/ActivateStakingOption';
import UXDStakingRefillRewardVault from './uxdStaking/RefillRewardVault';
import TransferTokens from './native/TransferTokens';
import MapleFinanceLenderDeposit from './mapleFinance/LenderDeposit';
import DeltafiPoolDeposit from './deltafi/Deposit';
import DeltafiCreateLiquidityProvider from './deltafi/CreateLiquidityProvider';
import DeltafiPoolWithdraw from './deltafi/Withdraw';
import DeltafiCreateFarmUser from './deltafi/CreateFarmUserV2';
import DeltafiDepositToFarm from './deltafi/DepositToFarm';
import DeltafiFarmWithdraw from './deltafi/WithdrawFromFarm';
import NativeBurnSplTokens from './native/BurnSplTokens';
import OrcaWhirlpoolOpenPosition from './orca/WhirlpoolOpenPosition';
import OrcaWhirlpoolIncreaseLiquidity from './orca/WhirlpoolIncreaseLiquidity';
import OrcaWhirlpoolUpdateFeesAndRewards from './orca/WhirlpoolUpdateFeesAndRewards';
import OrcaWhirlpoolCollectFees from './orca/WhirlpoolCollectFees';
import OrcaWhirlpoolDecreaseLiquidity from './orca/WhirlpoolDecreaseLiquidity';
import OrcaWhirlpoolClosePosition from './orca/WhirlpoolClosePosition';
import OrcaWhirlpoolSwap from './orca/WhirlpoolSwap';
import MercurialPoolDeposit from './mercurial/PoolDeposit';
import MercurialPoolWithdraw from './mercurial/PoolWithdraw';
import NativeIncreaseComputingBudget from './native/IncreaseComputingBudget';
import CredixDeposit from './credix/Deposit';
import CredixWithdraw from './credix/Withdraw';

const SelectedInstruction = ({
  itxType,
  index,
  governedAccount,
}: {
  itxType: InstructionEnum;
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  switch (itxType) {
    case InstructionEnum.MapleFinanceLenderDepositForm:
      return (
        <MapleFinanceLenderDeposit
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.Transfer:
      return <SplTokenTransfer index={index} governance={null} />;
    case InstructionEnum.ProgramUpgrade:
      return <ProgramUpgrade index={index} governedAccount={governedAccount} />;
    case InstructionEnum.SetProgramAuthority:
      return (
        <SetProgramAuthority index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.CreateAssociatedTokenAccount:
      return (
        <CreateAssociatedTokenAccount
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.SolendCreateObligationAccount:
      return (
        <SolendCreateObligationAccount
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.SolendInitObligationAccount:
      return (
        <SolendInitObligationAccount
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.SolendDepositReserveLiquidityAndObligationCollateral:
      return (
        <SolendDepositReserveLiquidityAndObligationCollateral
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.SolendRefreshObligation:
      return (
        <SolendRefreshObligation
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.SolendRefreshReserve:
      return (
        <SolendRefreshReserve index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.SolendWithdrawObligationCollateralAndRedeemReserveLiquidity:
      return (
        <SolendWithdrawObligationCollateralAndRedeemReserveLiquidity
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.RaydiumAddLiquidity:
      return (
        <RaydiumAddLiquidityToPool
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.RaydiumRemoveLiquidity:
      return (
        <RaydiumRemoveLiquidityFromPool
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.QuarryClaimRewards:
      return (
        <QuarryClaimRewards index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.QuarryCreateMiner:
      return (
        <QuarryCreateMiner index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.QuarryCreateMinerVaultAccount:
      return (
        <QuarryCreateMinerVaultAccount
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.QuarryStakeTokens:
      return (
        <QuarryStakeTokens index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.QuarryWithdrawTokens:
      return (
        <QuarryWithdrawTokens index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.SaberPoolsDeposit:
      return (
        <SaberPoolsDeposit index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.SaberPoolsWithdrawOne:
      return (
        <SaberPoolsWithdrawOne
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.SaberPoolsSwap:
      return <SaberPoolsSwap index={index} governedAccount={governedAccount} />;
    case InstructionEnum.SaberPeripheryRedeemAllTokensFromMintProxy:
      return (
        <SaberPeripheryRedeemAllTokenFromMintProxy
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDInitializeController:
      return (
        <UXDInitializeController
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDSetRedeemableGlobalSupplyCap:
      return (
        <UXDSetRedeemableGlobalSupplyCap
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDSetMangoDepositoriesRedeemableSoftCap:
      return (
        <UXDSetMangoDepositoriesRedeemableSoftCap
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDRegisterMangoDepository:
      return (
        <UXDRegisterMangoDeposiory
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDDepositInsuranceToMangoDepository:
      return (
        <UXDDepositInsuranceToMangoDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDWithdrawInsuranceFromMangoDepository:
      return (
        <UXDWithdrawInsuranceFromMangoDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDDisableDepositoryMinting:
      return (
        <UXDDisableDepositoryMinting
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDQuoteMintWithMangoDepository:
      return (
        <UXDQuoteMintWithMangoDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDQuoteRedeemWithMangoDepository:
      return (
        <UXDQuoteRedeemWithMangoDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDSetMangoDepositoryQuoteMintAndRedeemFee:
      return (
        <UXDSetMangoDepositoryQuoteMintAndRedeemFee
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDSetMangoDepositoryQuoteMintAndRedeemSoftCap:
      return (
        <UXDSetMangoDepositoryQuoteMintAndRedeemSoftCap
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDStakingMigrateStakingCampaignFromV1ToV2:
      return (
        <UXDStakingMigrateStakingCampaignFromV1ToV2
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDStakingInitializeStakingCampaign:
      return (
        <UXDStakingInitializeStakingCampaign
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDStakingFinalizeStakingCampaign:
      return (
        <UXDStakingFinalizeStakingCampaign
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDStakingAddStakingOption:
      return (
        <UXDStakingAddStakingOption
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDStakingActivateStakingOption:
      return (
        <UXDStakingActivateStakingOption
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDStakingRefillRewardVault:
      return (
        <UXDStakingRefillRewardVault
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.TribecaCreateEpochGauge:
      return (
        <TribecaCreateEpochGauge
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.TribecaCreateEscrowGovernanceTokenATA:
      return (
        <TribecaCreateEscrowGovernanceTokenATA
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.TribecaCreateGaugeVote:
      return (
        <TribecaCreateGaugeVote
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.TribecaCreateGaugeVoter:
      return (
        <TribecaCreateGaugeVoter
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.TribecaGaugeCommitVote:
      return (
        <TribecaGaugeCommitVote
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.TribecaGaugeRevertVote:
      return (
        <TribecaGaugeRevertVote
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.TribecaLock:
      return <TribecaLock index={index} governedAccount={governedAccount} />;
    case InstructionEnum.TribecaNewEscrow:
      return (
        <TribecaNewEscrow index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.TribecaPrepareEpochGaugeVoter:
      return (
        <TribecaPrepareEpochGaugeVoter
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.TribecaResetEpochGaugeVoter:
      return (
        <TribecaResetEpochGaugeVoter
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.TribecaGaugeSetVote:
      return (
        <TribecaGaugeSetVote index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.LifinityDepositToPool:
      return (
        <LifinityDepositToPool
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.LifinityWithdrawFromPool:
      return (
        <LifinityWithdrawFromPool
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.FriktionDepositIntoVolt:
      return (
        <FriktionDeposit index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.FriktionWithdrawFromVolt:
      return (
        <FriktionWithdraw index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.FriktionClaimWithdrawal:
      return <FriktionClaim index={index} governedAccount={governedAccount} />;
    case InstructionEnum.Mint:
      return <NativeMint index={index} governance={null} />;
    /*case InstructionEnum.Grant:
      return <VoteStakeRegistryGrant index={index} governance={null} />;
    case InstructionEnum.Clawback:
      return <VoteStakeRegistryClawback index={index} governance={null} />;*/
    case InstructionEnum.Base64:
      return (
        <NativeCustomBase64 index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.None:
      return <NativeEmpty index={index} governedAccount={governedAccount} />;

    case InstructionEnum.SoceanCancelVest:
      return (
        <SoceanCancelVest index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.SoceanCloseAuction:
      return (
        <SoceanCloseAuction index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.SoceanDepositToAuctionPool:
      return (
        <SoceanDepositToAuctionPool
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.SoceanMintBondedTokens:
      return (
        <SoceanMintBondedTokens
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.SoceanPurchaseBondedTokens:
      return (
        <SoceanPurchaseBondedTokens
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.SoceanVest:
      return <SoceanVest index={index} governedAccount={governedAccount} />;
    case InstructionEnum.NativeTransferTokensForm:
      return <TransferTokens index={index} governedAccount={governedAccount} />;
    case InstructionEnum.DeltafiCreateLiquidityProvider:
      return (
        <DeltafiCreateLiquidityProvider
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.DeltafiPoolDeposit:
      return (
        <DeltafiPoolDeposit index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.DeltafiPoolWithdraw:
      return (
        <DeltafiPoolWithdraw index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.DeltafiCreateFarmUser:
      return (
        <DeltafiCreateFarmUser
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.DeltafiFarmDeposit:
      return (
        <DeltafiDepositToFarm index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.DeltafiFarmWithdraw:
      return (
        <DeltafiFarmWithdraw index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.NativeBurnSplTokens:
      return (
        <NativeBurnSplTokens index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.OrcaWhirlpoolOpenPosition:
      return (
        <OrcaWhirlpoolOpenPosition
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.OrcaWhirlpoolIncreaseLiquidity:
      return (
        <OrcaWhirlpoolIncreaseLiquidity
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.OrcaWhirlpoolUpdateFeesAndRewards:
      return (
        <OrcaWhirlpoolUpdateFeesAndRewards
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.OrcaWhirlpoolCollectFees:
      return (
        <OrcaWhirlpoolCollectFees
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.OrcaWhirlpoolDecreaseLiquidity:
      return (
        <OrcaWhirlpoolDecreaseLiquidity
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.OrcaWhirlpoolClosePosition:
      return (
        <OrcaWhirlpoolClosePosition
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.OrcaWhirlpoolSwap:
      return (
        <OrcaWhirlpoolSwap index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.MercurialPoolDeposit:
      return (
        <MercurialPoolDeposit index={index} governedAccount={governedAccount} />
      );
    case InstructionEnum.MercurialPoolWithdraw:
      return (
        <MercurialPoolWithdraw
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.NativeIncreaseComputingBudget:
      return (
        <NativeIncreaseComputingBudget
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.CredixDeposit:
      return <CredixDeposit index={index} governedAccount={governedAccount} />;
    case InstructionEnum.CredixWithdraw:
      return <CredixWithdraw index={index} governedAccount={governedAccount} />;
    default:
      return null;
  }
};

export default SelectedInstruction;
