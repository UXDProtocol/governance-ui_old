import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration';

export async function newVoteInstruction({
  programs,
  proposal,
  voter,
  payer,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms;
  proposal: PublicKey;
  voter: PublicKey;
  payer: PublicKey;
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const [vote, bump] = await tribecaConfiguration.findVoteAddress(
    proposal,
    voter,
  );

  return programs.Govern.instruction.newVote(bump, voter, {
    accounts: {
      proposal,
      vote,
      payer,
      systemProgram: SystemProgram.programId,
    },
  });
}
