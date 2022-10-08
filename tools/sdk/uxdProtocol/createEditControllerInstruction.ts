import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { ConnectionContext } from '@utils/connection';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import {
  getDepositoryMintInfo,
  getInsuranceMintInfo,
  instantiateMangoDepository,
  uxdClient,
} from './uxdClient';

const createEditControllerInstruction = ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  insuranceMintName,
  quoteMintAndRedeemSoftCap,
  redeemableSoftCap,
  redeemableGlobalSupplyCap,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  insuranceMintName: string;
  quoteMintAndRedeemSoftCap?: number;
  redeemableSoftCap?: number;
  redeemableGlobalSupplyCap?: number;
}): TransactionInstruction => {
  const {
    address: depositoryMint,
    decimals: depositoryDecimals,
  } = getDepositoryMintInfo(connection.cluster, depositoryMintName);

  const {
    address: insuranceMint,
    decimals: insuranceDecimals,
  } = getInsuranceMintInfo(connection.cluster, insuranceMintName);

  const depository = instantiateMangoDepository({
    uxdProgramId,
    depositoryMint,
    insuranceMint,
    depositoryName: depositoryMintName,
    depositoryDecimals,
    insuranceName: insuranceMintName,
    insuranceDecimals,
  });

  const client = uxdClient(uxdProgramId);

  return client.createEditControllerInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    authority,
    {
      quoteMintAndRedeemSoftCap: quoteMintAndRedeemSoftCap
        ? {
            value: quoteMintAndRedeemSoftCap,
            depository,
          }
        : undefined,
      redeemableSoftCap,
      redeemableGlobalSupplyCap,
    },
    Provider.defaultOptions(),
  );
};

export default createEditControllerInstruction;
