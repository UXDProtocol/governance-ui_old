import create, { State } from 'zustand';
import {
  getNativeTreasuryAddress,
  Governance,
  GovernanceAccountType,
  Realm,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import {
  DEFAULT_NATIVE_SOL_MINT,
  DEFAULT_NFT_TREASURY_MINT,
  HIDDEN_GOVERNANCES,
  WSOL_MINT,
} from '@components/instructions/tools';
import {
  AccountInfoGen,
  getMultipleAccountInfoChunked,
  GovernedTokenAccount,
  parseMintAccountData,
  parseTokenAccountData,
  TokenProgramAccount,
  tryGetMint,
} from '@utils/tokens';
import { Connection, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { AccountInfo, MintInfo, u64 } from '@solana/spl-token';
import { AccountInfo as AccountInfoGeneric } from '@solana/web3.js';
import { BN, TokenAccountLayout } from '@blockworks-foundation/mango-client';
import tokenService from '@utils/services/token';
import {
  AccountTypeGeneric,
  AssetAccount,
  AssetAccountTypeMint,
  AssetAccountTypeNFT,
  AssetAccountTypeProgram,
  AssetAccountTypeSol,
  AssetAccountTypeToken,
} from '@utils/uiTypes/assets';
import group from '@utils/group';
import axios from 'axios';
import { ConnectionContext } from '@utils/connection';
const tokenAccountOwnerOffset = 32;
interface TokenAccountExtension {
  mint?: TokenProgramAccount<MintInfo> | undefined;
  transferAddress?: PublicKey;
  amount?: u64;
  solAccount?: AccountInfoGen<Buffer | ParsedAccountData>;
  token?: TokenProgramAccount<AccountInfo>;
}

export interface Account {
  pubkey: PublicKey;
  type: AccountType;
  extensions: TokenAccountExtension;
  account?;
}
interface GovernedAccount extends ProgramAccount<Governance> {
  accounts: Account[];
}

interface SolAccInfo {
  governancePk: PublicKey;
  acc: any;
  nativeSolAddress: PublicKey;
}

export enum AccountType {
  TOKEN,
  SOL,
  MINT,
  PROGRAM,
  NFT,
}
interface GovernanceAssetsStore extends State {
  governancesArray: ProgramAccount<Governance>[];
  governedTokenAccounts: GovernedTokenAccount[];
  assetAccounts: AssetAccount[];
  governedAccounts: GovernedAccount[];
  loadGovernedAccounts: boolean;
  setGovernancesArray: (
    governances: {
      [governance: string]: ProgramAccount<Governance>;
    },
    connection: ConnectionContext,
    realm: ProgramAccount<Realm>,
  ) => void;
  getGovernedAccounts: (
    connection: ConnectionContext,
    realm: ProgramAccount<Realm>,
  ) => void;
  setGovernedTokenAccounts: (items: GovernedTokenAccount[]) => void;
  setGovernedAccounts: (
    connection: ConnectionContext,
    realm: ProgramAccount<Realm>,
  ) => void;
}

const defaultState = {
  governancesArray: [],
  governedAccounts: [],
  assetAccounts: [],
  governedTokenAccounts: [],
  loadGovernedAccounts: true,
};

const useGovernanceAssetsStore = create<GovernanceAssetsStore>((set, _get) => ({
  ...defaultState,
  setGovernancesArray: (governances, connection, realm) => {
    const array = Object.keys(governances)
      .filter((gpk) => !HIDDEN_GOVERNANCES.has(gpk))
      .map((key) => governances[key]);
    set((s) => {
      s.governancesArray = array;
    });
    _get().getGovernedAccounts(connection, realm);
  },
  getGovernedAccounts: async (connection, realm) => {
    const governancesArray = _get().governancesArray;
    const accounts = governancesArray.length
      ? await getAccountsForGovernances(connection, realm, governancesArray)
      : [];
    set((s) => {
      s.assetAccounts = accounts;
    });
  },
  setGovernedAccounts: async (connection, realm) => {
    const mintAddresses: string[] = [];
    const governancesArray = _get().governancesArray;
    const governedAccounts: GovernedAccount[] = governancesArray.map((x) => {
      return {
        ...x,
        accounts: [],
      };
    });
    // const accounts = governancesArray.length
    //   ? await getAccountsForGovernances(connection, realm, governancesArray)
    //   : [];

    const mintGovernances = getGovernancesByAccountTypes(governancesArray, [
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ]);
    const programGovernances = getGovernancesByAccountTypes(governancesArray, [
      GovernanceAccountType.ProgramGovernanceV1,
      GovernanceAccountType.ProgramGovernanceV2,
    ]);
    const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
      connection.current,
      mintGovernances.map((x) => x.account.governedAccount),
    );
    withMintAccounts(
      governedAccounts,
      mintGovernances,
      mintGovernancesMintInfo,
    );
    withProgramAccounts(programGovernances, governedAccounts);
    const tokenAccounts = (
      await Promise.all(
        governancesArray.map((x) =>
          getAccountsByOwner(
            connection.current,
            TOKEN_PROGRAM_ID,
            x.pubkey,
            TokenAccountLayout.span,
            tokenAccountOwnerOffset,
          ),
        ),
      )
    )
      .flatMap((x) => x)
      .map((x) => {
        const publicKey = x.pubkey;
        const data = Buffer.from(x.account.data);
        const account = parseTokenAccountData(publicKey, data);
        return { publicKey, account };
      });
    await withTokenAccounts(
      tokenAccounts,
      governedAccounts,
      realm,
      connection.current,
    );
    await tokenService.fetchTokenPrices(mintAddresses);
    set((s) => {
      s.governedAccounts = governedAccounts;
      s.loadGovernedAccounts = false;
    });
  },
  setGovernedTokenAccounts: (items) => {
    set((s) => {
      s.governedTokenAccounts = items;
    });
  },
  //TODO refresh governance, refresh account methods
}));
export default useGovernanceAssetsStore;

const getGenericAssetAccounts = (
  genericGovernances: ProgramAccount<Governance>[],
) => {
  const accounts: AccountTypeGeneric[] = [];
  genericGovernances.forEach((programGov) => {
    const account = new AccountTypeGeneric(programGov);
    if (account) {
      accounts.push(account);
    }
  });
  return accounts;
};

const getMintAccounts = (
  mintGovernances: ProgramAccount<Governance>[],
  mintGovernancesMintInfo: (AccountInfoGeneric<Buffer> | null)[],
) => {
  const accounts: AssetAccountTypeMint[] = [];
  mintGovernancesMintInfo.forEach((mintAccountInfo, index) => {
    const mintGovernnace = mintGovernances[index];
    if (!mintAccountInfo) {
      throw new Error(
        `Missing mintAccountInfo for: ${mintGovernnace?.pubkey.toBase58()}`,
      );
    }
    const data = Buffer.from(mintAccountInfo.data);
    const parsedMintInfo = parseMintAccountData(data) as MintInfo;
    const account = new AssetAccountTypeMint(mintGovernnace!, parsedMintInfo);
    if (account) {
      accounts.push(account);
    }
  });
  return accounts;
};

const getProgramAssetAccounts = (
  programGovernances: ProgramAccount<Governance>[],
) => {
  const accounts: AssetAccountTypeProgram[] = [];
  programGovernances.forEach((programGov) => {
    const account = new AssetAccountTypeProgram(programGov!);
    if (account) {
      accounts.push(account);
    }
  });
  return accounts;
};

const getMintAccountsInfo = async (
  connection: ConnectionContext,
  pubkeys: PublicKey[],
) => {
  const mintAccountsInfo = await axios.request({
    url: connection.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify([
      ...pubkeys.map((x) => {
        return {
          jsonrpc: '2.0',
          id: x.toBase58(),
          method: 'getAccountInfo',
          params: [
            x.toBase58(),
            {
              commitment: connection.current.commitment,
              encoding: 'base64',
            },
          ],
        };
      }),
    ]),
  });
  const mintAccountsJson = mintAccountsInfo.data;
  const mintAccountsParsed = mintAccountsJson?.map((x) => {
    const result = x.result;
    const publicKey = new PublicKey(x.id);
    const data = Buffer.from(result.value.data[0], 'base64');
    const account = parseMintAccountData(data);
    return { publicKey, account };
  });
  return mintAccountsParsed;
};

const getSolAccountsInfo = async (
  connection: ConnectionContext,
  pubkeys: { governancePk: PublicKey; nativeSolAddress: PublicKey }[],
) => {
  const solAccountsInfo = await axios.request({
    url: connection.endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify([
      ...pubkeys.map((x) => {
        return {
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [
            x.nativeSolAddress.toBase58(),
            {
              commitment: connection.current.commitment,
              encoding: 'jsonParsed',
            },
          ],
        };
      }),
    ]),
  });
  const solAccountsJson = solAccountsInfo.data;
  const solAccountsParsed = solAccountsJson?.length
    ? solAccountsJson
        .flatMap((x, index) => {
          return {
            acc: x.result.value,
            ...pubkeys[index],
          };
        })
        .filter((x) => x.acc)
    : [];
  return solAccountsParsed as SolAccInfo[];
};

const getTokenAccountObj = async (
  governance: ProgramAccount<Governance>,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  mintAccounts: TokenProgramAccount<MintInfo>[],
) => {
  const isNftAccount =
    tokenAccount.account.mint.toBase58() === DEFAULT_NFT_TREASURY_MINT;
  const mint = mintAccounts.find(
    (x) => x.publicKey.toBase58() === tokenAccount.account.mint.toBase58(),
  );
  if (isNftAccount) {
    return new AssetAccountTypeNFT(tokenAccount, mint!, governance);
  }

  if (
    mint?.account.supply &&
    mint?.account.supply.cmpn(1) !== 0 &&
    mint.publicKey.toBase58() !== DEFAULT_NATIVE_SOL_MINT
  ) {
    return new AssetAccountTypeToken(tokenAccount, mint!, governance);
  }
};

const getSolAccountObj = async (
  governance: ProgramAccount<Governance>,
  connection: ConnectionContext,
  mint: TokenProgramAccount<MintInfo>,
  accounts: AssetAccount[],
  solAcc: SolAccInfo,
) => {
  if (solAcc.acc) {
    const tokenAccountsOwnedBySolAccountInfo = await connection.current.getTokenAccountsByOwner(
      solAcc.nativeSolAddress,
      {
        programId: TOKEN_PROGRAM_ID,
      },
    );
    const tokenAccountsOwnedBySolAccounts = tokenAccountsOwnedBySolAccountInfo.value.map(
      (x) => {
        const publicKey = x.pubkey;
        const data = Buffer.from(x.account.data);
        const account = parseTokenAccountData(publicKey, data);
        return { publicKey, account };
      },
    );
    const groups = group(tokenAccountsOwnedBySolAccounts);
    const results = await Promise.all(
      groups.map((group) => {
        if (group.length) {
          return getMintAccountsInfo(
            connection,
            group.map((x) => x.account.mint),
          );
        } else {
          return [];
        }
      }),
    );

    const mintAccounts = results.flat();

    for (const acc of tokenAccountsOwnedBySolAccounts) {
      const account = await getTokenAccountObj(governance, acc, mintAccounts);
      if (account) {
        accounts.push(account);
      }
    }
    const minRentAmount = await connection.current.getMinimumBalanceForRentExemption(
      0,
    );
    const solAccount = solAcc.acc as AccountInfoGen<Buffer | ParsedAccountData>;
    solAccount.lamports =
      solAccount.lamports !== 0
        ? solAccount.lamports - minRentAmount
        : solAccount.lamports;

    return new AssetAccountTypeSol(
      mint!,
      solAcc.nativeSolAddress,
      solAccount,
      governance,
    );
  }
};

const getSolAccountsObj = async (
  connection: ConnectionContext,
  accounts: AssetAccount[],
  solAccountsInfo: SolAccInfo[],
  mintAccounts: TokenProgramAccount<MintInfo>[],
  governances: ProgramAccount<Governance>[],
) => {
  const solAccs: AssetAccountTypeSol[] = [];
  for (const i of solAccountsInfo) {
    const mint = mintAccounts.find((x) => x.publicKey.toBase58() === WSOL_MINT);
    const governance = governances.find(
      (x) => x.pubkey.toBase58() === i.governancePk.toBase58(),
    );
    const account = await getSolAccountObj(
      governance!,
      connection,
      mint!,
      accounts,
      i,
    );
    if (account) {
      solAccs.push(account);
    }
  }
  return solAccs as AssetAccount[];
};

const getTokenAssetAccounts = async (
  tokenAccounts: {
    publicKey: PublicKey;
    account: AccountInfo;
  }[],
  governances: ProgramAccount<Governance>[],
  realm: ProgramAccount<Realm>,
  connection: ConnectionContext,
) => {
  const accounts: AssetAccount[] = [];
  const mintsPks = [...tokenAccounts.map((x) => x.account.mint)];
  //WSOL is used as mint for sol accounts to calculate amounts
  if (!mintsPks.find((x) => x.toBase58() === WSOL_MINT)) {
    mintsPks.push(new PublicKey(WSOL_MINT));
  }
  const mintAccounts = mintsPks.length
    ? await getMintAccountsInfo(connection, [...mintsPks])
    : [];
  const nativeSolAddresses = await Promise.all(
    governances.map((x) => getNativeTreasuryAddress(realm.owner, x!.pubkey)),
  );
  const govNativeSolAddress = nativeSolAddresses.map((x, index) => {
    return {
      governanceAcc: governances[index],
      governancePk: governances[index].pubkey,
      nativeSolAddress: x,
    };
  });
  const solAccs = await getSolAccountsInfo(connection, govNativeSolAddress);

  for (const tokenAccount of tokenAccounts) {
    let governance = governances.find(
      (x) => x.pubkey.toBase58() === tokenAccount.account.owner.toBase58(),
    );
    const nativeSolAddress = nativeSolAddresses.find((x) =>
      x.equals(tokenAccount.account.owner),
    );

    if (!governance && nativeSolAddress) {
      governance = govNativeSolAddress.find((x) =>
        x.nativeSolAddress.equals(nativeSolAddress),
      )?.governanceAcc;
    }

    if (governance) {
      const account = await getTokenAccountObj(
        governance!,
        tokenAccount,
        mintAccounts,
      );
      if (account) {
        accounts.push(account);
      }
    }
    //! LET"S IGNORE AUXILIARY TOKEN ACCOUNTS THAT ARE SPECIFIC TO MANGO

    // else if (
    //   [...Object.values(AUXILIARY_TOKEN_ACCOUNTS).flatMap((x) => x)].find((x) =>
    //     x.accounts.includes(tokenAccount.publicKey.toBase58()),
    //   )
    // ) {
    //   const mint = mintAccounts.find(
    //     (x) => x.publicKey.toBase58() === tokenAccount.account.mint.toBase58(),
    //   );
    //   const account = new AccountTypeAuxiliaryToken(tokenAccount, mint);
    //   if (account) {
    //     accounts.push(account);
    //   }
    // }
  }
  const solAccounts = await getSolAccountsObj(
    connection,
    accounts,
    solAccs,
    mintAccounts,
    governances,
  );
  if (solAccounts.length) {
    accounts.push(...solAccounts);
  }

  return accounts;
};

const getAccountsForGovernances = async (
  connection: ConnectionContext,
  realm: ProgramAccount<Realm>,
  governancesArray: ProgramAccount<Governance>[],
) => {
  const mintGovernances = getGovernancesByAccountTypes(governancesArray, [
    GovernanceAccountType.MintGovernanceV1,
    GovernanceAccountType.MintGovernanceV2,
  ]);
  const programGovernances = getGovernancesByAccountTypes(governancesArray, [
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ]);

  const genericGovernances = getGenericAssetAccounts(governancesArray);

  const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
    connection.current,
    mintGovernances.map((x) => x.account.governedAccount),
  );
  const mintAccounts = getMintAccounts(
    mintGovernances,
    mintGovernancesMintInfo,
  );
  const programAccounts = getProgramAssetAccounts(programGovernances);
  // const auxiliaryTokenAccounts = []; //AUXILIARY_TOKEN_ACCOUNTS[realm.account.name]
  //   ?.length
  //   ? AUXILIARY_TOKEN_ACCOUNTS[realm.account.name]
  //   : [];

  const nativeAccountAddresses = await Promise.all(
    governancesArray.map((governance) =>
      getNativeTreasuryAddress(governance.owner, governance.pubkey),
    ),
  );

  const fetchTokenAccounts = (addresses: string[]) =>
    axios.request({
      url: connection.endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(
        addresses.map((address) => ({
          jsonrpc: '2.0',
          id: 1,
          method: 'getProgramAccounts',
          params: [
            TOKEN_PROGRAM_ID.toBase58(),
            {
              commitment: connection.current.commitment,
              encoding: 'base64',
              filters: [
                {
                  dataSize: TokenAccountLayout.span, // number of bytes
                },
                {
                  memcmp: {
                    offset: tokenAccountOwnerOffset, // number of bytes
                    bytes: address, // base58 encoded string
                  },
                },
              ],
            },
          ],
        })),
      ),
    });

  const ownedByGovernancesTokenAccounts = await Promise.all([
    fetchTokenAccounts(nativeAccountAddresses.map((a) => a.toBase58())),
    fetchTokenAccounts(governancesArray.map((g) => g.pubkey.toBase58())),
    //! LET"S IGNORE AUXILIARY TOKEN ACCOUNTS THAT ARE SPECIFIC TO MANGO
    // auxiliaryTokenAccounts?.length
    //   ? fetchTokenAccounts(auxiliaryTokenAccounts.map((x) => x.owner))
    //   : Promise.resolve({ data: [] }),
  ]).then(([x, y]) => x.data.concat(y.data));

  const tokenAccountsJson = ownedByGovernancesTokenAccounts.map((x) => {
    //! LET"S IGNORE AUXILIARY TOKEN ACCOUNTS THAT ARE SPECIFIC TO MANGO

    // const auxiliaryMatch = auxiliaryTokenAccounts.find(
    //   (auxAcc) => auxAcc.owner === x.id,
    // );
    // if (auxiliaryMatch) {
    //   x.result = x.result?.filter((x) =>
    //     auxiliaryMatch.accounts.includes(x.pubkey),
    //   );
    // }
    return x;
  });
  const tokenAccountsParsed = tokenAccountsJson.length
    ? [...tokenAccountsJson.flatMap((x) => x.result)].map((x) => {
        const publicKey = new PublicKey(x.pubkey);
        const data = Buffer.from(x.account.data[0], 'base64');
        const account = parseTokenAccountData(publicKey, data);
        return { publicKey, account };
      })
    : [];

  const groups = group(tokenAccountsParsed);
  const results = await Promise.all(
    groups.map((group) => {
      return getTokenAssetAccounts(group, governancesArray, realm, connection);
    }),
  );
  const allResults = results.flat();

  // remove potential duplicates
  const existing = new Set<string>();
  const deduped: AssetAccount[] = [];

  for (const account of allResults) {
    if (!existing.has(account.pubkey.toBase58())) {
      existing.add(account.pubkey.toBase58());
      deduped.push(account);
    }
  }

  const tokenAssetAccounts = deduped;

  const governedTokenAccounts = tokenAssetAccounts;
  await tokenService.fetchTokenPrices(
    governedTokenAccounts
      .filter((x) => x.extensions.mint?.publicKey)
      .map((x) => x.extensions.mint!.publicKey.toBase58()),
  );
  return [
    ...mintAccounts,
    ...programAccounts,
    ...governedTokenAccounts,
    ...genericGovernances,
  ];
};

