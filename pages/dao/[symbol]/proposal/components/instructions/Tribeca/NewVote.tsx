import * as yup from 'yup';
import Input from '@components/inputs/Input';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getTribecaPrograms } from '@tools/sdk/tribeca/configurations';
import { newVoteInstruction } from '@tools/sdk/tribeca/instructions/newVoteInstruction';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { TribecaNewVoteForm } from '@utils/uiTypes/proposalCreationTypes';
import GovernorSelect from './GovernorSelect';
import { PublicKey } from '@solana/web3.js';

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
});

const NewVote = ({
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
  } = useInstructionFormBuilder<TribecaNewVoteForm>({
    index,
    initialFormValues: {
      governedAccount,
      tribecaConfiguration: null,
      proposal: '',
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

      return newVoteInstruction({
        tribecaConfiguration: form.tribecaConfiguration!,
        programs,
        proposal,
        voter: governedAccountPubkey,
        payer: wallet.publicKey,
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
    </>
  );
};

export default NewVote;
