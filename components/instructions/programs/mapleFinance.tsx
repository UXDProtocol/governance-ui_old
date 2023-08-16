import { nu64, struct, u8 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { MapleFinance } from '@tools/sdk/mapleFinance/configuration';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';

export const MAPLE_FINANCE_PROGRAM_INSTRUCTIONS = {
  [MapleFinance.SyrupProgramId.toBase58()]: {
    [MapleFinance.syrupProgramInstructions.lenderDeposit]: {
      name: 'Maple Finance - Lender Deposit',
      accounts: [
        'Lender',
        'Lender User',
        'Pool',
        'Globals',
        'Pool Locker',
        'Shares Mint',
        'Locked Shares',
        'Lender Shares',
        'Lender Locker',
        'System Program',
        'Token Program',
        'Rent',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const poolMint = accounts[2].pubkey;

        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          nu64('depositAmount'),
        ]);

        const { depositAmount } = dataLayout.decode(Buffer.from(data)) as any;

        const poolInfo = MapleFinance.getPoolInfoByPoolMint(poolMint);

        if (!poolInfo) throw new Error('Cannot load pool info');

        const uiAmount = nativeAmountToFormattedUiAmount(
          depositAmount,
          poolInfo.baseMint.decimals,
        );

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Ui amount to deposit:</span>
              <span>{uiAmount}</span>
            </div>
          </div>
        );
      },
    },

    [MapleFinance.syrupProgramInstructions.lenderUnlockDeposit]: {
      name: 'Maple Finance - Lender Unlock Deposit',
      accounts: [
        'Lender',
        'Lender User',
        'Pool',
        'Globals',
        'Locked Shares',
        'Lender Shares',
        'Token Program',
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return <></>;
      },
    },

    [MapleFinance.syrupProgramInstructions.withdrawalRequestInitialize]: {
      name: 'Maple Finance - Withdrawal Request Initialize',
      accounts: [
        'Lender',
        'Lender Owner',
        'Pool',
        'Globals',
        'Shares Mint',
        'Lender Share Account',
        'Withdrawal Request',
        'Withdrawal Request Locker',
        'System Program',
        'Token Program',
        'Rent',
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return <></>;
      },
    },

    [MapleFinance.syrupProgramInstructions.withdrawalRequestExecute]: {
      name: 'Maple Finance - Withdrawal Request Execute',
      accounts: [
        'Withdrawal Request',
        'Lender Owner',
        'Lender',
        'Pool',
        'Globals',
        'Base Mint',
        'Pool Locker',
        'Shares Mint',
        'Withdrawal Request Locker',
        'Lender Locker',
        'System Program',
        'Token Program',
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        return <></>;
      },
    },
  },
};
