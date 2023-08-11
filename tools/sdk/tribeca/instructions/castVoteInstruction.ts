import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration';

export async function castVoteInstruction({
  programs,
  proposal,
  voter,
  side,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms;
  proposal: PublicKey;
  voter: PublicKey;
  side: 'yes' | 'no' | 'abstain';
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const [vote] = await tribecaConfiguration.findVoteAddress(proposal, voter);
  const [escrow] = await tribecaConfiguration.findEscrowAddress(voter);

  const voteSide = {
    no: 1,
    yes: 2,
    abstain: 3,
  }[side];

  return programs.LockedVoter.instruction.castVote(voteSide, {
    accounts: {
      locker: tribecaConfiguration.locker,
      escrow,

      // Doesn't handle vote delegation yet
      voteDelegate: voter,
      proposal,
      vote,
      governor: ATribecaConfiguration.governor,
      governProgram: ATribecaConfiguration.governProgramId,
    },
  });
}
