import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getDepositoryMintSymbols } from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDEditMercurialVaultDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import Switch from '@components/Switch';
import { useState } from 'react';
import createEditMercurialVaultDepositoryInstruction from '@tools/sdk/uxdProtocol/createEditMercurialVaultDepositoryInstruction';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Valid Collateral name is required'),
  mintingFeeInBps: yup
    .number()
    .moreThan(0, 'Minting fee in bps should be more than 0')
    .lessThan(255, 'Minting fee in bps should be less than 255'),
  redeemingFeeInBps: yup
    .number()
    .moreThan(0, 'Redeeming fee in bps should be more than 0')
    .lessThan(255, 'Redeeming fee in bps should be less than 255')
    .required('Redeeming fee in bps is required'),
  uiRedeemableDepositorySupplyCap: yup
    .number()
    .moreThan(0, 'Redeemable depository supply cap should be more than 0'),
});

const RegisterMercurialVaultDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const [mintingFeesInBpsChange, setMintingFeesInBpsChange] = useState<boolean>(
    false,
  );

  const [
    redeemingFeesInBpsChange,
    setRedeemingFeesInBpsChange,
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
  } = useInstructionFormBuilder<UXDEditMercurialVaultDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      return createEditMercurialVaultDepositoryInstruction({
        connection,
        uxdProgramId: form.governedAccount!.governance!.account.governedAccount,
        authority: governedAccountPubkey,
        depositoryMintName: form.collateralName!,
        mintingFeeInBps: mintingFeesInBpsChange
          ? form.mintingFeeInBps!
          : undefined,

        redeemingFeeInBps: redeemingFeesInBpsChange
          ? form.redeemingFeeInBps!
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

      <Switch
        checked={mintingFeesInBpsChange}
        onChange={(checked) => setMintingFeesInBpsChange(checked)}
      />

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

      <Switch
        checked={redeemingFeesInBpsChange}
        onChange={(checked) => setRedeemingFeesInBpsChange(checked)}
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

      <Switch
        checked={redeemableDepositorySupplyCapChange}
        onChange={(checked) => setRedeemableDepositorySupplyCapChange(checked)}
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
