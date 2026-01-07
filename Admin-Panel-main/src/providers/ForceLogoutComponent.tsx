'use client';
import { logout } from '@/services/server/auth/supertokens';
import React, { useEffect } from 'react';

function ForceLogoutComponent() {
  useEffect(() => {
    logout();
  }, []);
  return <div></div>;
}

export default ForceLogoutComponent;
