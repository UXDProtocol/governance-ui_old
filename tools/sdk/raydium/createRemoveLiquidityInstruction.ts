import { BN } from '@project-serum/anchor'
import { Liquidity, LiquidityPoolKeys } from '@raydium-io/raydium-sdk'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'

export const createRemoveLiquidityInstruction = (
  owner: PublicKey,
  poolKeys: LiquidityPoolKeys,
  amountIn: string
): TransactionInstruction => {
  const [lpTokenAccount] = findATAAddrSync(owner, poolKeys.lpMint)
  const [baseTokenAccount] = findATAAddrSync(owner, poolKeys.baseMint)
  const [quoteTokenAccount] = findATAAddrSync(owner, poolKeys.quoteMint)

  const itx = Liquidity.makeRemoveLiquidityInstruction({
    poolKeys,
    userKeys: {
      baseTokenAccount,
      quoteTokenAccount,
      lpTokenAccount,
      owner,
    },
    amountIn: new BN(amountIn),
  })

  return itx
}
