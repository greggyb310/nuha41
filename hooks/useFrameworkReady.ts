import { useEffect, useState } from 'react';

export const useFrameworkReady = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return isReady;
};
