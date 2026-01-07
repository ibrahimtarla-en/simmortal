'use client';
import { Button } from '@/components/ui/button';
import { logout } from '@/services/server/auth/supertokens';
import { CircleDollarSign, Flag, Flower, LogOut, Mail, ShoppingCartIcon, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import Logo from '@/assets/brand/logo.svg';

function Navbar() {
  return (
    <nav className="sticky top-0 z-9999999 h-18 w-full bg-zinc-900">
      <div
        className={
          'relative z-9999999 container flex h-full w-full items-center justify-between bg-zinc-900 py-3.5'
        }>
        <div className="flex grow items-center justify-start gap-6">
          <Logo className="mr-10 h-6 w-40" />
          <Link className="text-md flex items-center justify-center gap-2" href="/users">
            <User className="h-4 w-4 text-white" />
            Users
          </Link>
          <Link className="text-md flex items-center justify-center gap-2" href="/memorials">
            <Flower className="h-4 w-4 text-white" />
            Memorials
          </Link>
          <Link className="text-md flex items-center justify-center gap-2" href="/contact">
            <Mail className="h-4 w-4 text-white" />
            Forms
          </Link>
          <Link className="text-md flex items-center justify-center gap-2" href="/orders">
            <ShoppingCartIcon className="h-4 w-4 text-white" />
            Orders
          </Link>
          <Link className="text-md flex items-center justify-center gap-2" href="/reports">
            <Flag className="h-4 w-4 text-white" />
            Reports
          </Link>
          <Link className="text-md flex items-center justify-center gap-2" href="/prices">
            <CircleDollarSign className="h-4 w-4 text-white" />
            Prices
          </Link>
        </div>
        <Button variant="outline" size="icon" className="cursor-pointer" onClick={logout}>
          <LogOut />
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;
