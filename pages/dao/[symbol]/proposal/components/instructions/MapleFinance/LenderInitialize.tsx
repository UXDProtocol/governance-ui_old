import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import mapleFinanceConfig, {
  MapleFinance,
} from '@tools/sdk/mapleFinance/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MapleFinanceLenderInitializeForm } from '@utils/uiTypes/proposalCreationTypes';
import Select from '@components/inputs/Select';
import { PublicKey } from '@solana/web3.js';
import lenderInitialize from '@tools/sdk/mapleFinance/instructions/lenderInitialize';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool Name is required'),
});

const LenderInitialize = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const governedAccountPubkey = new PublicKey(
    '9uM8UiGnpbVUUo3XMiESD54PDQbdLcwdunqQMebaFu2r',
  );

  const {
    form,
    handleSetForm,
    formErrors,
    // governedAccountPubkey,
  } = useInstructionFormBuilder<MapleFinanceLenderInitializeForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      form,
      connection,
      wallet,
      // governedAccountPubkey,
    }) {
      const programs = mapleFinanceConfig.getMapleFinancePrograms({
        connection,
        wallet,
      });

      return lenderInitialize({
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

export default LenderInitialize;
