'use client';
import {redirect} from 'next/navigation';
import {useEffect} from 'react';
import {signInAndUp} from 'supertokens-web-js/recipe/thirdparty';

export default function Auth() {
  // if the user visits a page that is not handled by us (like /auth/random), then we redirect them back to the auth page.
  useEffect(() => {
    const handleRedirect = async () => {
      const response = await signInAndUp();
      if (response.status === 'OK') {
        redirect('/');
      } else {
        // if the user is not logged in, we redirect them to the login page.
        redirect('/login');
      }
    };
    handleRedirect();
  }, []);

  return null;
}
