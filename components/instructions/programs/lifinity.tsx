import { Connection } from '@solana/web3.js';
import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import {
  AMM_PROGRAM_ADDR,
  getPoolNameByPoolTokenMint,
  InstructionsCodes,
} from '@tools/sdk/lifinity/lifinity';
import { tryGetMint, tryGetTokenMint } from '@utils/tokens';
import BigNumber from 'bignumber.js';

export const LIFINITY_PROGRAM_INSTRUCTIONS = {
  [AMM_PROGRAM_ADDR.toBase58()]: {
    [InstructionsCodes.DepositAllTokenTypes]: {
      name: 'Lifinity - Deposit All Token Types',
      accounts: [
        'amm',
        'authority',
        'userTransferAuthority',
        'sourceAInfo',
        'sourceBInfo',
        'tokenA',
        'tokenB',
        'poolMint',
        'destination',
        'tokenProgram',
        'configAccount',
        'holderAccountInfo',
        'lifinityNftAccount',
        'lifinityNftMetaAccount',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          nu64('poolTokenAmount'),
          nu64('maximumTokenAAmount'),
          nu64('maximumTokenBAmount'),
        ]);

        const tokenAccountTokenA = accounts[5].pubkey;
        const tokenAccountTokenB = accounts[6].pubkey;
        const lpMint = accounts[7].pubkey;

        const [mintInfoTokenA, mintInfoTokenB, lpMintInfo] = await Promise.all([
          tryGetTokenMint(connection, tokenAccountTokenA),
          tryGetTokenMint(connection, tokenAccountTokenB),
          tryGetMint(connection, lpMint),
        ]);

        if (!mintInfoTokenA || !mintInfoTokenB || !lpMintInfo) {
          throw new Error('could not load token infos');
        }

        const {
          maximumTokenAAmount,
          maximumTokenBAmount,
          poolTokenAmount,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const uiAmountTokenA = new BigNumber(maximumTokenAAmount)
          .shiftedBy(-mintInfoTokenA.account.decimals)
          .toString();

        const uiAmountTokenB = new BigNumber(maximumTokenBAmount)
          .shiftedBy(-mintInfoTokenB.account.decimals)
          .toString();

        const uiAmountTokenLP = new BigNumber(poolTokenAmount)
          .shiftedBy(-lpMintInfo.account.decimals)
          .toString();

        const poolLabel = getPoolNameByPoolTokenMint(lpMint);

        return (
          <>
            <p>{`Liquidity Pool: ${poolLabel}`}</p>
            <p>{`Amount of Token A to deposit: ${uiAmountTokenA}`}</p>
            <p>{`Max Amount of Token B to deposit: ${uiAmountTokenB}`}</p>
            <p>{`LP Token to be minted: ${uiAmountTokenLP}`}</p>
          </>
        );
      },
    },
    [InstructionsCodes.WithdrawAllTokenTypes]: {
      name: 'Lifinity - Withdraw All Token Types',
      accounts: [
        'amm',
        'authority',
        'userTransferAuthority',
        'source',
        'tokenA',
        'tokenB',
        'poolMint',
        'destTokenAInfo',
        'destTokenBInfo',
        'feeAccount',
        'tokenProgram',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          nu64('poolTokenAmount'),
          nu64('minimumTokenAAmount'),
          nu64('minimumTokenBAmount'),
        ]);

        const tokenAccountTokenA = accounts[4].pubkey;
        const tokenAccountTokenB = accounts[5].pubkey;
        const lpMint = accounts[6].pubkey;

        const [mintInfoTokenA, mintInfoTokenB, lpMintInfo] = await Promise.all([
          tryGetTokenMint(connection, tokenAccountTokenA),
          tryGetTokenMint(connection, tokenAccountTokenB),
          tryGetMint(connection, lpMint),
        ]);

        if (!mintInfoTokenA || !mintInfoTokenB || !lpMintInfo) {
          throw new Error('could not load token infos');
        }

        const {
          minimumTokenAAmount,
          minimumTokenBAmount,
          poolTokenAmount,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const uiAmountTokenA = new BigNumber(minimumTokenAAmount)
          .shiftedBy(-mintInfoTokenA.account.decimals)
          .toString();

        const uiAmountTokenB = new BigNumber(minimumTokenBAmount)
          .shiftedBy(-mintInfoTokenB.account.decimals)
          .toString();

        const uiAmountTokenLP = new BigNumber(poolTokenAmount)
          .shiftedBy(-lpMintInfo.account.decimals)
          .toString();

        return (
          <>
            <p>{`Min Amount of Token A to withdraw: ${uiAmountTokenA}`}</p>
            <p>{`Min Amount of Token B to withdraw: ${uiAmountTokenB}`}</p>
            <p>{`LP Token to be redeemed: ${uiAmountTokenLP}`}</p>
          </>
        );
      },
    },
  },
};
