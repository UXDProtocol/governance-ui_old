import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDInitializeIdentityDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import createInitializeIdentityDepositoryInstruction from '@tools/sdk/uxdProtocol/createInitializeIdentityDepositoryInstruction';
import { PublicKey } from '@solana/web3.js';
import { USDC_DECIMALS } from '@uxd-protocol/uxd-client';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
});

const InitializeIdentityDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  useInstructionFormBuilder<UXDInitializeIdentityDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, wallet }) {
      return createInitializeIdentityDepositoryInstruction({
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: new PublicKey('aca3VWxwBeu8FTZowJ9hfSKGzntjX68EXh1N9xpE1PC'), // governedAccountPubkey,
        payer: wallet.publicKey!,
        collateralMint: new PublicKey(
          '6L9fgyYtbz34JvwvYyL6YzJDAywz9PKGttuZuWyuoqje',
        ),
        collateralMintSymbol: 'USDC',
        collateralMintDecimals: USDC_DECIMALS,
      });
    },
  });

  return <></>;
};

export default InitializeIdentityDepository;
