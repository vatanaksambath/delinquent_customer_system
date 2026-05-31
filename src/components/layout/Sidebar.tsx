import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";

export type MenuId =
  | "dashboard"
  | "worklist"
  | "customer-360"
  | "accounts"
  | "account-detail"
  | "ptp"
  | "monitoring"
  | "templates"
  | "reports"
  | "performance-kpis"
  | "audit-logs"
  | "workflow-rules"
  | "master-data"
  | "config"
  | "assignment";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  activeMenu: MenuId;
  onMenuChange: (id: MenuId) => void;
}

export default function Sidebar({
  isExpanded,
  onToggle,
  activeMenu,
  onMenuChange,
}: SidebarProps) {
  const [openGroups, setOpenGroups] = useState<string[]>([
    "workspace",
    "delinquent",
    "settings",
  ]);
  const [dateTime, setDateTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  };

  const formattedDate = mounted ? dateTime.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) : "";
  const formattedTime = mounted ? dateTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }) : "";

  return (
    <motion.nav
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
      className="h-full fixed left-0 top-0 overflow-visible bg-card  border-r border-border flex flex-col py-5 z-50 selection:bg-transparent"
    >
      {/* Floating Toggle Button on the edge */}
      <button
        onClick={onToggle}
        className="absolute top-7 -right-3 w-6 h-6 flex items-center justify-center rounded-full bg-card  border border-border  hover:border-blue-500/50 dark:hover:border-blue-400/50 text-muted-foreground hover:text-blue-600  cursor-pointer shadow-md z-[60] group"
      >
        <span
          className="material-symbols-outlined text-[14px] transition-transform duration-500"
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          chevron_left
        </span>
      </button>

      {/* Top Section: Branding */}
      <div className="px-4 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 min-w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.3)] relative overflow-hidden group">
          <span className="material-symbols-outlined text-primary-foreground text-base font-bold">
            account_balance
          </span>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="shrink-0"
            >
              <h1 className="text-lg font-bold tracking-tight text-foreground font-headline leading-none">
                MDCS
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-0.5 h-0.5 rounded-full bg-blue-600"></span>
                <p className="text-[7px] uppercase tracking-[0.2em] text-muted-foreground font-bold font-mono">
                  Monitoring
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 px-2 space-y-1.5">
        <NavItem
          icon="dashboard"
          label="Dashboard"
          active={activeMenu === "dashboard"}
          isExpanded={isExpanded}
          onClick={() => onMenuChange("dashboard")}
        />
        
        <NavItem
          icon="360"
          label="Customer 360"
          active={activeMenu === "customer-360"}
          isExpanded={isExpanded}
          onClick={() => onMenuChange("customer-360")}
        />
        
        <NavItem
          icon="transfer_within_a_station"
          label="Portfolio Reassignment"
          active={activeMenu === "assignment"}
          isExpanded={isExpanded}
          onClick={() => onMenuChange("assignment")}
        />

        {/* WORKSPACE group */}
        <MenuGroup
          icon="task_alt"
          label="Workspace"
          isExpanded={isExpanded}
          isOpen={openGroups.includes("workspace")}
          onToggle={() => toggleGroup("workspace")}
          accent
        >
          <SubNavItem
            icon="format_list_bulleted"
            label="My Worklist"
            active={activeMenu === "worklist"}
            onClick={() => onMenuChange("worklist")}
          />
        </MenuGroup>

        <MenuGroup
          icon="assignment_late"
          label="Delinquent"
          isExpanded={isExpanded}
          isOpen={openGroups.includes("delinquent")}
          onToggle={() => toggleGroup("delinquent")}
        >
          <SubNavItem
            icon="manage_accounts"
            label="PAR Accounts"
            active={activeMenu === "accounts"}
            onClick={() => onMenuChange("accounts")}
          />
          <SubNavItem
            icon="handshake"
            label="PTP Tracker"
            active={activeMenu === "ptp"}
            onClick={() => onMenuChange("ptp")}
          />
          <SubNavItem
            icon="receipt_long"
            label="Collection"
            active={activeMenu === "monitoring"}
            onClick={() => onMenuChange("monitoring")}
          />
        </MenuGroup>

        <MenuGroup
          icon="campaign"
          label="Engagement"
          isExpanded={isExpanded}
          isOpen={openGroups.includes("engagement")}
          onToggle={() => toggleGroup("engagement")}
        >
          <SubNavItem
            icon="drafts"
            label="Templates & Dunning"
            active={activeMenu === "templates"}
            onClick={() => onMenuChange("templates")}
          />
        </MenuGroup>

        <MenuGroup
          icon="analytics"
          label="Report"
          isExpanded={isExpanded}
          isOpen={openGroups.includes("reports")}
          onToggle={() => toggleGroup("reports")}
        >
          <SubNavItem
            icon="pie_chart"
            label="Portfolio Report"
            active={activeMenu === "reports"}
            onClick={() => onMenuChange("reports")}
          />
          <SubNavItem
            icon="trending_up"
            label="Performance KPIs"
            active={activeMenu === "performance-kpis"}
            onClick={() => onMenuChange("performance-kpis")}
          />
          <SubNavItem
            icon="policy"
            label="Audit & Compliance Logs"
            active={activeMenu === "audit-logs"}
            onClick={() => onMenuChange("audit-logs")}
          />
        </MenuGroup>

        <MenuGroup
          icon="settings"
          label="Setting"
          isExpanded={isExpanded}
          isOpen={openGroups.includes("settings")}
          onToggle={() => toggleGroup("settings")}
        >
          <SubNavItem
            icon="storage"
            label="Master Data"
            active={activeMenu === "master-data"}
            onClick={() => onMenuChange("master-data")}
          />
          <SubNavItem
            icon="tune"
            label="Configuration"
            active={activeMenu === "config"}
            onClick={() => onMenuChange("config")}
          />
          <SubNavItem
            icon="route"
            label="Bucket Rules"
            active={activeMenu === "workflow-rules"}
            onClick={() => onMenuChange("workflow-rules")}
          />
        </MenuGroup>
      </div>

      {/* Bottom Section: System DateTime */}
      <div className="px-3 mt-auto mb-3 border-t border-border pt-4">
        <div className="flex flex-col items-center justify-center bg-muted  rounded-lg p-2 border border-border  group hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-colors">
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-[10px] font-mono font-bold text-foreground leading-tight tracking-wider tabular-nums">
                {formattedTime}
              </p>
              <p className="text-[7px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">
                {formattedDate}
              </p>
            </motion.div>
          ) : (
            <div className="w-1 h-1 rounded-full bg-blue-600 " />
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavItem({
  icon,
  label,
  active,
  isExpanded,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2.5 rounded-xl group relative ${
        active
          ? "text-blue-600 "
          : "text-muted-foreground hover:text-blue-600  hover:bg-accent hover:text-accent-foreground"
      } ${!isExpanded ? "justify-center" : "gap-3"}`}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute left-[-2px] top-[20%] bottom-[20%] w-[3px] bg-blue-600  rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"
        />
      )}
      <span
        className={`material-symbols-outlined text-[20px] shrink-0 transition-all duration-300`}
      >
        {icon}
      </span>
      {isExpanded && (
        <span className="text-[10px] uppercase font-bold tracking-[0.12em] truncate shrink-0 transition-opacity">
          {label}
        </span>
      )}
    </button>
  );
}

function MenuGroup({
  icon,
  label,
  isExpanded,
  isOpen,
  onToggle,
  children,
  accent,
}: {
  icon: string;
  label: string;
  isExpanded: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accent?: boolean;
}) {
  const hasActiveChild = React.Children.toArray(children).some(
    (child: any) => child.props.active,
  );

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={`w-full flex items-center px-3 py-2.5 rounded-xl group relative ${
          accent
            ? "text-emerald-600 dark:text-emerald-400"
            : hasActiveChild && !isOpen && !isExpanded
              ? "text-blue-600 "
              : "text-muted-foreground hover:text-blue-600  hover:bg-accent hover:text-accent-foreground"
        } ${!isExpanded ? "justify-center" : "gap-3"}`}
      >
        {hasActiveChild && !isOpen && !isExpanded && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute left-[-2px] top-[20%] bottom-[20%] w-[3px] bg-blue-600  rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)]"
          />
        )}
        <span
          className={`material-symbols-outlined text-[20px] shrink-0 transition-all duration-300`}
        >
          {icon}
        </span>
        {isExpanded && (
          <div className="flex-1 flex justify-between items-center overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-[0.12em] truncate shrink-0">
              {label}
            </span>
            <span
              className={`material-symbols-outlined text-xs transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            >
              expand_more
            </span>
          </div>
        )}
      </button>
      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-9 space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 py-2.5 px-3 text-[9px] uppercase font-bold tracking-[0.16em] relative group transition-all duration-200 ${
        active
          ? "bg-card  border border-border  shadow-sm text-blue-600  rounded-xl"
          : "border border-transparent text-muted-foreground hover:text-blue-600  hover:bg-accent hover:text-accent-foreground rounded-lg"
      }`}
    >
      {active && (
        <div className="absolute left-[-1px] top-2 bottom-2 w-[3px] bg-blue-600  rounded-r-md" />
      )}
      <span className={`material-symbols-outlined text-[16px]`}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
