import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import mapleFinanceConfig, {
  MapleFinance,
} from '@tools/sdk/mapleFinance/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MapleFinanceWithdrawalRequestInitializeForm } from '@utils/uiTypes/proposalCreationTypes';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import Select from '@components/inputs/Select';
import withdrawalRequestInitialize from '@tools/sdk/mapleFinance/instructions/withdrawalRequestInitialize';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiWithdrawSharesAmount: yup
    .number()
    .moreThan(0, 'Shares amount to withdraw should be more than 0')
    .required('Shares amount to withdraw is required'),
  poolName: yup.string().required('Pool Name is required'),
});

const WithdrawalRequestInitialize = ({
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
  } = useInstructionFormBuilder<MapleFinanceWithdrawalRequestInitializeForm>({
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

      return withdrawalRequestInitialize({
        authority: governedAccountPubkey,
        programs,
        withdrawSharesAmount: uiAmountToNativeBN(
          form.uiWithdrawSharesAmount!.toString(),
          MapleFinance.pools[form.poolName!].baseMint.decimals,
        ),
        poolName: form.poolName!,
      });
    },
  });

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

      <Input
        label="Shares Amount to Withdraw"
        value={form.uiWithdrawSharesAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiWithdrawSharesAmount',
          })
        }
        error={formErrors['uiWithdrawSharesAmount']}
      />
    </>
  );
};

export default WithdrawalRequestInitialize;
