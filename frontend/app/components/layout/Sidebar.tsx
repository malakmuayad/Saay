import { useSidebar } from "~/context/SidebarContext";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { GridIcon, TaskIcon, GoalIcon, HabitIcon } from "~/assets/icons";
import { cn } from "~/utils";
import SidebarWidget from "./SidebarWidget";
import { useTheme } from "~/context/ThemeContext";

type NavItem = {
  name: string;
  key?: string;
  icon: React.ReactNode;
  path?: string;
  new?: boolean;
  target?: string;
  subItems?: {
    name: string;
    key?: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    target?: string;
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon fontSize={24} />,
    name: "Dashboard",
    key: "dashboard",
    path: "/dashboard",
  },
  {
    icon: <GoalIcon fontSize={24} />,
    name: "Goals",
    key: "goals",
    path: "/dashboard/goals",
  },
  {
    icon: <HabitIcon fontSize={24} />,
    name: "Habits",
    key: "habits",
    path: "/dashboard/habits",
  },
  {
    icon: <TaskIcon fontSize={24} />,
    name: "Tasks",
    key: "tasks",
    path: "/dashboard/tasks",
  },
];

type SidebarProps = {
  onButtonClick: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onButtonClick }) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } =
    useSidebar();

  const { t } = useTranslation();
  const location = useLocation();
  const theme = useTheme().theme;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isSidebarExpanded = isExpanded || isHovered || isMobileOpen;

  // Auto-close sidebar on mobile after route change
  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Match exact routes and nested routes
  const isActive = (path: string) => {
    const currentPath = location.pathname.replace(/\/+$/, "") || "/";
    const targetPath = path.replace(/\/+$/, "") || "/";

    if (targetPath === "/dashboard") {
      return currentPath === targetPath;
    }

    return (
      currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
    );
  };

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;

      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }

      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main") => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => {
        const active = nav.path ? isActive(nav.path) : false;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`group menu-item ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "xl:justify-start"
                }`}
              >
                <span className="menu-item-icon-size">
                  <span
                    className={
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "text-[#465fff]"
                        : "text-[#64748b]"
                    }
                  >
                    {nav.icon}
                  </span>
                </span>

                {isSidebarExpanded && (
                  <span className="menu-item-text">
                    {nav.key ? t(`sidebar.items.${nav.key}`) : nav.name}
                  </span>
                )}

                {nav.new && isSidebarExpanded && (
                  <span
                    className={`absolute inset-e-10 ms-auto ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "menu-dropdown-badge-active"
                        : "menu-dropdown-badge-inactive"
                    } menu-dropdown-badge`}
                  >
                    {t("sidebar.badges.new")}
                  </span>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  target={nav.target}
                  className={`group menu-item ${
                    active ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span className="menu-item-icon-size">
                    <span
                      className={active ? "text-[#527bd2]" : "text-[#64748b]"}
                    >
                      {nav.icon}
                    </span>
                  </span>

                  {isSidebarExpanded && (
                    <span className="menu-item-text">
                      {nav.key ? t(`sidebar.items.${nav.key}`) : nav.name}
                    </span>
                  )}
                </Link>
              )
            )}

            {nav.subItems && isSidebarExpanded && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="ms-9 mt-2 space-y-1">
                  {nav.subItems.map((subItem) => {
                    const subActive = isActive(subItem.path);

                    return (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          target={subItem.target}
                          className={`menu-dropdown-item ${
                            subActive
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.key
                            ? t(`sidebar.items.${subItem.key}`)
                            : subItem.name}

                          <span className="ms-auto flex items-center gap-1">
                            {subItem.new && (
                              <span
                                className={`ms-auto ${
                                  subActive
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                {t("sidebar.badges.new")}
                              </span>
                            )}

                            {subItem.pro && (
                              <span
                                className={`ms-auto ${
                                  subActive
                                    ? "menu-dropdown-badge-pro-active"
                                    : "menu-dropdown-badge-pro-inactive"
                                } menu-dropdown-badge-pro`}
                              >
                                {t("sidebar.badges.pro")}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={cn(
        "fixed inset-s-0 top-0 z-50 flex h-screen flex-col border-e border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out xl:translate-x-0 xl:rtl:translate-x-0 dark:border-gray-800 dark:bg-gray-900",
        isExpanded || isMobileOpen ? "w-72.5" : isHovered ? "w-72.5" : "w-22.5",
        isMobileOpen
          ? "translate-x-0"
          : "-translate-x-full rtl:translate-x-full",
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex py-8",
          !isExpanded && !isHovered ? "xl:justify-center" : "justify-start",
        )}
      >
        <Link to="/">
          <img
            src={
              theme === "dark" ? "/assets/logo-dark.png" : "/assets/logo.png"
            }
            alt="Saay logo"
            width={isSidebarExpanded ? 170 : 32}
            height={isSidebarExpanded ? 40 : 32}
            loading="eager"
          />
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>{renderMenuItems(navItems, "main")}</div>

            <div>
              <h2
                className={`mb-4 flex text-xs leading-5 text-gray-400 uppercase ${
                  !isExpanded && !isHovered
                    ? "xl:justify-center"
                    : "justify-start"
                }`}
              />
            </div>
          </div>
        </nav>

        {isSidebarExpanded && <SidebarWidget onButtonClick={onButtonClick} />}
      </div>
    </aside>
  );
};

export default Sidebar;
