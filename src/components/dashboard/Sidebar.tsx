import React from "react";

export type ActiveTab =
  | "dashboard"
  | "applications"
  | "tracker"
  | "calendar"
  | "companies";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  applicationCount: number;
  companyCount?: number;
  calendarCount?: number;
  userEmail?: string;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  applicationCount,
  companyCount = 0,
  calendarCount = 0,
  userEmail,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      id: "dashboard" as ActiveTab,
      label: "Dashboard",
      icon: "grid_view",
      testId: "tab-dashboard",
    },
    {
      id: "applications" as ActiveTab,
      label: "Applications",
      icon: "business_center",
      testId: "tab-applications",
      count: applicationCount,
    },
    {
      id: "tracker" as ActiveTab,
      label: "Tracker",
      icon: "view_kanban",
      testId: "tab-tracker",
      badgeText: "Kanban",
    },
    {
      id: "calendar" as ActiveTab,
      label: "Calendar",
      icon: "calendar_today",
      testId: "tab-calendar",
      count: calendarCount > 0 ? calendarCount : undefined,
    },
    {
      id: "companies" as ActiveTab,
      label: "Target Hub",
      icon: "radar",
      testId: "tab-companies",
      count: companyCount > 0 ? companyCount : undefined,
    },
  ];

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Backdrop para móviles */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Contenedor Principal del Sidebar (Colapsable en desktop) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between transition-[width] duration-200 ease-out select-none ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          isOpenMobile
            ? "w-64 translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Cabecera del Sidebar con Logo & Toggle Button */}
        <div className={`border-b border-outline-variant/20 transition-all ${isCollapsed ? "p-3" : "p-4 sm:p-4.5"}`}>
          <div
            className={`flex items-center ${
              isCollapsed ? "flex-col gap-2.5 justify-center" : "justify-between"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 min-w-0"}`}>
              {/* Emblema JT con glow */}
              <div
                className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shadow-[0_0_16px_rgba(129,140,248,0.35)] shrink-0"
                title="Job Tracker Command Center"
              >
                JT
              </div>

              <div
                className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-all duration-200 ${
                  isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[160px] opacity-100"
                }`}
              >
                <span className="text-sm font-bold text-on-surface tracking-tight leading-tight block truncate">
                  Job Tracker
                </span>
                <div className="flex items-center mt-0.5">
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-primary font-mono text-[9px] font-semibold tracking-wider uppercase">
                    COMMAND CENTER
                  </span>
                </div>
              </div>
            </div>

            {/* Botón colapsar en desktop */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                data-testid="toggle-sidebar-collapse-btn"
                className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {isCollapsed ? "menu" : "menu_open"}
                </span>
              </button>
            )}

            {/* Botón cerrar para móvil */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de Navegación Vertical */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          <div
            className={`px-3 overflow-hidden whitespace-nowrap transition-all duration-200 ${
              isCollapsed ? "max-h-0 opacity-0 pb-0 pointer-events-none" : "max-h-8 pb-2 opacity-100"
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-semibold">
              Workspace Views
            </span>
          </div>

          <nav role="tablist" aria-label="Main Navigation" className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  data-testid={item.testId}
                  onClick={() => handleSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "justify-between px-3.5 py-2.5"
                  } rounded-xl text-xs transition-all duration-150 cursor-pointer group relative ${
                    isActive
                      ? "bg-surface-container-high text-on-surface border border-outline-variant/70 shadow-[0_0_16px_rgba(129,140,248,0.12)] font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 border border-transparent font-medium"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 min-w-0"}`}>
                    <span
                      className={`material-symbols-outlined text-[20px] transition-colors shrink-0 ${
                        isActive
                          ? "text-primary-container"
                          : "text-outline group-hover:text-on-surface"
                      }`}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`truncate overflow-hidden whitespace-nowrap transition-all duration-200 ${
                        isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[120px] opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Badges o contadores */}
                  <div
                    className={`flex items-center gap-1.5 shrink-0 overflow-hidden whitespace-nowrap transition-all duration-200 ${
                      isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[80px] opacity-100"
                    }`}
                  >
                    {item.badgeText && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase bg-secondary/10 text-secondary border border-secondary/30">
                        {item.badgeText}
                      </span>
                    )}
                    {typeof item.count === "number" && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors border border-outline-variant/30 ${
                          isActive
                            ? "bg-primary-container/20 text-primary-container"
                            : "bg-surface-container text-outline"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>

                  {/* Indicador de badge compacto en modo colapsado */}
                  {isCollapsed && typeof item.count === "number" && item.count > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_rgba(129,140,248,0.6)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sección Inferior: Widget Motivacional + Usuario + Logout */}
        <div className="p-3 border-t border-outline-variant/20 space-y-3 bg-surface-container-lowest/50">
          {/* Card Motivacional */}
          <div
            className={`rounded-xl bg-surface-container-low border border-outline-variant/30 text-[11px] leading-relaxed relative overflow-hidden transition-all duration-200 ${
              isCollapsed ? "max-h-0 opacity-0 p-0 border-0 pointer-events-none m-0" : "max-h-40 p-3 opacity-100"
            }`}
          >
            <div className="flex items-start gap-2.5 whitespace-nowrap">
              <div className="w-7 h-7 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">
                  rocket_launch
                </span>
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="font-semibold text-on-surface text-xs leading-snug truncate">
                  Pipeline Telemetry
                </p>
                <p className="text-[11px] text-on-surface-variant/80 mt-0.5 truncate">
                  Stay organized, track feedback, and land your next role.
                </p>
              </div>
            </div>
          </div>

          {/* Perfil de Usuario y Logout */}
          <div
            className={`flex items-center rounded-xl bg-surface-container-low/70 border border-outline-variant/20 ${
              isCollapsed ? "flex-col gap-2 p-2 justify-center" : "justify-between p-2"
            }`}
          >
            <div
              className={`flex items-center min-w-0 ${
                isCollapsed ? "justify-center" : "gap-2.5 pr-2"
              }`}
              title={userEmail}
            >
              <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-semibold text-xs shrink-0">
                {userInitial}
              </div>
              <div
                className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 ${
                  isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[130px] opacity-100"
                }`}
              >
                <p className="text-xs font-semibold text-on-surface truncate">
                  {userEmail || "User"}
                </p>
                <p className="text-[10px] text-outline font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                  Signed in
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Log out of Job Tracker"
              className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/20 transition-all cursor-pointer shrink-0"
              aria-label="Log Out"
            >
              <span className="material-symbols-outlined text-[18px] block">
                logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
