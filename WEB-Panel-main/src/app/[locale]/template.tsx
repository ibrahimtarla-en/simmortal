import { Footer, Navbar } from '@/components';
import CookieBanner from '@/components/CookieBanner/CookieBanner';
import Toast from '@/components/Elements/Toast/Toast';
import LoadingModal from '@/components/Modals/LoadingModal/LoadingModal';
import NavbarBanner from '@/components/Navbar/Banner/NavbarBanner';
import { LoadingModalProvider } from '@/providers/LoadingModalProvider';
import { NavbarBannerProvider } from '@/providers/NavbarBannerProvider';
import SuperTokensRefreshProvider from '@/providers/SuperTokensRefreshProvider';
import { ToastProvider } from '@/providers/ToastProvider';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <LoadingModalProvider>
      <NavbarBannerProvider>
        <ToastProvider>
          <SuperTokensRefreshProvider>
            <Navbar />
            <NavbarBanner />
            <Toast />
            {children}
            <Footer />
            <CookieBanner />
            <LoadingModal />
          </SuperTokensRefreshProvider>
        </ToastProvider>
      </NavbarBannerProvider>
    </LoadingModalProvider>
  );
}
