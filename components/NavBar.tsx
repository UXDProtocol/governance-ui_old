import useQueryContext from '@hooks/useQueryContext';
import router from 'next/router';
import ConnectWalletButton from './ConnectWalletButton';

const NavBar = () => {
  const { fmtUrlWithCluster } = useQueryContext();

  const isDashboardPage = router.pathname.includes('dashboard');

  return (
    <div className="grid grid-cols-12 mb-3">
      <div className="col-span-12 xl:col-start-2 xl:col-span-10 flex h-20 items-center justify-between px-4 md:px-8 xl:px-4">
        <div className="flex items-center">
          <img src="/img/solana-logo.svg" className="h-8 mr-3" />
        </div>

        <div className="flex flex-wrap justify-center items-center">
          <button
            className={`"ml-4 mr-4 mt-1.5 mb-1.5 text-white pl-4 pt pr-4 pb ${
              isDashboardPage ? '' : 'border border-fgd-3'
            }"`}
            onClick={() => {
              router.push(fmtUrlWithCluster(`/`));
            }}
          >
            Vote
          </button>

          <button
            className={`"ml-4 mr-4 mt-1.5 mb-1.5 text-white pl-4 pt pr-4 pb ${
              isDashboardPage ? 'border border-fgd-3' : ''
            }"`}
            onClick={() => {
              router.push(fmtUrlWithCluster(`/dashboard`));
            }}
          >
            Dashboard
          </button>
        </div>

        <ConnectWalletButton />
      </div>
    </div>
  );
};

export default NavBar;
