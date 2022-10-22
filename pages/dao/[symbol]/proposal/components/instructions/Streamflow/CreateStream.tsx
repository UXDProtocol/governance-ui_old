import React, { useState } from 'react';
import Input from 'components/inputs/Input';
import Switch from '@components/Switch';

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token';
import * as yup from 'yup';
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Keypair,
  TransactionInstruction,
} from '@solana/web3.js';

import { StreamflowCreateStreamForm } from '@utils/uiTypes/proposalCreationTypes';

import { BN, createUncheckedStreamInstruction } from '@streamflow/stream';
import Select from '@components/inputs/Select';
import { StyledLabel } from '@components/inputs/styles';
import { GovernedMultiTypeAccount, tryGetMint } from '@utils/tokens';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import tokenService from '@utils/services/token';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import TokenAccountSelect from '../../TokenAccountSelect';
import { ConnectionContext } from '@utils/connection';
import useWalletStore from 'stores/useWalletStore';

const STREAMFLOW_TREASURY_PUBLIC_KEY = new PublicKey(
  '5SEpbdjFK5FxwTvfsGMXVQTD2v4M2c5tyRTxhdsPkgDw',
);

const WITHDRAWOR_PUBLIC_KEY = new PublicKey(
  'wdrwhnCv4pzW8beKsbPa4S2UDZrXenjg16KJdKSpb5u',
);

export const STREAMFLOW_PROGRAM_ID =
  'strmRqUCoQUgGUan5YhzUZa6KqdzwX5L6FpUxfmKg5m';

export const PERIOD = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 24 * 3600,
  WEEK: 7 * 24 * 3600,
  MONTH: Math.floor(30.4167 * 24 * 3600), //30.4167 days
  YEAR: 365 * 24 * 3600, // 365 days
};

const releaseFrequencyUnits = {
  0: { idx: 0, display: 'second', value: PERIOD.SECOND },
  1: { idx: 1, display: 'minute', value: PERIOD.MINUTE },
  2: { idx: 2, display: 'hour', value: PERIOD.HOUR },
  3: { idx: 3, display: 'day', value: PERIOD.DAY },
  4: { idx: 4, display: 'week', value: PERIOD.WEEK },
  5: { idx: 5, display: 'month', value: PERIOD.MONTH },
  6: { idx: 6, display: 'year', value: PERIOD.YEAR },
};

async function ata(mint: PublicKey, account: PublicKey) {
  return await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    account,
    true,
  );
}

async function checkInitTokenAccount(
  account: PublicKey,
  instructions: TransactionInstruction[],
  connection: ConnectionContext,
  mint: PublicKey,
  owner: PublicKey,
  feePayer: PublicKey,
) {
  const accountInfo = await connection.current.getAccountInfo(account);
  if (accountInfo && accountInfo.lamports > 0) {
    return;
  }
  instructions.push(
    Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mint, // mint
      account, // ata
      owner, // owner of token account
      feePayer,
    ),
  );
}

export interface TokenMintMetadata {
  readonly decimals: number;
  readonly symbol: string;
}

// Mint metadata for Well known tokens displayed on the instruction card
export const MINT_METADATA = {
  Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj: { symbol: 'STRM', decimals: 9 },
};

export function getMintMetadata(
  tokenMintPk: PublicKey | undefined,
): TokenMintMetadata {
  const tokenMintAddress = tokenMintPk ? tokenMintPk.toBase58() : '';
  const tokenInfo = tokenMintAddress
    ? tokenService.getTokenInfo(tokenMintAddress)
    : null;
  return tokenInfo
    ? {
        name: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        address: tokenInfo.address,
      }
    : MINT_METADATA[tokenMintAddress];
}

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Program governed account is required'),
  tokenAccount: yup.object().nullable().required('Token account is required'),
  recipient: yup.string().required('Recipient address is required'),
  start: yup.date().nullable().required('Start time is required'),
  depositedAmount: yup
    .number()
    .nullable()
    .min(0, 'Amount must be positive number')
    .required('Amount is required'),
  amountAtCliff: yup
    .number()
    .nullable()
    .min(0, 'Amount released at start must be positive number')
    .lessThan(
      yup.ref('depositedAmount'),
      'Amount released at start must be less than total amount',
    ),
  releaseAmount: yup
    .number()
    .nullable()
    .moreThan(0, 'Release amount must be positive number')
    .lessThan(
      yup.ref('depositedAmount'),
      'Release amount must be less than total amount',
    ),
  cancelable: yup.boolean(),
});

