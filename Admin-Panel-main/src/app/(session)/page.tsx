import Link from 'next/link';
import {
  CircleDollarSign,
  Flag,
  Flower,
  Mail,
  ShoppingCartIcon,
  Users,
} from 'lucide-react';
import { getOpenContactForms } from '@/services/server/contact';
import { getOpenMemorialFlags } from '@/services/server/flag';
import { getPublishedMemorials } from '@/services/server/memorial';
import { getOpenOrders } from '@/services/server/shop';
import { getUsers } from '@/services/server/user';

const fallbackCount = 0;

const statusCards = [
  {
    title: 'Users',
    description: 'Manage accounts, review memorials, and update statuses.',
    href: '/users',
    icon: Users,
    accent: 'text-emerald-300',
  },
  {
    title: 'Memorials',
    description: 'Review live memorials and keep featured content current.',
    href: '/memorials',
    icon: Flower,
    accent: 'text-rose-300',
  },
  {
    title: 'Forms',
    description: 'Respond to contact submissions that need attention.',
    href: '/contact',
    icon: Mail,
    accent: 'text-sky-300',
  },
  {
    title: 'Orders',
    description: 'Track open orders and confirm fulfillment progress.',
    href: '/orders',
    icon: ShoppingCartIcon,
    accent: 'text-amber-300',
  },
  {
    title: 'Reports',
    description: 'Resolve flagged memorials and monitor compliance.',
    href: '/reports',
    icon: Flag,
    accent: 'text-violet-300',
  },
  {
    title: 'Prices',
    description: 'Adjust memorial decoration and tribute pricing.',
    href: '/prices',
    icon: CircleDollarSign,
    accent: 'text-lime-300',
  },
];

export default async function Home() {
  const [usersResult, memorialsResult, formsResult, ordersResult, reportsResult] =
    await Promise.allSettled([
      getUsers(),
      getPublishedMemorials(),
      getOpenContactForms(),
      getOpenOrders(),
      getOpenMemorialFlags(),
    ]);

  const counts = {
    users: usersResult.status === 'fulfilled' ? usersResult.value.length : fallbackCount,
    memorials:
      memorialsResult.status === 'fulfilled' ? memorialsResult.value.length : fallbackCount,
    forms: formsResult.status === 'fulfilled' ? formsResult.value.length : fallbackCount,
    orders: ordersResult.status === 'fulfilled' ? ordersResult.value.length : fallbackCount,
    reports: reportsResult.status === 'fulfilled' ? reportsResult.value.length : fallbackCount,
  };

  return (
    <div className="py-10">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900 px-8 py-10">
        <p className="text-sm uppercase tracking-[0.4em] text-zinc-400">Admin dashboard</p>
        <h1 className="mt-4 font-serif text-4xl text-white">Control center for Simmortals</h1>
        <p className="mt-3 max-w-3xl text-base text-zinc-300">
          Keep the platform healthy with real-time insights on submissions, memorial activity, and
          commerce operations. Jump into any section to review details or take action.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 px-6 py-5">
            <p className="text-sm text-zinc-400">Total users</p>
            <p className="mt-2 text-3xl font-semibold text-white">{counts.users}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 px-6 py-5">
            <p className="text-sm text-zinc-400">Published memorials</p>
            <p className="mt-2 text-3xl font-semibold text-white">{counts.memorials}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 px-6 py-5">
            <p className="text-sm text-zinc-400">Open orders</p>
            <p className="mt-2 text-3xl font-semibold text-white">{counts.orders}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/60 px-6 py-5">
            <p className="text-sm text-zinc-400">Open reports</p>
            <p className="mt-2 text-3xl font-semibold text-white">{counts.reports}</p>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {statusCards.map((card) => {
          const Icon = card.icon;
          const badgeCount =
            card.title === 'Users'
              ? counts.users
              : card.title === 'Memorials'
                ? counts.memorials
                : card.title === 'Forms'
                  ? counts.forms
                  : card.title === 'Orders'
                    ? counts.orders
                    : card.title === 'Reports'
                      ? counts.reports
                      : null;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-zinc-950/60 p-6 transition hover:-translate-y-1 hover:border-white/30 hover:bg-zinc-900/70">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className={`h-6 w-6 ${card.accent}`} />
                  </span>
                  {badgeCount !== null && (
                    <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-zinc-300">
                      {badgeCount} open
                    </span>
                  )}
                </div>
                <h2 className="mt-6 text-xl font-semibold text-white">{card.title}</h2>
                <p className="mt-2 text-sm text-zinc-400">{card.description}</p>
              </div>
              <span className="mt-6 text-sm font-medium text-white/80 transition group-hover:text-white">
                View {card.title.toLowerCase()} →
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