const getAccountsByOwner = (
  connection: Connection,
  programId: PublicKey,
  owner: PublicKey,
  dataSize: number,
  offset: number,
) => {
  return connection.getProgramAccounts(
    programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      filters: [
        {
          dataSize: dataSize, // number of bytes
        },
        {
          memcmp: {
            offset: offset, // number of bytes
            bytes: owner.toBase58(), // base58 encoded string
          },
        },
      ],
    },
  );
};

const getTokenAccountsObj = async (
  realm: ProgramAccount<Realm>,
  governance: GovernedAccount,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  connection: Connection,
) => {
  const isSol =
    tokenAccount.account.mint.toBase58() === DEFAULT_NATIVE_SOL_MINT;
  const isNft =
    tokenAccount.account.mint.toBase58() === DEFAULT_NFT_TREASURY_MINT;
  const mint = await tryGetMint(connection, tokenAccount.account.mint);
  if (
    (mint?.account.supply && mint?.account.supply.cmp(new BN(1)) === 1) ||
    isNft ||
    isSol
  ) {
    if (isSol) {
      return await getSolAccount(
        realm,
        governance,
        connection,
        tokenAccount,
        mint!,
      );
    }
  }
  if (isNft) {
    return new AccountTypeNFT(tokenAccount, mint!);
  }
  return new AccountTypeToken(tokenAccount, mint!);
};

