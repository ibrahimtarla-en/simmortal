'use client';
import { cn } from '@/utils/cn';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import NotificationIcon from '@/assets/icons/notification.svg';
import { getNotifications, markNotificationRead } from '@/services/server/notification';
import { UserNotification } from '@/types/notification';
import { formatRelativeTime } from '@/utils/date';
import { useMotionValueEvent, useScroll } from 'motion/react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

function NotificationMenu() {
  const router = useRouter();
  const t = useTranslations('Notification');
  const tCommon = useTranslations('Common');
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [initialFetchCompleted, setInitialFetchCompleted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentCursor = useRef<string | undefined | null>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);
  const { scrollYProgress } = useScroll({
    container: scrollRef,
  });

  const handleBlur = (event: React.FocusEvent) => {
    // Check if the new focus target is still within our component
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setNotificationsMenuOpen(false);
    }
  };

  const fetchNextPage = useCallback(async () => {
    if (currentCursor.current === null || isFetching.current) {
      return;
    }
    isFetching.current = true;
    try {
      const nextBatch = await getNotifications(currentCursor.current);
      if (!nextBatch) {
        currentCursor.current = null;
        return;
      }
      currentCursor.current = nextBatch?.cursor ?? null;
      setNotifications((prev) => Array.from(new Set([...prev, ...nextBatch.items])));
      setUnreadCount(nextBatch.unreadCount);
    } finally {
      isFetching.current = false;
      setInitialFetchCompleted(true);
    }
  }, []);

  const handleNotificationClick = useCallback(
    (notification: UserNotification) => {
      if (!notification.isRead) {
        markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
      }
      if (notification.redirectUrl) {
        router.push(notification.redirectUrl);
      }
      containerRef.current?.blur();
      setNotificationsMenuOpen(false);
    },
    [router],
  );

  useEffect(() => {
    if (currentCursor.current === undefined && isFetching.current === false) {
      fetchNextPage();
    }
  }, [fetchNextPage]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > 0.8 && !isFetching.current) {
      fetchNextPage();
    }
  });

  return (
    <div
      className={cn('relative')}
      ref={containerRef}
      onBlur={handleBlur}
      tabIndex={0}
      onFocus={() => setNotificationsMenuOpen(true)}
      onMouseEnter={() => setNotificationsMenuOpen(true)}
      onMouseLeave={() => setNotificationsMenuOpen(false)}>
      <div className="aspect-square h-11 p-2" tabIndex={-1}>
        {unreadCount > 0 && (
          <div className="bg-mauveine-300 text-2xs absolute top-1 left-5.5 flex h-4 min-w-4 items-center justify-center rounded-xl px-1 font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        <NotificationIcon />
      </div>

      <div
        className={cn(
          'absolute top-full -right-11 hidden w-100 max-w-85 -translate-y-2 pt-4',
          'md:right-0 md:max-w-120 md:translate-x-0',
          notificationsMenuOpen && 'block',
        )}>
        <div className="border-shine-1 w-full overflow-y-clip rounded-lg bg-zinc-900 p-1">
          <div
            ref={scrollRef}
            className="scrollbar-thin scrollbar-track-transparent scrollbar-corner-blue-500 scrollbar-thumb-mauveine-500 max-h-100 overflow-y-auto overscroll-none"
            onWheel={(e) => e.stopPropagation()}>
            {!initialFetchCompleted && (
              <div className="flex h-20 w-full items-center justify-center">
                <div className="border-mauveine-500 h-5 w-5 animate-spin rounded-full border-3 border-b-transparent" />
              </div>
            )}
            {initialFetchCompleted && notifications.length === 0 && (
              <div className="flex h-20 w-full items-center justify-center">
                <p className="text-sm font-light text-zinc-400">{t('noNotifications')}</p>
              </div>
            )}
            {notifications.length > 0 &&
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  isUnread={!notification.isRead}
                  message={t(notification.type, {
                    name: notification.actor.displayName ?? tCommon('someone'),
                  })}
                  timeInfo={formatRelativeTime(notification.createdAt)}
                  onClick={() => {
                    handleNotificationClick(notification);
                  }}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationMenu;

interface NotificationItemProps {
  isUnread?: boolean;
  message: string;
  timeInfo: string;
  onClick?: () => void;
}

function NotificationItem({ isUnread, message, timeInfo, onClick }: NotificationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center justify-between gap-2.5 px-4 py-4 hover:bg-zinc-700',
        isUnread && 'bg-zinc-800',
      )}>
      <p className="line-clamp-1 shrink-1 text-sm">{message}</p>
      <p className="text-2xs shrink-0 font-light">{timeInfo}</p>
    </button>
  );
}
