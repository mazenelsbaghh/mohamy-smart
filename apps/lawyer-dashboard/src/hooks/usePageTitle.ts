import { useEffect } from 'react';

/**
 * Sets document.title on mount and resets to default on unmount.
 * FIX 1.4: All pages must call this hook.
 * @param pageTitle - Page-specific title (Arabic)
 */
const usePageTitle = (pageTitle: string) => {
  const appName = 'محامي سمارت';
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${appName}` : appName;
    return () => {
      document.title = appName;
    };
  }, [pageTitle]);
};

export default usePageTitle;