const withTokenAccounts = async (
  tokenAccounts: {
    publicKey: PublicKey;
    account: AccountInfo;
  }[],
  governedAccounts: GovernedAccount[],
  realm: ProgramAccount<Realm>,
  connection: Connection,
) => {
  for (const tokenAccount of tokenAccounts) {
    const governance = governedAccounts.find(
      (x) => x.pubkey.toBase58() === tokenAccount.account.owner.toBase58(),
    );
    const account = await getTokenAccountsObj(
      realm,
      governance!,
      tokenAccount,
      connection,
    );
    if (account) {
      governance?.accounts.push(account);
    }
  }
};

const withMintAccounts = (
  governedAccounts: GovernedAccount[],
  mintGovernances: ProgramAccount<Governance>[],
  mintGovernancesMintInfo: (AccountInfoGeneric<Buffer> | null)[],
) => {
  mintGovernancesMintInfo.forEach((mintAccountInfo, index) => {
    const mintGovernnace = mintGovernances[index];
    const governance = governedAccounts.find(
      (x) => x.pubkey.toBase58() === mintGovernnace.pubkey.toBase58(),
    );
    if (!mintAccountInfo) {
      throw new Error(
        `Missing mintAccountInfo for: ${governance?.pubkey.toBase58()}`,
      );
    }
    const data = Buffer.from(mintAccountInfo.data);
    const parsedMintInfo = parseMintAccountData(data) as MintInfo;
    const account = new AccountTypeMint(governance!, parsedMintInfo);
    if (account) {
      governance?.accounts.push(account);
    }
  });
};

