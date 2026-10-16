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
      label: "Calendar",
      mobileLabel: "Calendar",
      count: calendarCount,
      testId: "tab-calendar",
    },
    {
      id: "companies",
      label: "Target Hub",
      mobileLabel: "Target Hub",
      count: companyCount,
      testId: "tab-companies",
    },
  ];

  return (
    <nav
      role="tablist"
      aria-label="Command Center Views"
      className="flex items-center gap-1.5 p-1 rounded-full bg-surface/80 border border-border/80 backdrop-blur-md overflow-x-auto no-scrollbar"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            data-testid={tab.testId}
            title={tab.id === "companies" ? "Target Companies & Search Hub" : tab.label}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-interview/20 text-text border border-interview/50 shadow-[0_0_12px_rgba(139,127,232,0.25)] font-semibold"
                : "text-muted hover:text-text hover:bg-surface/50 border border-transparent"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.mobileLabel}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                isActive
                  ? "bg-interview/30 text-interview"
                  : "bg-border/60 text-muted"
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
