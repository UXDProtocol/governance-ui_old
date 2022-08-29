import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MercurialPoolWithdrawForm } from '@utils/uiTypes/proposalCreationTypes';
import useWalletStore from 'stores/useWalletStore';
import mercurialConfiguration, {
  PoolDescription,
} from '@tools/sdk/mercurial/configuration';
import { getSplTokenNameByMint } from '@utils/splTokens';
import { Pool } from '@mercurial-finance/dynamic-amm-sdk';
import useMercurialAmmProgram from '@hooks/useMercurialAmmProgram';
import { PublicKey } from '@solana/web3.js';
import { poolWithdraw } from '@tools/sdk/mercurial/poolWithdraw';
import { findATAAddrSync } from '@utils/ataTools';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiMinimumATokenOut: yup
    .number()
    .required('Minimum Amount for Token A is required'),
  uiMinimumBTokenOut: yup
    .number()
    .required('Minimum Amount for Token B is required'),
  uiPoolTokenAmount: yup.number().required('Pool Token Account is required'),
});

const Withdraw = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const [pool, setPool] = useState<Pool | null>(null);

  const [lpTokenATA, setLpTokenATA] = useState<null | {
    account: PublicKey;
    uiBalance: string;
  }>(null);

  const ammProgram = useMercurialAmmProgram();

  const {
    form,
    handleSetForm,
    formErrors,
    governedAccountPubkey,
  } = useInstructionFormBuilder<MercurialPoolWithdrawForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    shouldSplitIntoSeparateTxs: true,
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      if (!pool) {
        throw new Error('Mercurial Pool not found');
      }

      if (!ammProgram) {
        throw new Error('AmmProgram not loaded yet');
      }

      return poolWithdraw({
        connection: connection.current,
        authority: governedAccountPubkey,
        pool,
        uiPoolTokenAmount: form.uiPoolTokenAmount!,
        uiMinimumATokenOut: form.uiMinimumATokenOut!,
        uiMinimumBTokenOut: form.uiMinimumBTokenOut!,
        ammProgram,
        poolPubkey: mercurialConfiguration.pools[form.poolName!].publicKey,
      });
    },
  });

  useEffect(() => {
    (async () => {
      if (!governedAccountPubkey || !ammProgram) {
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
          ammProgram,
          authority: governedAccountPubkey,
          pool: poolInfo.publicKey,
        });

        setPool(pool);
      } catch (e) {
        console.log('Cannot load pool info', e);
      }
    })();
  }, [form.poolName, ammProgram, governedAccountPubkey]);

  useEffect(() => {
    if (!pool || !pool.state || !governedAccountPubkey) {
      setLpTokenATA(null);
      return;
    }

    (async () => {
      const [source] = findATAAddrSync(
        governedAccountPubkey,
        pool.state.lpMint,
      );

      const amount = await connection.current.getTokenAccountBalance(source);

      setLpTokenATA({
        account: source,
        uiBalance: amount.value.uiAmountString ?? '',
      });
    })();
  }, [pool, governedAccountPubkey]);

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

      {pool && pool.state && (
        <>
          <Input
            label="Pool Token Amount"
            value={form.uiPoolTokenAmount}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiPoolTokenAmount',
              })
            }
            error={formErrors['uiPoolTokenAmount']}
          />

          {lpTokenATA ? (
            <div className="text-xs text-fgd-3 mt-0 flex flex-col">
              <span>ATA: {lpTokenATA.account.toBase58() ?? '-'}</span>

              <span
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  handleSetForm({
                    value: lpTokenATA.uiBalance,
                    propertyName: 'uiPoolTokenAmount',
                  })
                }
              >
                max: {lpTokenATA.uiBalance}
              </span>
            </div>
          ) : null}

          <Input
            label={`Minimum ${getSplTokenNameByMint(
              pool.state.tokenAMint,
            )} Amount`}
            value={form.uiMinimumATokenOut}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiMinimumATokenOut',
              })
            }
            error={formErrors['uiMinimumATokenOut']}
          />

          <Input
            label={`Minimum ${getSplTokenNameByMint(
              pool.state.tokenBMint,
            )} Amount`}
            value={form.uiMinimumBTokenOut}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiMinimumBTokenOut',
              })
            }
            error={formErrors['uiMinimumBTokenOut']}
          />
        </>
      )}
    </>
  );
};

export default Withdraw;
