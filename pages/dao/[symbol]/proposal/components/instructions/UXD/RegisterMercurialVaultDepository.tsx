import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getDepositoryMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDRegisterMercurialVaultDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import createRegisterMercurialVaultDepositoryInstruction from '@tools/sdk/uxdProtocol/createRegisterMercurialVaultDepositoryInstruction';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Valid Collateral name is required'),
  insuranceName: yup.string().required('Valid Insurance name is required'),
  mintingFeeInBps: yup
    .number()
    .moreThan(0, 'Minting fee in bps should be more than 0')
    .lessThan(255, 'Minting fee in bps should be less than 255')
    .required('Minting fee in bps is required'),
  redeemingFeeInBps: yup
    .number()
    .moreThan(0, 'Redeeming fee in bps should be more than 0')
    .lessThan(255, 'Redeeming fee in bps should be less than 255')
    .required('Redeeming fee in bps is required'),
  uiRedeemableDepositorySupplyCap: yup
    .number()
    .moreThan(0, 'Redeemable depository supply cap should be more than 0')
    .required('Redeemable depository supply cap is required'),
});

const RegisterMercurialVaultDepository = ({
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
  } = useInstructionFormBuilder<UXDRegisterMercurialVaultDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, wallet, governedAccountPubkey }) {
      return createRegisterMercurialVaultDepositoryInstruction({
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,
        payer: wallet.publicKey!,
        depositoryMintName: form.collateralName!,
        mintingFeeInBps: form.mintingFeeInBps!,
        redeemingFeeInBps: form.redeemingFeeInBps!,
        redeemableDepositorySupplyCap: form.uiRedeemableDepositorySupplyCap!,
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

      <Input
        label="Minting Fees in BPS"
        value={form.mintingFeeInBps}
        type="number"
        min={0}
        max={255}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mintingFeeInBps',
          })
        }
        error={formErrors['mintingFeeInBps']}
      />

      <Input
        label="Redeeming Fees in BPS"
        value={form.redeemingFeeInBps}
        type="number"
        min={0}
        max={255}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'redeemingFeeInBps',
          })
        }
        error={formErrors['redeemingFeeInBps']}
      />

      <Input
        label="Redeemable Depository Supply Cap"
        value={form.uiRedeemableDepositorySupplyCap}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRedeemableDepositorySupplyCap',
          })
        }
        error={formErrors['uiRedeemableDepositorySupplyCap']}
      />
    </>
  );
};

export default RegisterMercurialVaultDepository;
