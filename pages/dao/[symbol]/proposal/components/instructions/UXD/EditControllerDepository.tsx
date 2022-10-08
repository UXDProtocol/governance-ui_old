import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getDepositoryMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDEditControllerDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import Switch from '@components/Switch';
import { useState } from 'react';
import createEditControllerInstruction from '@tools/sdk/uxdProtocol/createEditControllerInstruction';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Valid Collateral name is required'),
  insuranceName: yup.string().required('Valid Insurance name is required'),
  uiQuoteMintAndRedeemSoftCap: yup
    .number()
    .moreThan(0, 'Quote mint and redeem soft cap should be more than 0'),
  uiRedeemableSoftCap: yup
    .number()
    .moreThan(0, 'Redeemable soft cap should be more than 0'),
  uiRedeemableGlobalSupplyCap: yup
    .number()
    .moreThan(0, 'Redeemable global supply cap should be more than 0'),
});

const RegisterMercurialVaultDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [
    quoteMintAndRedeemSoftCapChange,
    setQuoteMintAndRedeemSoftCapChange,
  ] = useState<boolean>(false);

  const [
    redeemableSoftCapChange,
    setRedeemableSoftCapChange,
  ] = useState<boolean>(false);

  const [
    redeemableGlobalSupplyCapChange,
    setRedeemableGlobalSupplyCapChange,
  ] = useState<boolean>(false);

  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDEditControllerDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createEditControllerInstruction({
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,
        depositoryMintName: form.collateralName!,
        insuranceMintName: form.insuranceName!,
        quoteMintAndRedeemSoftCap: quoteMintAndRedeemSoftCapChange
          ? form.uiQuoteMintAndRedeemSoftCap!
          : undefined,

        redeemableSoftCap: redeemableSoftCapChange
          ? form.uiRedeemableSoftCap!
          : undefined,

        redeemableGlobalSupplyCap: redeemableGlobalSupplyCapChange
          ? form.uiRedeemableGlobalSupplyCap!
          : undefined,
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

      <Switch
        checked={quoteMintAndRedeemSoftCapChange}
        onChange={(checked) => setQuoteMintAndRedeemSoftCapChange(checked)}
      />

      <Input
        label="Quote Mint and Redeem Soft Cap"
        value={form.uiQuoteMintAndRedeemSoftCap}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiQuoteMintAndRedeemSoftCap',
          })
        }
        error={formErrors['uiQuoteMintAndRedeemSoftCap']}
      />

      <Switch
        checked={redeemableSoftCapChange}
        onChange={(checked) => setRedeemableSoftCapChange(checked)}
      />

      <Input
        label="Redeemable Soft Cap Change"
        value={form.uiRedeemableSoftCap}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRedeemableSoftCap',
          })
        }
        error={formErrors['uiRedeemableSoftCap']}
      />

      <Switch
        checked={redeemableGlobalSupplyCapChange}
        onChange={(checked) => setRedeemableGlobalSupplyCapChange(checked)}
      />

      <Input
        label="Redeemable Global Supply Cap"
        value={form.uiRedeemableGlobalSupplyCap}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRedeemableGlobalSupplyCap',
          })
        }
        error={formErrors['uiRedeemableGlobalSupplyCap']}
      />
    </>
  );
};

export default RegisterMercurialVaultDepository;
