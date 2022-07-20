import useRouterHistoryStore from 'stores/useRouterHistoryStore';
import useQueryContext from './useQueryContext';

//nextjs don't provide route history out of the box.
//we store only 4 last routes
export default function useRouterHistory() {
  const { fmtUrlWithCluster } = useQueryContext();
  const history = useRouterHistoryStore((s) => s.history);

  const getLastRoute = () => {
    if (!history.length) {
      return history[history.length - 1];
    }

    //if user came here and dont have any dao symbol we will redirect to /realms page as home
    return fmtUrlWithCluster('/realms');
  };

  return {
    history,
    getLastRoute,
  };
}
