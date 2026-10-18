export type ActiveTab = "applications" | "calendar" | "companies";

type NavigationTabsProps = {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  applicationCount: number;
  companyCount?: number;
  calendarCount?: number;
};

export function NavigationTabs({
  activeTab,
  onTabChange,
  applicationCount,
  companyCount = 0,
  calendarCount = 0,
}: NavigationTabsProps) {
  const tabs: Array<{
    id: ActiveTab;
    label: string;
    mobileLabel: string;
    count: number;
    testId: string;
  }> = [
    {
      id: "applications",
      label: "Applications",
      mobileLabel: "Applications",
      count: applicationCount,
      testId: "tab-applications",
    },
    {
      id: "calendar",
      label: "Interview Calendar & Deadlines",
      mobileLabel: "Calendar",
      count: calendarCount,
      testId: "tab-calendar",
    },
    {
      id: "companies",
      label: "Target Companies (Wishlist)",
      mobileLabel: "Target Hub",
      count: companyCount,
      testId: "tab-companies",
    },
  ];

  return (
    <nav
      role="tablist"
      aria-label="Command Center Views"
      className="flex items-center gap-1.5 p-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 backdrop-blur-md overflow-x-auto no-scrollbar"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            data-testid={tab.testId}
            title={tab.label}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-surface-container-high text-on-surface border border-outline-variant/80 shadow-[0_0_16px_rgba(129,140,248,0.15)] font-semibold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-transparent font-medium"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.mobileLabel}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-semibold transition-colors border border-outline-variant/30 ${
                isActive
                  ? "bg-surface-variant text-on-surface"
                  : "bg-surface-variant text-on-surface-variant"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default NavigationTabs;

