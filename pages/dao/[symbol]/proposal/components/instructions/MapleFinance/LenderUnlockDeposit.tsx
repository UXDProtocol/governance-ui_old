import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import mapleFinanceConfig, {
  MapleFinance,
} from '@tools/sdk/mapleFinance/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MapleFinanceLenderUnlockDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import Select from '@components/inputs/Select';
import lenderUnlockDeposit from '@tools/sdk/mapleFinance/instructions/lenderUnlockDeposit';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool Name is required'),
});

const LenderUnlockDeposit = ({
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
  } = useInstructionFormBuilder<MapleFinanceLenderUnlockDepositForm>({
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

      return lenderUnlockDeposit({
        authority: governedAccountPubkey,
        programs,
        poolName: form.poolName!,
      });
    },
  });

  return (
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
  );
};

export default LenderUnlockDeposit;
