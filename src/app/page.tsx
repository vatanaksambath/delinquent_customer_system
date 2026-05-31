"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import Sidebar, { type MenuId } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

// Feature screens
import AccountsScreen from "@/features/accounts/components/AccountsScreen";
import MonitoringScreen from "@/features/monitoring/components/MonitoringScreen";
import DashboardScreen from "@/features/dashboard/components/DashboardScreen";
import PortfolioReportScreen from "@/features/reports/components/PortfolioReportScreen";
import PTPTrackerScreen from "@/features/ptp-tracker/components/PTPTrackerScreen";
import TemplatesScreen from "@/features/templates/components/TemplatesScreen";
import PerformanceKPIsScreen from "@/features/reports/components/PerformanceKPIsScreen";
import WorkflowRulesScreen from "@/features/workflows/components/WorkflowRulesScreen";
import AccountDetailScreen from "@/features/accounts/components/AccountDetailScreen";
import ConfigurationScreen from "@/features/configuration/components/ConfigurationScreen";

import { useUIStore } from "@/store/uiStore";
import type { LedgerEntry } from "@/types";

export default function HomePage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuId>("dashboard");
  const [monitoringPreload, setMonitoringPreload] =
    useState<LedgerEntry | null>(null);
  const [selectedAccountForDetail, setSelectedAccountForDetail] =
    useState<LedgerEntry | null>(null);

  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const toggleSidebar = () => setIsSidebarExpanded((prev) => !prev);
  const sidebarWidth = isSidebarExpanded ? 240 : 80;

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={toggleSidebar}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
      />
      <main
        className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 relative"
        style={{
          marginLeft: sidebarWidth + "px",
          width: "calc(100% - " + sidebarWidth + "px)",
        }}
      >
        <Header
          theme={theme}
          onThemeToggle={toggleTheme}
          sidebarWidth={sidebarWidth}
        />
        <div
          id="print-root"
          className="flex-1 flex flex-col pt-16 w-full overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {activeMenu === "dashboard" && <DashboardScreen />}
            {activeMenu === "account-detail" && (
              <AccountDetailScreen
                accountData={selectedAccountForDetail}
                onBack={() => setActiveMenu("monitoring")}
              />
            )}
            {activeMenu === "ptp" && <PTPTrackerScreen />}
            {activeMenu === "templates" && <TemplatesScreen />}
            {activeMenu === "performance-kpis" && <PerformanceKPIsScreen />}
            {activeMenu === "workflow-rules" && <WorkflowRulesScreen />}
            {activeMenu === "config" && <ConfigurationScreen />}
            {activeMenu === "monitoring" && (
              <MonitoringScreen
                preloadData={monitoringPreload}
                onPreloadProcessed={() => setMonitoringPreload(null)}
                onAccountSelect={(data: LedgerEntry) => {
                  setSelectedAccountForDetail(data);
                  setActiveMenu("account-detail");
                }}
              />
            )}
            {activeMenu === "accounts" && (
              <AccountsScreen
                onCallSiteVisit={(data: LedgerEntry) => {
                  setMonitoringPreload(data);
                  setActiveMenu("monitoring");
                }}
              />
            )}
            {activeMenu === "reports" && (
              <PortfolioReportScreen
                onCallSiteVisit={(data: LedgerEntry) => {
                  setMonitoringPreload(data);
                  setActiveMenu("monitoring");
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
