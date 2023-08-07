import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getTribecaPrograms } from '@tools/sdk/tribeca/configurations';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { TribecaCastVoteForm } from '@utils/uiTypes/proposalCreationTypes';
import GovernorSelect from './GovernorSelect';
import { PublicKey } from '@solana/web3.js';
import { castVoteInstruction } from '@tools/sdk/tribeca/instructions/castVoteInstruction';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  tribecaConfiguration: yup
    .object()
    .nullable()
    .required('Tribeca Configuration Governor is required'),
  proposal: yup.string().required('Proposal address is required'),
  side: yup.string().required('Side is required'),
});

const CastVote = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<TribecaCastVoteForm>({
    index,
    initialFormValues: {
      governedAccount,
      tribecaConfiguration: null,
      proposal: '',
      side: 'yes',
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({
      connection,
      wallet,
      form,
      governedAccountPubkey,
    }) {
      const programs = getTribecaPrograms({
        connection,
        wallet,
        config: form.tribecaConfiguration!,
      });

      if (!wallet.publicKey) {
        throw new Error('Wallet is not connected');
      }

      if (!form.proposal) {
        throw new Error('Proposal is not set');
      }

      let proposal: PublicKey;
      try {
        proposal = new PublicKey(form.proposal!);
      } catch {
        throw new Error('Proposal is not a valid public key');
      }

      if (
        !form.side ||
        !['yes', 'no', 'abstain'].some((side) => side === form.side)
      ) {
        throw new Error('Side should be either "yes", "no" or "abstain"');
      }

      return castVoteInstruction({
        tribecaConfiguration: form.tribecaConfiguration!,
        programs,
        proposal,
        voter: governedAccountPubkey,
        side: form.side,
      });
    },
  });

  return (
    <>
      <GovernorSelect
        tribecaConfiguration={form.tribecaConfiguration}
        setTribecaConfiguration={(value) =>
          handleSetForm({ value, propertyName: 'tribecaConfiguration' })
        }
      />

      <Input
        label="Proposal Pubkey"
        value={form.proposal ?? ''}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'proposal',
          })
        }
        error={formErrors['proposal']}
      />

      <Input
        label="Side (yes/no/abstain)"
        value={form.side ?? ''}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'side',
          })
        }
        error={formErrors['side']}
      />
    </>
  );
};

export default CastVote;
