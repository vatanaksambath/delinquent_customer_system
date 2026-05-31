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
      className="bg-background/95 backdrop-blur-xl fixed top-0 right-0 h-14 z-40 flex justify-between items-center px-6 border-b border-border/60 transition-all duration-300 shadow-sm"
      style={{ width: `calc(100% - ${sidebarWidth}px)` }}
    >
      <div className="flex items-center gap-4">
        {/* Search removed */}
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 border-r border-border/60 pr-5">
          <ThemeToggle currentTheme={theme} onToggle={onThemeToggle} />
        </div>

        <div className="flex items-center gap-1">
          <IconButton icon="history" label="History" />
          <IconButton icon="notifications" label="Notifications" badge />
          <div className="w-[1px] h-5 bg-border/60 mx-1" />
          <UserButton />
        </div>
      </div>
    </header>
  );
}

function IconButton({
  icon,
  label,
  badge = false,
}: {
  icon: string;
  label?: string;
  badge?: boolean;
}) {
  return (
    <button
      title={label}
      aria-label={label}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all duration-200 cursor-pointer group"
    >
      <span className="material-symbols-outlined text-[19px] transition-transform duration-200 group-hover:scale-105">
        {icon}
      </span>
      {badge && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-background shadow-sm animate-pulse" />
      )}
    </button>
  );
}

function UserButton() {
  return (
    <button
      title="Account"
      aria-label="Account"
      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer"
    >
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/80 to-blue-600 flex items-center justify-center shadow-sm">
        <span className="material-symbols-outlined text-[14px] text-white">person</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">Admin</span>
    </button>
  );
}

