import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { MercurialPoolDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import useWalletStore from 'stores/useWalletStore';
import mercurialConfiguration, {
  PoolDescription,
} from '@tools/sdk/mercurial/configuration';
import { getSplTokenNameByMint } from '@utils/splTokens';
import { Pool } from '@mercurial-finance/dynamic-amm-sdk';
import useMercurialAmmProgram from '@hooks/useMercurialAmmProgram';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';
import { PublicKey } from '@solana/web3.js';
import { poolDeposit } from '@tools/sdk/mercurial/poolDeposit';

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
  const [pool, setPool] = useState<Pool | null>(null);

  const [
    associatedTokenAccounts,
    setAssociatedTokenAccounts,
  ] = useState<null | {
    A: {
      account: PublicKey;
      uiBalance: string;
    };
    B: {
      account: PublicKey;
      uiBalance: string;
    };
  }>(null);

  const ammProgram = useMercurialAmmProgram();

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
    shouldSplitIntoSeparateTxs: true,
    schema,
    buildInstruction: async function ({ form, governedAccountPubkey }) {
      if (!pool) {
        throw new Error('Mercurial Pool not found');
      }

      if (!ammProgram) {
        throw new Error('AmmProgram not loaded yet');
      }

      return poolDeposit({
        connection: connection.current,
        authority: governedAccountPubkey,
        pool,
        uiTokenAmountA: form.uiTokenAmountA!,
        uiTokenAmountB: form.uiTokenAmountB!,
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
      setAssociatedTokenAccounts(null);
      return;
    }

    (async () => {
      const [
        [sourceA],
        [sourceB],
      ] = findMultipleATAAddSync(governedAccountPubkey, [
        pool.state.tokenAMint,
        pool.state.tokenBMint,
      ]);

      const [amountA, amountB] = await Promise.all([
        connection.current.getTokenAccountBalance(sourceA),
        connection.current.getTokenAccountBalance(sourceB),
      ]);

      setAssociatedTokenAccounts({
        A: {
          account: sourceA,
          uiBalance: amountA.value.uiAmountString ?? '',
        },
        B: {
          account: sourceB,
          uiBalance: amountB.value.uiAmountString ?? '',
        },
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
            label={`${getSplTokenNameByMint(pool.state.tokenAMint)} Amount`}
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

          {associatedTokenAccounts ? (
            <div className="text-xs text-fgd-3 mt-0 flex flex-col">
              <span>
                ATA: {associatedTokenAccounts.A.account.toBase58() ?? '-'}
              </span>

              <span
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  handleSetForm({
                    value: associatedTokenAccounts.A.uiBalance,
                    propertyName: 'uiTokenAmountA',
                  })
                }
              >
                max: {associatedTokenAccounts.A.uiBalance}
              </span>
            </div>
          ) : null}

          <Input
            label={`${getSplTokenNameByMint(pool.state.tokenBMint)} Amount`}
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

          {associatedTokenAccounts ? (
            <div className="text-xs text-fgd-3 mt-0 flex flex-col">
              <span>
                ATA: {associatedTokenAccounts.B.account.toBase58() ?? '-'}
              </span>

              <span
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  handleSetForm({
                    value: associatedTokenAccounts.B.uiBalance,
                    propertyName: 'uiTokenAmountB',
                  })
                }
              >
                max: {associatedTokenAccounts.B.uiBalance}
              </span>
            </div>
          ) : null}

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
