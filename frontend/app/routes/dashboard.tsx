import { SidebarProvider, useSidebar } from "~/context/SidebarContext";
import { cn } from "~/utils";
import { Outlet, redirect } from "react-router";
import Header from "~/components/layout/Header";
import Sidebar from "~/components/layout/Sidebar";
import Backdrop from "~/components/layout/Backdrop";
import { getCurrentUser } from "~/services/localStorage/users";
import { useState } from "react";
import AIChatbot from "~/components/layout/AIChatbot";
import Alert from "~/components/ui/Alert";
import { getUserConfirmationStatus } from "~/services/api/users";

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
  const [botOpen, setBotOpen] = useState<boolean>(false);
  const [logoutError, setLogoutError] = useState<boolean | null>(null);

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
        <main className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
          {logoutError === false && (
            <Alert
              variant="error"
              title="An error occurred"
              message="Please try again later."
            />
          )}
          {logoutError === true && (
            <Alert
              variant="success"
              title="Logged out successfully"
              message="You will be redirected to sign in page."
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