const CreateStream = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connectionCtx = useWalletStore((s) => s.connection);

  const {
    form,
    formErrors,
    handleSetForm,
    governedAccountPubkey,
  } = useInstructionFormBuilder<StreamflowCreateStreamForm>({
    index,
    initialFormValues: {
      governedAccount,
      recipient: '',
      start: new Date().toISOString(),
      depositedAmount: 0,
      releaseAmount: 0,
      amountAtCliff: 0,
      cancelable: false,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({ form, connection, wallet }) {
      if (
        !connection ||
        !programId ||
        !form.tokenAccount ||
        !wallet?.publicKey
      ) {
        throw new Error('data incomplete');
      }

      const tokenMintInfo = await tryGetMint(
        connection,
        form.tokenAccount.mint,
      );
      if (!tokenMintInfo?.publicKey) {
        throw new Error('could not find corresponding token mint');
      }

      const decimals = form.tokenAccount.mintDecimals;
      const tokenMint = form.tokenAccount.mint;
      const senderAccount = new PublicKey(
        'Hb8DfK8Jj2ttBSEEgwR8xt5yPG9ptgNXitR5ByvS3Y2L',
      );
      const partnerPublicKey = senderAccount;
      const partnerTokens = await ata(
        tokenMintInfo.publicKey,
        partnerPublicKey,
      );

      let start;
      if (!startOnApproval) {
        start = new u64(Math.floor(Date.parse(form.start) / 1000));
      } else [(start = new u64(0))];
      const strmMetadata = Keypair.generate();
      const [escrowTokens] = await PublicKey.findProgramAddress(
        [Buffer.from('strm'), strmMetadata.publicKey.toBuffer()],
        new PublicKey(STREAMFLOW_PROGRAM_ID),
      );
      const streamflowTreasuryTokens = await ata(
        tokenMint,
        STREAMFLOW_TREASURY_PUBLIC_KEY,
      );
      const recipientPublicKey = new PublicKey(form.recipient);
      const recipientTokens = await ata(tokenMint, recipientPublicKey);
      const prerequisiteInstructions: TransactionInstruction[] = [
        SystemProgram.createAccount({
          programId: new PublicKey(STREAMFLOW_PROGRAM_ID),
          space: 1104,
          lamports: 99388800,
          fromPubkey: wallet?.publicKey,
          newAccountPubkey: strmMetadata.publicKey,
        }),
      ];

      checkInitTokenAccount(
        recipientTokens,
        prerequisiteInstructions,
        connectionCtx,
        tokenMint,
        recipientPublicKey,
        wallet?.publicKey,
      );
      checkInitTokenAccount(
        partnerTokens,
        prerequisiteInstructions,
        connectionCtx,
        tokenMint,
        partnerPublicKey,
        wallet?.publicKey,
      );
      checkInitTokenAccount(
        streamflowTreasuryTokens,
        prerequisiteInstructions,
        connectionCtx,
        tokenMint,
        STREAMFLOW_TREASURY_PUBLIC_KEY,
        wallet?.publicKey,
      );

      const tokenAccount = form.tokenAccount.pubkey;
      const period = releaseFrequencyUnits[releaseUnitIdx].value;
      const createStreamData = {
        start,
        depositedAmount: new BN(form.depositedAmount * 10 ** decimals),
        period: new BN(period),
        cliff: start,
        cliffAmount: new BN(form.amountAtCliff * 10 ** decimals),
        amountPerPeriod: new BN(form.releaseAmount * 10 ** decimals),
        name: 'SPL Realms proposal',
        canTopup: false,
        cancelableBySender: form.cancelable,
        cancelableByRecipient: false,
        transferableBySender: true,
        transferableByRecipient: false,
        automaticWithdrawal: true,
        withdrawFrequency: new BN(period),
        recipient: recipientPublicKey,
        //recipientTokens: recipientTokens,
        //streamflowTreasury: STREAMFLOW_TREASURY_PUBLIC_KEY,
        ////streamflowTreasuryTokens: streamflowTreasuryTokens,
        partner: partnerPublicKey,
        //partnerTokens: partnerTokens,
      };
      const createStreamAccounts = {
        sender: senderAccount,
        senderTokens: tokenAccount,
        metadata: strmMetadata.publicKey,
        escrowTokens,
        mint: tokenMint,
        feeOracle: STREAMFLOW_TREASURY_PUBLIC_KEY,
        rent: SYSVAR_RENT_PUBKEY,
        timelockProgram: new PublicKey(STREAMFLOW_PROGRAM_ID),
        tokenProgram: TOKEN_PROGRAM_ID,
        withdrawor: WITHDRAWOR_PUBLIC_KEY,
        systemProgram: SystemProgram.programId,
      };
      const tx = createUncheckedStreamInstruction(
        createStreamData,
        strmProgram,
        createStreamAccounts,
      );

      // const signers: Keypair[] = [strmMetadata];
      // return {
      //   serializedInstruction: serializeInstructionToBase64(tx),
      //   isValid: true,
      //   governance: form.tokenAccount.governance,
      //   prerequisiteInstructions: prerequisiteInstructions,
      //   shouldSplitIntoSeparateTxs: true,
      //   signers,
      // };
      return { itx: tx, signers: [strmMetadata], prerequisiteInstructions };
    },
  });
  const strmProgram = new PublicKey(STREAMFLOW_PROGRAM_ID);

  const programId: PublicKey | undefined = strmProgram;
  const [releaseUnitIdx, setReleaseUnitIdx] = useState<number>(0);
  const [startOnApproval, setStartOnApproval] = useState<boolean>(true);
  // Governance underlying accounts that can be selected as source
  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountPubkey,
  );
  const setRecipient = (event) => {
    const value = event.target.value;
    handleSetForm({
      value: value,
      propertyName: 'recipient',
    });
  };

  const setStart = (event) => {
    const value = event.target.value;
    handleSetForm({
      value: value,
      propertyName: 'start',
    });
  };

  const setDepositedAmount = (event) => {
    const value = event.target.value;
    handleSetForm({
      value: value,
      propertyName: 'depositedAmount',
    });
  };

  const setCancelable = (value) => {
    handleSetForm({
      value,
      propertyName: 'cancelable',
    });
  };

  const setReleaseAmount = (event) => {
    const value = event.target.value;
    handleSetForm({
      value: value,
      propertyName: 'releaseAmount',
    });
  };

  const setAmountAtCliff = (event) => {
    const value = event.target.value;
    handleSetForm({
      value: value,
      propertyName: 'amountAtCliff',
    });
  };

  return (
    <>
      {ownedTokenAccountsInfo && (
        <TokenAccountSelect
          label="Source Account"
          value={form.tokenAccount?.pubkey.toBase58()}
          onChange={(value) =>
            handleSetForm({
              value: ownedTokenAccountsInfo[value],
              propertyName: 'tokenAccount',
            })
          }
          error={formErrors['tokenAccount']}
          ownedTokenAccountsInfo={ownedTokenAccountsInfo}
        />
      )}
      <Input
        label="Recipient address"
        value={form.recipient}
        error={formErrors['recipient']}
        type="string"
        onChange={setRecipient}
      />
      <StyledLabel>Start stream on approval?</StyledLabel>
      <Switch checked={startOnApproval} onChange={setStartOnApproval}></Switch>
      {!startOnApproval && (
        <Input
          label="Start date"
          value={form.start}
          error={formErrors['start']}
          type="datetime-local"
          onChange={setStart}
        />
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          maxWidth: '512px',
          alignItems: 'end',
        }}
      >
        <div style={{ width: '45%' }}>
          <Input
            label="Total amount"
            value={form.depositedAmount}
            error={formErrors['amount']}
            type="number"
            onChange={setDepositedAmount}
          />
        </div>
        <div style={{ width: '45%' }}>
          <Input
            label="Released at start"
            value={form.amountAtCliff}
            error={formErrors['amountAtCliff']}
            type="number"
            onChange={setAmountAtCliff}
          />
        </div>
      </div>
      <Input
        label="Amount per release"
        value={form.releaseAmount}
        error={formErrors['releaseAmount']}
        type="number"
        onChange={setReleaseAmount}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          maxWidth: '512px',
          alignItems: 'end',
        }}
      >
        <div style={{ width: '45%' }}>
          <Select
            label={'Release unit'}
            onChange={(unitIdx) => {
              setReleaseUnitIdx(unitIdx);
            }}
            placeholder="Please select..."
            value={releaseFrequencyUnits[releaseUnitIdx].display}
          >
            {Object.values(releaseFrequencyUnits).map((unit) => {
              return (
                <Select.Option key={unit.idx} value={unit.idx}>
                  {unit.display}
                </Select.Option>
              );
            })}
          </Select>
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      ></div>
      <StyledLabel>Can contract be cancelled?</StyledLabel>
      <Switch checked={form.cancelable} onChange={setCancelable}></Switch>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Vesting contracts have Automatic Withdrawal enabled which is funded by
        contract creator. That adds additional transaction fees on creation
        (5000 lamports per release cycle). Additionally, Streamflow by default
        charges a service fee of 0.25% in tokens being vested.
      </div>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(164, 172, 183, 1)',
          marginTop: '18px',
        }}
      >
        Please ensure that the SOL treasury account holds enough SOL to cover
        the transaction costs at the time of execution.
      </div>
    </>
  );
};

export default CreateStream;
