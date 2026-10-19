import { useState } from "react";
import { Outlet, redirect, useNavigation } from "react-router";
import { useTranslation } from "react-i18next";
import { SidebarProvider, useSidebar } from "~/context/SidebarContext";
import { cn } from "~/utils";
import { getCurrentUser } from "~/services/localStorage/users";
import { getUserConfirmationStatus } from "~/services/api/users";
import Header from "~/components/layout/Header";
import Sidebar from "~/components/layout/Sidebar";
import Backdrop from "~/components/layout/Backdrop";
import AIChatbot from "~/components/layout/AIChatbot";
import Alert from "~/components/ui/Alert";
import Loading from "~/components/ui/Loading";
import { SparklesIcon } from "~/assets/icons";

export async function clientLoader() {
  const currentUserId = getCurrentUser();

  if (!currentUserId) {
    throw redirect("/");
  }

  const isConfirmed = await getUserConfirmationStatus(Number(currentUserId));

  if (!isConfirmed) {
    throw redirect("/notConfirmed");
  }

  return null;
}

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const [botOpen, setBotOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<boolean | null>(null);

  const isRTL = i18n.dir() === "rtl";

  if (navigation.state === "loading") {
    return <Loading />;
  }

  return (
    <div className="min-h-screen xl:flex">
      <Sidebar onButtonClick={() => setBotOpen(true)} />

      <Backdrop />

      <div
        className={cn(
          "flex-1 transition-[margin] duration-300 ease-in-out",
          isExpanded || isHovered ? "xl:ms-72.5" : "xl:ms-22.5",
          isMobileOpen ? "ms-0" : "",
        )}
      >
        <Header onLogout={(result: boolean) => setLogoutError(result)} />

        <main className="mx-auto max-w-(--breakpoint-2xl) bg-white p-4 md:p-6 dark:bg-gray-900">
          {logoutError === false && (
            <Alert
              variant="error"
              title={t("common.error")}
              message={t("common.errorDescription")}
            />
          )}

          {logoutError === true && (
            <Alert
              variant="success"
              title={t("common.logoutSuccessTitle")}
              message={t("common.logoutSuccessMessage")}
            />
          )}

          <Outlet />
        </main>
      </div>

      {/* Floating AI Chat Button */}
      {!botOpen && (
        <button
          type="button"
          onClick={() => setBotOpen(true)}
          aria-label="Open AI chat"
          title="Open AI chat"
          className={cn(
            "fixed bottom-6 z-50 flex h-14 w-14 items-center justify-center",
            "rounded-full bg-brand-500 text-white shadow-lg",
            "transition-all duration-200",
            "hover:scale-110 hover:bg-brand-600 hover:shadow-xl",
            "focus:outline-none focus:ring-4 focus:ring-brand-500/30",
            "active:scale-95",
            isRTL ? "left-6" : "right-6",
          )}
        >
          <SparklesIcon className="h-6 w-6" />
        </button>
      )}

      {/* AI Chat Window */}
      {botOpen && <AIChatbot onClose={() => setBotOpen(false)} />}
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
