import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import mapleFinanceConfig, {
  MapleFinance,
} from '@tools/sdk/mapleFinance/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MapleFinanceWithdrawalRequestExecuteForm } from '@utils/uiTypes/proposalCreationTypes';
import Select from '@components/inputs/Select';
import TokenAccountSelect from '../../TokenAccountSelect';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import withdrawalRequestExecute from '@tools/sdk/mapleFinance/instructions/withdrawalRequestExecute';
import { PublicKey } from '@solana/web3.js';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool Name is required'),
  destinationAccount: yup.string().required('Destination account is required'),
});

const WithdrawalRequestExecute = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
  } = useInstructionFormBuilder<MapleFinanceWithdrawalRequestExecuteForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      form,
      connection,
      wallet,
      governedAccountPubkey,
    }) {
      const programs = mapleFinanceConfig.getMapleFinancePrograms({
        connection,
        wallet,
      });

      return withdrawalRequestExecute({
        authority: governedAccountPubkey,
        programs,
        poolName: form.poolName!,
        destinationAccount: new PublicKey(form.destinationAccount!),
      });
    },
  });

  // Governance underlying accounts that can be selected as source
  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountPubkey,
  );

  return (
    <>
      <Select
        label="Pool"
        value={form.poolName}
        placeholder="Please select..."
        onChange={(value) => {
          handleSetForm({
            value,
            propertyName: 'poolName',
          });
        }}
        error={formErrors['poolName']}
      >
        {Object.keys(MapleFinance.pools).map((name) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>

      {ownedTokenAccountsInfo && (
        <TokenAccountSelect
          label="Destination Account"
          value={form.destinationAccount}
          onChange={(value) =>
            handleSetForm({ value, propertyName: 'destinationAccount' })
          }
          error={formErrors['destinationAccount']}
          ownedTokenAccountsInfo={ownedTokenAccountsInfo}
          filterByMint={
            form.poolName && MapleFinance.pools[form.poolName]
              ? [MapleFinance.pools[form.poolName].baseMint.mint]
              : undefined
          }
        />
      )}
    </>
  );
};

export default WithdrawalRequestExecute;
