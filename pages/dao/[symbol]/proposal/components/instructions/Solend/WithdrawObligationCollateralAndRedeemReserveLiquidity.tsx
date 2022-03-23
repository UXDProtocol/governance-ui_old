/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import BigNumber from 'bignumber.js'
import * as yup from 'yup'
import { BN } from '@project-serum/anchor'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Select from '@components/inputs/Select'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useRealm from '@hooks/useRealm'
import SolendConfiguration from '@tools/sdk/solend/configuration'
import { withdrawObligationCollateralAndRedeemReserveLiquidity } from '@tools/sdk/solend/withdrawObligationCollateralAndRedeemReserveLiquidity'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  WithdrawObligationCollateralAndRedeemReserveLiquidityForm,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'

const WithdrawObligationCollateralAndRedeemReserveLiquidity = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  } = useGovernedMultiTypeAccounts()

  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [
    form,
    setForm,
  ] = useState<WithdrawObligationCollateralAndRedeemReserveLiquidityForm>({
    uiAmount: '0',
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    const invalid = {
      serializedInstruction: '',
      isValid: false,
      governance: form.governedAccount?.governance,
    }

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !form.lendingMarketName ||
      !form.tokenName
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const {
      supportedTokens,
    } = SolendConfiguration.getSupportedLendingMarketInformation(
      form.lendingMarketName
    )

    if (!supportedTokens[form.tokenName]) {
      throw new Error(
        `Unsupported token ${form.tokenName} for Lending market ${form.lendingMarketName}`
      )
    }

    const tx = await withdrawObligationCollateralAndRedeemReserveLiquidity({
      obligationOwner: pubkey,
      liquidityAmount: new BN(
        new BigNumber(form.uiAmount)
          .shiftedBy(supportedTokens[form.tokenName]!.decimals)
          .toString()
      ),
      lendingMarketName: form.lendingMarketName,
      ...(form.destinationLiquidity && {
        destinationLiquidity: new PublicKey(form.destinationLiquidity),
      }),
      tokenName: form.tokenName,
    })

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    lendingMarketName: yup.string().required('Lending Market Name is required'),
    tokenName: yup.string().required('Token Name is required'),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      <Select
        label="Lending Market"
        value={form.lendingMarketName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'lendingMarketName' })
        }
        error={formErrors['baseTokenName']}
      >
        {SolendConfiguration.getSupportedLendingMarketNames().map((value) => (
          <Select.Option key={value} value={value}>
            {value}
          </Select.Option>
        ))}
      </Select>

      {form.lendingMarketName ? (
        <Select
          label="Token Name"
          value={form.tokenName}
          placeholder="Please select..."
          onChange={(value) =>
            handleSetForm({ value, propertyName: 'tokenName' })
          }
          error={formErrors['baseTokenName']}
        >
          {Object.keys(
            SolendConfiguration.getSupportedLendingMarketInformation(
              form.lendingMarketName
            ).supportedTokens
          ).map((tokenName) => (
            <Select.Option key={tokenName} value={tokenName}>
              {tokenName}
            </Select.Option>
          ))}
        </Select>
      ) : null}

      <Input
        label="Amount to withdraw"
        value={form.uiAmount}
        type="string"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiAmount',
          })
        }
        error={formErrors['uiAmount']}
      />

      <Input
        label="Destination Account (Optional - default to governance ATA"
        value={form.destinationLiquidity}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationLiquidity',
          })
        }
        error={formErrors['destinationLiquidity']}
      />
    </>
  )
}

export default WithdrawObligationCollateralAndRedeemReserveLiquidity
