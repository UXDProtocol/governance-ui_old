import { AccountMetaData } from '@solana/spl-governance';
import { Connection, Keypair } from '@solana/web3.js';
import { OrcaConfiguration } from '@tools/sdk/orca/configuration';
import { ANCHOR_DISCRIMINATOR_LAYOUT } from '@utils/helpers';
import { struct, u8, nu64 } from 'buffer-layout';
import { u128 } from '@project-serum/borsh';
import {
  buildWhirlpoolClient,
  WhirlpoolContext,
} from '@orca-so/whirlpools-sdk';

// target the same wallet as orca
import { Wallet } from '@project-serum/anchor/dist/cjs/provider';
import { nativeBNToUiAmount } from '@tools/sdk/units';
import { tryGetMint } from '@utils/tokens';
import { getSplTokenNameByMint } from '@utils/splTokens';

function buildLocalWhirlpoolClient(connection: Connection) {
  return buildWhirlpoolClient(
    WhirlpoolContext.from(
      connection,

      // No need for wallet for what we are doing with the client
      // Generate a new keypair to satisfy WhirlpoolContext.from()
      (Keypair.generate() as unknown) as Wallet,

      OrcaConfiguration.WhirlpoolProgramId,
    ),
  );
}

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
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
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

        const whirlpoolAddress = accounts[0].pubkey;
        const whirlpoolClient = buildLocalWhirlpoolClient(connection);
        const whirlpool = await whirlpoolClient.getPool(whirlpoolAddress);

        if (!whirlpool) {
          throw new Error(
            `Cannot load whirlpool ${whirlpoolAddress.toBase58()} data`,
          );
        }

        const { tokenMintA, tokenMintB } = whirlpool.getData();

        const [tokenAMintInfo, tokenBMintInfo] = await Promise.all([
          tryGetMint(connection, tokenMintA),
          tryGetMint(connection, tokenMintB),
        ]);

        if (!tokenAMintInfo || !tokenBMintInfo) {
          throw new Error(
            `Cannot load information about tokenA or tokenB mints`,
          );
        }

        const uiTokenMaxA = nativeBNToUiAmount(
          tokenMaxA,
          tokenAMintInfo.account.decimals,
        );
        const uiTokenMaxB = nativeBNToUiAmount(
          tokenMaxB,
          tokenBMintInfo.account.decimals,
        );

        const tokenAName = getSplTokenNameByMint(tokenAMintInfo.publicKey);
        const tokenBName = getSplTokenNameByMint(tokenBMintInfo.publicKey);

        return (
          <>
            <p>
              Whirlpool {tokenAName} - {tokenBName}
            </p>
            <p>{`Native Liquidity Amount: ${Number(
              liquidityAmount.toString(),
            ).toLocaleString()}`}</p>
            <p>{`Max ${tokenAName}: ${uiTokenMaxA.toLocaleString()}`}</p>
            <p>{`Max ${tokenBName}: ${uiTokenMaxB.toLocaleString()}`}</p>
          </>
        );
      },
    },

    [OrcaConfiguration.instructionsCode.WhirlpoolUpdateFeesAndRewards]: {
      name: 'Orca - Whirlpool Update Fees and Rewards',
      accounts: [
        'Whirlpool',
        'Position',
        'Tick Array Lower',
        'Tick Array Upper',
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

    [OrcaConfiguration.instructionsCode.WhirlpoolCollectFees]: {
      name: 'Orca - Whirlpool Collect Fees',
      accounts: [
        'Whirlpool',
        'Position Authority',
        'Position',
        'Position Token Account',
        'Token Owner Account A',
        'Token Vault A',
        'Token Owner Account B',
        'Token Vault B',
        'Token Program',
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

    [OrcaConfiguration.instructionsCode.WhirlpoolDecreaseLiquidity]: {
      name: 'Orca - Whirlpool Decrease Liquidity',
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
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          ...ANCHOR_DISCRIMINATOR_LAYOUT,
          u128('liquidityAmount'),
          nu64('tokenMinA'),
          nu64('tokenMinB'),
        ]);

        const { liquidityAmount, tokenMinA, tokenMinB } = dataLayout.decode(
          Buffer.from(data),
        ) as any;

        const whirlpoolAddress = accounts[0].pubkey;
        const whirlpoolClient = buildLocalWhirlpoolClient(connection);
        const whirlpool = await whirlpoolClient.getPool(whirlpoolAddress);

        if (!whirlpool) {
          throw new Error(
            `Cannot load whirlpool ${whirlpoolAddress.toBase58()} data`,
          );
        }

        const { tokenMintA, tokenMintB } = whirlpool.getData();

        const [tokenAMintInfo, tokenBMintInfo] = await Promise.all([
          tryGetMint(connection, tokenMintA),
          tryGetMint(connection, tokenMintB),
        ]);

        if (!tokenAMintInfo || !tokenBMintInfo) {
          throw new Error(
            `Cannot load information about tokenA or tokenB mints`,
          );
        }

        const uiTokenMinA = nativeBNToUiAmount(
          tokenMinA,
          tokenAMintInfo.account.decimals,
        );
        const uiTokenMinB = nativeBNToUiAmount(
          tokenMinB,
          tokenBMintInfo.account.decimals,
        );

        const tokenAName = getSplTokenNameByMint(tokenAMintInfo.publicKey);
        const tokenBName = getSplTokenNameByMint(tokenBMintInfo.publicKey);

        return (
          <>
            <p>
              Whirlpool {tokenAName} - {tokenBName}
            </p>
            <p>{`Native Liquidity Amount: ${Number(
              liquidityAmount.toString(),
            ).toLocaleString()}`}</p>
            <p>{`Min ${tokenAName}: ${uiTokenMinA.toLocaleString()}`}</p>
            <p>{`Min ${tokenBName}: ${uiTokenMinB.toLocaleString()}`}</p>
          </>
        );
      },
    },

    [OrcaConfiguration.instructionsCode.WhirlpoolClosePosition]: {
      name: 'Orca - Whirlpool Close Position',
      accounts: [
        'Position Authority',
        'Receiver',
        'Position',
        'Position Mint',
        'Position Token Account',
        'Token Program',
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
  },
};
