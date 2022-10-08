import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDEditMangoDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import createEditMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createEditMangoDepositoryInstruction';
import { useState } from 'react';
import Switch from '@components/Switch';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Valid Collateral name is required'),
  insuranceName: yup.string().required('Valid Insurance name is required'),
  quoteMintAndRedeemFee: yup
    .number()
    .moreThan(0, 'Quote mint and redeem fee should be more than 0')
    .lessThan(255, 'Quote mint and redeem fee should be less than 255'),
  uiRedeemableDepositorySupplyCap: yup
    .number()
    .moreThan(0, 'Redeemable depository supply cap should be more than 0'),
});

const EditMangoDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [
    quoteMintAndRedeemFeeChange,
    setQuoteMintAndRedeemFeeChange,
  ] = useState<boolean>(false);

  const [
    redeemableDepositorySupplyCapChange,
    setRedeemableDepositorySupplyCapChange,
  ] = useState<boolean>(false);

  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDEditMangoDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createEditMangoDepositoryInstruction({
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,
        depositoryMintName: form.collateralName!,
        insuranceMintName: form.insuranceName!,
        quoteMintAndRedeemFee: quoteMintAndRedeemFeeChange
          ? form.quoteMintAndRedeemFee!
          : undefined,
        redeemableDepositorySupplyCap: redeemableDepositorySupplyCapChange
          ? form.uiRedeemableDepositorySupplyCap!
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

      <Switch
        checked={quoteMintAndRedeemFeeChange}
        onChange={(checked) => setQuoteMintAndRedeemFeeChange(checked)}
      />

      <Input
        label="Quote Mint and Redeem Fee"
        value={form.quoteMintAndRedeemFee}
        type="number"
        min={0}
        max={255}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'quoteMintAndRedeemFee',
          })
        }
        error={formErrors['quoteMintAndRedeemFee']}
      />

      <Switch
        checked={redeemableDepositorySupplyCapChange}
        onChange={(checked) => setRedeemableDepositorySupplyCapChange(checked)}
      />

      <Input
        label="Rdeemable Depository Supply Cap"
        value={form.uiRedeemableDepositorySupplyCap}
        type="number"
        min={0}
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

export default EditMangoDepository;
