import { ThemeToggle } from "./ThemeToggle";

export default function Header({
  theme,
  onThemeToggle,
  sidebarWidth,
}: {
  theme: "light" | "dark" | "system";
  onThemeToggle: () => void;
  sidebarWidth: number;
}) {
  return (
    <header
      className="bg-background/90 backdrop-blur-xl fixed top-0 right-0 h-14 z-40 flex justify-between items-center px-8 border-b border-border transition-all duration-300"
      style={{ width: `calc(100% - ${sidebarWidth}px)` }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground  text-[14px]">
            search
          </span>
          <input
            className="bg-muted/80 border border-border  rounded-md px-8 py-1.5 text-[10px] uppercase tracking-wider text-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 outline-none w-64 transition-all placeholder:text-muted-foreground dark:placeholder-slate-500 shadow-sm"
            placeholder="Search SME Accounts..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-border pr-6">
          <ThemeToggle currentTheme={theme} onToggle={onThemeToggle} />
        </div>

        <div className="flex items-center gap-3">
          <IconButton icon="history" />
          <IconButton icon="notifications" badge />
          <IconButton icon="account_circle" />
        </div>
      </div>
    </header>
  );
}

function IconButton({
  icon,
  badge = false,
}: {
  icon: string;
  badge?: boolean;
}) {
  return (
    <button className="text-muted-foreground hover:text-blue-600   transition-all duration-300 cursor-pointer relative flex items-center p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground group">
      <span className="material-symbols-outlined text-[18px] transition-transform">
        {icon}
      </span>
      {badge && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600  rounded-full border border-white "></span>
      )}
    </button>
  );
}

