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
}) => {
  const navItems = [
    {
      id: "dashboard" as ActiveTab,
      label: "Dashboard",
      icon: "dashboard",
      testId: "tab-dashboard",
    },
    {
      id: "applications" as ActiveTab,
      label: "Applications",
      icon: "work",
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
      icon: "calendar_month",
      testId: "tab-calendar",
      count: calendarCount > 0 ? calendarCount : undefined,
    },
    {
      id: "companies" as ActiveTab,
      label: "Target Hub",
      icon: "business",
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

      {/* Contenedor Principal del Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Cabecera del Sidebar con Logo */}
        <div className="p-5 border-b border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/60 flex items-center justify-center shadow-[0_0_16px_rgba(129,140,248,0.25)] text-primary-container">
                <span className="material-symbols-outlined text-[22px]">
                  work_history
                </span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-on-surface tracking-tight leading-tight flex items-center gap-1.5">
                  Job Tracker
                </h1>
                <p className="text-[11px] font-mono text-primary font-semibold tracking-wider uppercase mt-0.5">
                  Command Center
                </p>
              </div>
            </div>

            {/* Botón cerrar para móvil */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                aria-label="Close sidebar"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de Navegación Vertical */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          <div className="px-3 pb-2">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? "bg-surface-container-high text-on-surface border border-outline-variant/70 shadow-[0_0_16px_rgba(129,140,248,0.12)] font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[19px] transition-colors ${
                        isActive
                          ? "text-primary-container"
                          : "text-outline group-hover:text-on-surface"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {/* Badges o contadores */}
                  <div className="flex items-center gap-1.5 shrink-0">
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
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sección Inferior: Widget Motivacional + Usuario + Logout */}
        <div className="p-3 border-t border-outline-variant/20 space-y-3 bg-surface-container-lowest/50">
          {/* Card Motivacional (Inspirado en el plant card de Stitch) */}
          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-[11px] leading-relaxed relative overflow-hidden">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">
                  rocket_launch
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-on-surface text-xs leading-snug">
                  Pipeline Telemetry
                </p>
                <p className="text-[11px] text-on-surface-variant/80 mt-0.5">
                  Stay organized, track feedback, and land your next role.
                </p>
              </div>
            </div>
          </div>

          {/* Perfil de Usuario y Logout */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low/70 border border-outline-variant/20">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-semibold text-xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p
                  title={userEmail}
                  className="text-xs font-semibold text-on-surface truncate"
                >
                  {userEmail || "User"}
                </p>
                <p className="text-[10px] text-outline font-mono">Signed in</p>
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
