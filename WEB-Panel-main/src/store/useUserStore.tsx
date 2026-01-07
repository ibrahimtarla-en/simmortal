import { Nullable } from '@/types/util';
import { create } from 'zustand';
import { SimmortalsUser } from '@/types/user';
import { getUser } from '@/services/server/user';

const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  initialUserLoaded: false,
  setUser: (user: Nullable<SimmortalsUser>) => {
    set({ user });
  },
  setInitialUser: (user: Nullable<SimmortalsUser>) => {
    if (!get().initialUserLoaded) {
      set({ user, initialUserLoaded: true });
    }
  },
  refreshUser: async () => {
    const user = await getUser();
    set({ user });
  },
}));

interface UserStore {
  user: Nullable<SimmortalsUser>;
  initialUserLoaded: boolean;
  setUser: (user: Nullable<SimmortalsUser>) => void;
  setInitialUser: (user: Nullable<SimmortalsUser>) => void;
  refreshUser: () => Promise<void>;
}

export default useUserStore;
