import { useEffect, useState } from 'react';
import useWalletStore from 'stores/useWalletStore';
import { AmmProgram, Pool } from '@mercurial-finance/dynamic-amm-sdk';
import { Provider, Wallet } from '@project-serum/anchor';

export default function useMercurialAmmProgram() {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);

  const [ammProgram, setAmmProgram] = useState<AmmProgram | null>(null);

  useEffect(() => {
    if (!connection || !wallet || !wallet.publicKey) {
      return;
    }

    setAmmProgram(
      Pool.createProgram(
        new Provider(
          connection.current,
          (wallet as unknown) as Wallet,
          Provider.defaultOptions(),
        ) as any,
      ),
    );
  }, [connection]);

  return ammProgram;
}
