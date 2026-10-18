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
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [botOpen, setBotOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<boolean | null>(null);

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

          {botOpen && <AIChatbot onClose={() => setBotOpen(false)} />}

          <Outlet />
        </main>
      </div>
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
