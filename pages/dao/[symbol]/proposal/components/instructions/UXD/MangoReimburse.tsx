import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDMangoReimburseForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import createMangoReimburseInstruction from '@tools/sdk/uxdProtocol/createMangoReimburseInstruction';
import { PublicKey } from '@solana/web3.js';

type TokenSymbol = 'USDC' | 'WSOL' | 'MNGO' | 'ETH' | 'BTC' | 'SRM';
type TokenMap = {
  devnet: {
    [key in TokenSymbol]?: PublicKey;
  };

  mainnet: {
    [key in TokenSymbol]: PublicKey;
  };
};

// MANGO REIMBURSE TODO
const tokenMap: TokenMap = {
  devnet: {
    WSOL: new PublicKey('So11111111111111111111111111111111111111112'),
  },

  mainnet: {
    USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    WSOL: new PublicKey('So11111111111111111111111111111111111111112'),
    MNGO: new PublicKey('MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'),
    ETH: new PublicKey('2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'), // Sollet
    BTC: new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'), // Sollet
    SRM: new PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
  },
};

const mangoReimbursementTable = {
  devnet: new PublicKey('tab2GSQhmstsCiPmPABk1F8QnffSaFEXnqbef7AkEnB'),
  mainnet: new PublicKey('45F9oyj2Jr5pfz1bLoupLGujXkamZEy3RXeKBZudKmJw'),
};

const mangoReimbursementGroup = {
  devnet: new PublicKey('4vSjJeDnJY3edWizzPgNuWRSCnxNoSYHm7zQ3xgTcBKB'),
  mainnet: new PublicKey('Hy4ZsZkVa1ZTVa2ghkKY3TsThYEK9MgaL8VPF569jsHP'),
};

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Collateral Name address is required'),
  insuranceName: yup.string().required('Insurance Name address is required'),
  token: yup.string().required('Token mint is required'),
});

const UXDMangoReimburse = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDMangoReimburseForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({ form, governedAccountPubkey, wallet }) {
      return createMangoReimburseInstruction({
        wallet: wallet as any,
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,

        // MANGO REIMBURSE TODO
        // devnet integration test authority
        // authority: new PublicKey('aca3VWxwBeu8FTZowJ9hfSKGzntjX68EXh1N9xpE1PC'),
        authority: governedAccountPubkey,

        depositoryMintName: form.collateralName!,
        insuranceMintName: form.insuranceName!,
        tokenMint: tokenMap[connection.cluster][form.token!]!,
        payer: wallet.publicKey!,
        mangoReimbursementTable: mangoReimbursementTable[connection.cluster],
        mangoReimbursementGroup: mangoReimbursementGroup[connection.cluster],
      });
    },
  });

  return (
    <>
      <Select
        label="Collateral Name"
        value={form.collateralName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'collateralName' })
        }
        error={formErrors['collateralName']}
      >
        <SelectOptionList list={getDepositoryMintSymbols(connection.cluster)} />
      </Select>

      <Select
        label="Insurance Name"
        value={form.insuranceName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'insuranceName' })
        }
        error={formErrors['insuranceName']}
      >
        <SelectOptionList list={getInsuranceMintSymbols(connection.cluster)} />
      </Select>

      <Select
        label="Token Mint"
        value={form.token}
        placeholder="Please select..."
        onChange={(value) => handleSetForm({ value, propertyName: 'token' })}
        error={formErrors['token']}
      >
        <SelectOptionList list={Object.keys(tokenMap[connection.cluster])} />
      </Select>
    </>
  );
};

export default UXDMangoReimburse;