const withProgramAccounts = (
  programGovernances: ProgramAccount<Governance>[],
  governedAccounts: GovernedAccount[],
) => {
  programGovernances.forEach((programGov) => {
    const governance = governedAccounts.find(
      (x) => x.pubkey.toBase58() === programGov.pubkey.toBase58(),
    );
    const account = new AccountTypeProgram(governance!);
    if (account) {
      governance?.accounts.push(account);
    }
  });
};

const getGovernancesByAccountTypes = (
  governancesArray: ProgramAccount<Governance>[],
  types: GovernanceAccountType[],
) => {
  const governancesFiltered = governancesArray.filter((gov) =>
    types.some((t) => gov.account?.accountType === t),
  );
  return governancesFiltered;
};

const getSolAccount = async (
  realm: ProgramAccount<Realm>,
  governance: GovernedAccount,
  connection: Connection,
  tokenAccount: TokenProgramAccount<AccountInfo>,
  mint: TokenProgramAccount<MintInfo>,
) => {
  const solAddress = await getNativeTreasuryAddress(
    realm.owner,
    governance!.pubkey,
  );
  const resp = await connection.getParsedAccountInfo(solAddress);
  if (resp.value) {
    const accountsOwnedBySolAccount = (
      await getAccountsByOwner(
        connection,
        TOKEN_PROGRAM_ID,
        solAddress,
        TokenAccountLayout.span,
        tokenAccountOwnerOffset,
      )
    ).map((x) => {
      const publicKey = x.pubkey;
      const data = Buffer.from(x.account.data);
      const account = parseTokenAccountData(publicKey, data);
      return { publicKey, account };
    });
    for (const acc of accountsOwnedBySolAccount) {
      const account = await getTokenAccountsObj(
        realm,
        governance,
        acc,
        connection,
      );
      if (account) {
        governance.accounts.push(account);
      }
    }
    const mintRentAmount = await connection.getMinimumBalanceForRentExemption(
      0,
    );
    const solAccount = resp.value as AccountInfoGen<Buffer | ParsedAccountData>;
    solAccount.lamports =
      solAccount.lamports !== 0
        ? solAccount.lamports - mintRentAmount
        : solAccount.lamports;

    return new AccountTypeSol(tokenAccount, mint!, solAddress, solAccount);
  }
};

