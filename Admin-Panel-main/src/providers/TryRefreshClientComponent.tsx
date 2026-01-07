'use client';

import {useEffect, useState} from 'react';
import {useRouter, redirect} from 'next/navigation';
import Session from 'supertokens-web-js/recipe/session';

export const TryRefreshComponent = () => {
  const router = useRouter();
  const [didError, setDidError] = useState(false);

  useEffect(() => {
    void Session.attemptRefreshingSession()
      .then(hasSession => {
        if (hasSession) {
          router.refresh();
        } else {
          redirect('/login');
        }
      })
      .catch(() => {
        setDidError(true);
      });
  }, [router]);

  if (didError) {
    return <div>Something went wrong, please reload the page</div>;
  }

  return <div>Loading...</div>;
};
