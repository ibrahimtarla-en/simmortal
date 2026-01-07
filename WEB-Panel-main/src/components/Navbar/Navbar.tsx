'use server';
import React from 'react';
import NavbarClient from './NavbarClient';
import { getUser } from '@/services/server/user';

async function Navbar() {
  const user = await getUser();

  return <NavbarClient initialUser={user} />;
}

export default Navbar;