class AccountTypeToken implements Account {
  type: AccountType;
  extensions: TokenAccountExtension;
  pubkey: PublicKey;
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>,
  ) {
    this.pubkey = tokenAccount.publicKey;
    this.type = AccountType.TOKEN;
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: tokenAccount!.publicKey!,
      amount: tokenAccount!.account.amount,
    };
  }
}

class AccountTypeProgram implements Account {
  type: AccountType;
  extensions: TokenAccountExtension;
  pubkey: PublicKey;
  constructor(governance: GovernedAccount) {
    this.pubkey = governance.account.governedAccount;
    this.type = AccountType.PROGRAM;
    this.extensions = {};
  }
}

class AccountTypeMint implements Account {
  type: AccountType;
  extensions: TokenAccountExtension;
  pubkey: PublicKey;
  constructor(governance: GovernedAccount, account: MintInfo) {
    this.pubkey = governance.account.governedAccount;
    this.type = AccountType.MINT;
    this.extensions = {
      mint: {
        publicKey: governance.account.governedAccount,
        account: account,
      },
    };
  }
}

class AccountTypeNFT implements Account {
  type: AccountType;
  extensions: TokenAccountExtension;
  pubkey: PublicKey;
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>,
  ) {
    this.pubkey = tokenAccount.publicKey;
    this.type = AccountType.NFT;
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: tokenAccount.account.owner,
      amount: tokenAccount.account.amount,
    };
  }
}

class AccountTypeSol implements Account {
  type: AccountType;
  extensions: TokenAccountExtension;
  pubkey: PublicKey;
  constructor(
    tokenAccount: TokenProgramAccount<AccountInfo>,
    mint: TokenProgramAccount<MintInfo>,
    solAddress: PublicKey,
    solAccount: AccountInfoGen<Buffer | ParsedAccountData>,
  ) {
    this.type = AccountType.SOL;
    this.pubkey = tokenAccount.publicKey;
    this.extensions = {
      token: tokenAccount,
      mint: mint,
      transferAddress: solAddress,
      amount: tokenAccount.account.amount,
      solAccount: solAccount,
    };
  }
}
