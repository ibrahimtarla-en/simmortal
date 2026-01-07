'use client';
import * as React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { cn } from '@/utils/cn';
import { useToast } from '@/hooks/useToast';
import Error from '@/assets/icons/error.svg';

function Toast() {
  const { state, dismiss } = useToast();

  return (
    <RadixToast.Provider swipeDirection="right">
      {state.map((toast) => (
        <RadixToast.Root
          key={toast.id}
          duration={4000}
          onOpenChange={(open) => {
            if (!open) {
              setTimeout(() => dismiss(toast.id), 1000); // Delay to allow animation to complete
            }
          }}
          className={cn(
            'border-shine-1 rounded-xl bg-zinc-900 px-6 py-4 font-sans',
            'data-[state=open]:animate-slide-in-from-right',
            'data-[state=closed]:animate-slide-out-to-right',
          )}>
          {toast.title && (
            <div className="flex gap-2.5">
              {toast.type === 'error' && <Error width={24} height={24} />}
              <RadixToast.Title className="mb-1 font-sans">{toast.title}</RadixToast.Title>
            </div>
          )}
          {toast.message && (
            <RadixToast.Description className={cn('text-xs font-light')}>
              {toast.message}
            </RadixToast.Description>
          )}
        </RadixToast.Root>
      ))}
      <RadixToast.Viewport className="fixed right-0 bottom-0 z-999999999 mr-10 mb-10 flex min-h-10 w-68 flex-col gap-2" />
    </RadixToast.Provider>
  );
}

export default Toast;
