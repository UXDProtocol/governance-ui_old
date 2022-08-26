import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MercurialPoolDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import useWalletStore from 'stores/useWalletStore';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import mercurialConfiguration, {
  PoolDescription,
} from '@tools/sdk/mercurial/configuration';
import { getSplTokenNameByMint } from '@utils/splTokens';
import AmmImpl from '@mercurial-finance/dynamic-amm-sdk';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiTokenAmountA: yup.number().required('Amount for Token A is required'),
  uiTokenAmountB: yup.number().required('Amount for Token B is required'),
  slippage: yup.number().required('Slippage value is required'),
});

const Deposit = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const [pool, setPool] = useState<AmmImpl | null>(null);

  const {
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
  } = useInstructionFormBuilder<MercurialPoolDepositForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      if (!pool) {
        throw new Error('Mercurial Pool not found');
      }

      const {
        poolTokenAmountOut,
        tokenAInAmount,
        tokenBInAmount,
      } = pool.getDepositQuote(
        uiAmountToNativeBN(
          form.uiTokenAmountA!.toString(),
          pool.tokenA.decimals,
        ),
        uiAmountToNativeBN(
          form.uiTokenAmountB!.toString(),
          pool.tokenB.decimals,
        ),
        true,
        form.slippage!,
      );

      const transaction = await pool.deposit(
        governedAccountPubkey,
        tokenAInAmount,
        tokenBInAmount,
        poolTokenAmountOut,
      );

      if (transaction.instructions.length !== 1) {
        throw new Error('More than 1 instruction for deposit');
      }

      const instruction = transaction.instructions[0];

      return instruction;
    },
  });

  useEffect(() => {
    (async () => {
      if (!governedAccountPubkey || !connection) {
        return;
      }

      if (!form.poolName) {
        setPool(null);
        return;
      }

      const poolInfo: PoolDescription =
        mercurialConfiguration.pools[form.poolName];

      try {
        const pool = await mercurialConfiguration.loadPool({
          connection: connection.current,
          pool: poolInfo.publicKey,
        });

        console.log('Pool', pool.poolState, pool.poolInfo);
        console.log('Pool infos', {
          lpMint: pool.poolState.lpMint.toBase58(),
          tokenAMint: pool.poolState.tokenAMint.toBase58(),
          tokenBMint: pool.poolState.tokenBMint.toBase58(),
          tokenAAmount: pool.poolInfo.tokenAAmount.toString(),
          tokenBAmount: pool.poolInfo.tokenBAmount.toString(),
        });

        setPool(pool);
      } catch (e) {
        console.log('e', e);
      }
    })();
  }, [form.poolName, connection]);

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>;
  }

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

          setPool(mercurialConfiguration.pools[value] ?? null);
        }}
        error={formErrors['poolName']}
      >
        {Object.keys(mercurialConfiguration.pools).map((name) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>

      {pool && pool.poolState && (
        <>
          <Input
            label={`${getSplTokenNameByMint(pool.poolState.tokenAMint)} Amount`}
            value={form.uiTokenAmountA}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiTokenAmountA',
              })
            }
            error={formErrors['uiTokenAmountA']}
          />

          <Input
            label={`${getSplTokenNameByMint(pool.poolState.tokenBMint)} Amount`}
            value={form.uiTokenAmountB}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiTokenAmountB',
              })
            }
            error={formErrors['uiTokenAmountB']}
          />

          <Input
            label="Slippage from 0 to 100, up to 2 decimals"
            value={form.slippage}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'slippage',
              })
            }
            error={formErrors['slippage']}
          />
        </>
      )}
    </>
  );
};

export default Deposit;
