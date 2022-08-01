import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { OrcaConfiguration } from '@tools/sdk/orca/configuration';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import { struct, u8, nu64 } from 'buffer-layout';
import { u128 } from '@project-serum/borsh';

export const ORCA_PROGRAM_INSTRUCTIONS = {
  [OrcaConfiguration.WhirlpoolProgramId.toBase58()]: {
    [OrcaConfiguration.instructionsCode.WhirlpoolOpenPositionWithMetadata]: {
      name: 'Orca - Whirlpool Open Position with Metadata',
      accounts: [
        'Payer',
        'Authority',
        'Position',
        'Position Mint',
        'Position Metadata Account',
        'Position Token Account',
        'Whirlpool',
        'Token Program',
        'System Program',
        'Rent',
        'Associated Token Program',
        'Metadata Program',
        'Metadata Update Auth',
      ],
      getDataUI: async (
        _connection: Connection,
        _data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        // No useful data to display. Do not use null to avoid having the bytes displayed
        return <></>;
      },
    },

    [OrcaConfiguration.instructionsCode.WhirlpoolIncreaseLiquidity]: {
      name: 'Orca - Whirlpool Increase Liquidity',
      accounts: [
        'Whirlpool',
        'Token Program',
        'Position Authority',
        'Position',
        'Position Token Account',
        'Token Owner Account A',
        'Token Owner Account B',
        'Token Vault A',
        'Token Vault B',
        'Tick Array Lower',
        'Tick Array Upper',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u128('liquidityAmount'),
          nu64('tokenMaxA'),
          nu64('tokenMaxB'),
        ]);

        const { liquidityAmount, tokenMaxA, tokenMaxB } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        return (
          <>
            <p>{`Native Liquidity Amount: ${Number(
              liquidityAmount.toString(),
            ).toLocaleString()}`}</p>
            <p>{`Native Token Max A: ${tokenMaxA.toLocaleString()}`}</p>
            <p>{`Native Token Max B: ${tokenMaxB.toLocaleString()}`}</p>
          </>
        );
      },
    },
  },
};
