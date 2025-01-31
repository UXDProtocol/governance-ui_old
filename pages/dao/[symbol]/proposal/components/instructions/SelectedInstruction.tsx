import { GovernedMultiTypeAccount } from '@utils/tokens';
import { InstructionEnum } from '@utils/uiTypes/proposalCreationTypes';
import ProgramUpgrade from './bpfUpgradeableLoader/ProgramUpgrade';
import CreateAssociatedTokenAccount from './Native/CreateAssociatedTokenAccount';
import RaydiumAddLiquidityToPool from './Raydium/AddLiquidityToPool';
import RaydiumRemoveLiquidityFromPool from './Raydium/RemoveLiquidityFromPool';
import NativeMint from './Native/Mint';
import NativeEmpty from './Native/Empty';
import NativeCustomBase64 from './Native/CustomBase64';
import SetProgramAuthority from './Native/SetProgramAuthority';
import SplTokenTransfer from './Native/SplTokenTransfer';
import LifinityDepositToPool from './Lifinity/DepositToPool';
import LifinityWithdrawFromPool from './Lifinity/WithdrawFromPool';
import QuarryClaimRewards from './quarryMine/ClaimRewards';
import QuarryCreateMiner from './quarryMine/CreateMiner';
import QuarryCreateMinerVaultAccount from './quarryMine/CreateMinerVaultAccount';
import QuarryStakeTokens from './quarryMine/StakeTokens';
import QuarryWithdrawTokens from './quarryMine/WithdrawTokens';
import SaberPeripheryRedeemAllTokenFromMintProxy from './SaberPeriphery/RedeemAllTokensFromMintProxy';
import SaberPoolsDeposit from './SaberPools/Deposit';
import SaberPoolsWithdrawOne from './SaberPools/WithdrawOne';
import SaberPoolsSwap from './SaberPools/Swap';
import SoceanCancelVest from './Socean/CancelVest';
import SoceanCloseAuction from './Socean/CloseAuction';
import SoceanDepositToAuctionPool from './Socean/DepositToAuctionPool';
import SoceanMintBondedTokens from './Socean/MintBondedTokens';
import SoceanPurchaseBondedTokens from './Socean/PurchaseBondedTokens';
import SoceanVest from './Socean/Vest';
import SolendCreateObligationAccount from './Solend/CreateObligationAccount';
import SolendDepositReserveLiquidityAndObligationCollateral from './Solend/DepositReserveLiquidityAndObligationCollateral';
import SolendInitObligationAccount from './Solend/InitObligationAccount';
import SolendRefreshObligation from './Solend/RefreshObligation';
import SolendRefreshReserve from './Solend/RefreshReserve';
import SolendWithdrawObligationCollateralAndRedeemReserveLiquidity from './Solend/WithdrawObligationCollateralAndRedeemReserveLiquidity';
import TribecaCreateEpochGauge from './Tribeca/CreateEpochGauge';
import TribecaCreateEscrowGovernanceTokenATA from './Tribeca/CreateEscrowGovernanceTokenATA';
import TribecaCreateGaugeVote from './Tribeca/CreateGaugeVote';
import TribecaCreateGaugeVoter from './Tribeca/CreateGaugeVoter';
import TribecaGaugeCommitVote from './Tribeca/GaugeCommitVote';
import TribecaGaugeRevertVote from './Tribeca/GaugeRevertVote';
import TribecaLock from './Tribeca/Lock';
import TribecaNewEscrow from './Tribeca/NewEscrow';
import TribecaNewVote from './Tribeca/NewVote';
import TribecaCastVote from './Tribeca/CastVote';
import TribecaPrepareEpochGaugeVoter from './Tribeca/PrepareEpochGaugeVoter';
import TribecaResetEpochGaugeVoter from './Tribeca/ResetEpochGaugeVoter';
import TribecaGaugeSetVote from './Tribeca/SetGaugeVote';
import UXDInitializeController from './UXD/InitializeController';
import UXDSetRedeemableGlobalSupplyCap from './UXD/SetRedeemGlobalSupplyCap';
import UXDRegisterMercurialVaultDepository from './UXD/RegisterMercurialVaultDepository';
import UXDRegisterCredixLpDepository from './UXD/RegisterCredixLpDepository';
import UXDEditMercurialVaultDepository from './UXD/EditMercurialVaultDepository';
import UXDEditCredixLpDepository from './UXD/EditCredixLpDepository';
import UXDEditController from './UXD/EditController';
import UXDMintWithMercurialVaultDepository from './UXD/MintWithMercurialVaultDepository';
import UXDMintWithCredixLpDepository from './UXD/MintWithCredixLpDepository';
import UXDInitializeIdentityDepository from './UXD/InitializeIdentityDepository';
import UXDMintWithIdentityDepository from './UXD/MintWithIdentityDepository';
import UXDRedeemFromIdentityDepository from './UXD/RedeemFromIdentityDepository';
import UXDRedeemFromMercurialVaultDepository from './UXD/RedeemFromMercurialVaultDepository';
import UXDRedeemFromCredixLpDepository from './UXD/RedeemFromCredixLpDepository';
import UXDEditIdentityDepository from './UXD/EditIdentityDepository';
import UXDStakingInitializeStakingCampaign from './UXDStaking/InitializeStakingCampaign';
import UXDStakingMigrateStakingCampaignFromV1ToV2 from './UXDStaking/MigrateStakingCampaignFromV1ToV2';
import UXDStakingFinalizeStakingCampaign from './UXDStaking/FinalizeStakingCampaign';
import UXDStakingAddStakingOption from './UXDStaking/AddStakingOption';
import UXDStakingActivateStakingOption from './UXDStaking/ActivateStakingOption';
import UXDStakingRefillRewardVault from './UXDStaking/RefillRewardVault';
import TransferTokens from './Native/TransferTokens';
import MapleFinanceLenderDeposit from './MapleFinance/LenderDeposit';
import DeltafiPoolDeposit from './Deltafi/Deposit';
import DeltafiCreateLiquidityProvider from './Deltafi/CreateLiquidityProvider';
import DeltafiPoolWithdraw from './Deltafi/Withdraw';
import DeltafiCreateFarmUser from './Deltafi/CreateFarmUserV2';
import DeltafiDepositToFarm from './Deltafi/DepositToFarm';
import DeltafiFarmWithdraw from './Deltafi/WithdrawFromFarm';
import DeltafiClaimFarmRewards from './Deltafi/ClaimFarmRewards';
import NativeBurnSplTokens from './Native/BurnSplTokens';
import OrcaWhirlpoolOpenPosition from './Orca/WhirlpoolOpenPosition';
import OrcaWhirlpoolIncreaseLiquidity from './Orca/WhirlpoolIncreaseLiquidity';
import OrcaWhirlpoolUpdateFeesAndRewards from './Orca/WhirlpoolUpdateFeesAndRewards';
import OrcaWhirlpoolCollectFees from './Orca/WhirlpoolCollectFees';
import OrcaWhirlpoolDecreaseLiquidity from './Orca/WhirlpoolDecreaseLiquidity';
import OrcaWhirlpoolClosePosition from './Orca/WhirlpoolClosePosition';
import OrcaWhirlpoolSwap from './Orca/WhirlpoolSwap';
import MercurialPoolDeposit from './Mercurial/PoolDeposit';
import MercurialPoolWithdraw from './Mercurial/PoolWithdraw';
import NativeIncreaseComputingBudget from './Native/IncreaseComputingBudget';
import CredixDeposit from './Credix/Deposit';
import CredixWithdraw from './Credix/Withdraw';

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
    case InstructionEnum.UXDRegisterMercurialVaultDepository:
      return (
        <UXDRegisterMercurialVaultDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDRegisterCredixLpDepository:
      return (
        <UXDRegisterCredixLpDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDEditMercurialVaultDepository:
      return (
        <UXDEditMercurialVaultDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDEditCredixLpDepository:
      return (
        <UXDEditCredixLpDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDMintWithMercurialVaultDepository:
      return (
        <UXDMintWithMercurialVaultDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDMintWithCredixLpDepository:
      return (
        <UXDMintWithCredixLpDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDInitializeIdentityDepository:
      return (
        <UXDInitializeIdentityDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDMintWithIdentityDepository:
      return (
        <UXDMintWithIdentityDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDRedeemFromIdentityDepository:
      return (
        <UXDRedeemFromIdentityDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDRedeemFromMercurialVaultDepository:
      return (
        <UXDRedeemFromMercurialVaultDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDRedeemFromCredixLpDepository:
      return (
        <UXDRedeemFromCredixLpDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDEditIdentityDepository:
      return (
        <UXDEditIdentityDepository
          index={index}
          governedAccount={governedAccount}
        />
      );
    case InstructionEnum.UXDEditController:
      return (
        <UXDEditController index={index} governedAccount={governedAccount} />
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
    case InstructionEnum.TribecaNewVote:
      return <TribecaNewVote index={index} governedAccount={governedAccount} />;
    case InstructionEnum.TribecaCastVote:
      return (
        <TribecaCastVote index={index} governedAccount={governedAccount} />
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
    case InstructionEnum.DeltafiClaimFarmRewards:
      return (
        <DeltafiClaimFarmRewards
          index={index}
          governedAccount={governedAccount}
        />
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
