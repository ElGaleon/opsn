import {
  Building2,
  FileText,
  LayoutDashboard,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { Section } from "@app/types/app";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@shared/components/ui/sidebar";

const nav = [
  ["dashboard", LayoutDashboard, "Dashboard"],
  ["properties", Building2, "Immobili"],
  ["owners", UserRound, "Proprietari"],
  ["contracts", FileText, "Contratti"],
  ["tenants", Users, "Inquilini"],
  ["movements", WalletCards, "Movimenti"],
] as const;

const sectionMeta: Record<Section, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Panoramica operativa e indicatori principali",
  },
  properties: {
    title: "Immobili",
    subtitle: "Patrimonio, unità, quote e valori",
  },
  owners: {
    title: "Proprietari",
    subtitle: "Anagrafiche, saldi e trasferimenti",
  },
  contracts: {
    title: "Contratti",
    subtitle: "Locazioni, canoni e scadenze contrattuali",
  },
  tenants: {
    title: "Inquilini",
    subtitle: "Anagrafiche, contratti e morosità",
  },
  movements: {
    title: "Movimenti",
    subtitle: "Registro unico con entrate, uscite e trasferimenti",
  },
};

function AppSidebar({
  section,
  onSectionChange,
}: {
  section: Section;
  onSectionChange: (section: Section) => void;
}) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="opsn-sidebar-label min-w-0 overflow-hidden">
          <h1 className="truncate text-2xl font-bold tracking-tight text-emerald-700">
            OPSN
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {nav.map(([key, Icon, label]) => (
            <SidebarMenuItem key={key}>
              <SidebarMenuButton
                isActive={section === key}
                title={label}
                onClick={() => onSectionChange(key)}
              >
                <Icon size={18} className="shrink-0" />
                <span className="opsn-sidebar-label overflow-hidden whitespace-nowrap">
                  {label}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppShell({
  section,
  onSectionChange,
  authControls,
  children,
}: {
  section: Section;
  onSectionChange: (section: Section) => void;
  authControls?: ReactNode;
  children: ReactNode;
}) {
  const meta = sectionMeta[section];

  return (
    <SidebarProvider>
      <AppSidebar section={section} onSectionChange={onSectionChange} />
      <SidebarInset>
        <header className="sticky top-0 z-30 border-b border-sidebar-border bg-[#f4f7f3]/92 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="hidden lg:inline-flex" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium uppercase text-stone-500">
                  OPSN / {meta.title}
                </p>
                <h1 className="truncate text-xl font-semibold leading-tight text-stone-950 sm:text-2xl">
                  {meta.title}
                </h1>
                <p className="hidden truncate text-sm text-stone-500 sm:block">
                  {meta.subtitle}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {authControls}
            </div>
          </div>
        </header>
        <main className="mx-auto mt-4 w-full max-w-[84rem] px-3 py-4 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 sm:pb-[calc(14rem+env(safe-area-inset-bottom))] lg:pb-6">
          {children}
        </main>
        <Toaster richColors position="top-right" />
        <BottomNav section={section} onSectionChange={onSectionChange} />
      </SidebarInset>
    </SidebarProvider>
  );
}

function BottomNav({
  section,
  onSectionChange,
}: {
  section: Section;
  onSectionChange: (section: Section) => void;
}) {
  const items = nav.filter(([key]) =>
    ["dashboard", "properties", "contracts", "tenants", "movements"].includes(
      key,
    ),
  );
  return (
    <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 grid grid-cols-5 rounded-2xl border border-sidebar-border bg-white/95 p-1 shadow-lg shadow-emerald-950/10 backdrop-blur lg:hidden">
      {items.map(([key, Icon, label]) => (
        <button
          key={key}
          className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium ${section === key ? "bg-emerald-700 text-white" : "text-stone-600"}`}
          onClick={() => onSectionChange(key)}
        >
          <Icon size={17} />
          <span className="truncate">{label}</span>
        </button>
      ))}
    </nav>
  );
}
