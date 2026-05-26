"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  navigationItems,
  studioBrand,
  workspaceUtilityItems,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const hiddenShellPrefixes = ["/login"];

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  students: "Students",
  bookings: "Bookings",
  payments: "Payments",
  expenses: "Expenses",
  settings: "Settings",
  integrations: "Integrations",
  "google-calendar": "Google Calendar",
  "ai-imports": "AI Imports",
  new: "New",
  edit: "Edit",
};

function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/" || pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatSegment(segment: string) {
  if (segmentLabels[segment]) {
    return segmentLabels[segment];
  }

  if (segment.length > 24) {
    return "Record";
  }

  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function getBreadcrumbs(pathname: string) {
  if (pathname === "/" || pathname === "/dashboard") {
    return [{ label: "Dashboard", href: "/dashboard" }];
  }

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }];
  let currentPath = "";

  for (const segment of segments) {
    if (segment === "dashboard") {
      continue;
    }

    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: formatSegment(segment),
      href: currentPath,
    });
  }

  return breadcrumbs;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const hideShell = hiddenShellPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const breadcrumbs = useMemo(() => getBreadcrumbs(pathname), [pathname]);

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--surface-canvas-white)] p-3 text-[var(--color-ink)] sm:p-4">
      <div className="mx-auto flex w-full max-w-[1680px] gap-4">
        <aside className="hidden w-[244px] shrink-0 flex-col rounded-[22px] border border-[var(--color-fog)] bg-white p-3.5 shadow-[var(--shadow-subtle)] lg:flex">
          <Link
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[var(--surface-canvas-white)]"
            href="/dashboard"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--color-fog)] bg-[var(--color-ink)] text-sm font-semibold text-white">
              C
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-[var(--color-ink)]">
                Clayos
              </p>
              <p className="text-xs text-[var(--color-muted-gray)]">Studio Workspace</p>
            </div>
          </Link>

          <nav className="mt-5 space-y-1">
            {navigationItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);

              return (
                <Link
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                    active
                      ? "bg-[var(--surface-canvas-white)] text-[var(--color-ink)]"
                      : "text-[var(--color-muted-gray)] hover:bg-[var(--surface-canvas-white)] hover:text-[var(--color-ink)]",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-[var(--color-fog)] pt-4">
            <p className="px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-subtle-gray)]">
              Integrations
            </p>
            <nav className="mt-2 space-y-1">
              {workspaceUtilityItems.map((item) => {
                const active = isNavItemActive(pathname, item.href);

                return (
                  <Link
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                      active
                        ? "bg-[var(--surface-canvas-white)] text-[var(--color-ink)]"
                        : "text-[var(--color-muted-gray)] hover:bg-[var(--surface-canvas-white)] hover:text-[var(--color-ink)]",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-[14px] border border-[var(--color-fog)] bg-[var(--surface-canvas-white)] p-3.5">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-subtle-gray)]">
              Quick create
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                asChild
                className="h-9 justify-start rounded-[10px] px-3 text-[13px]"
                size="sm"
              >
                <Link href="/bookings/new">
                  <Plus className="size-4" />
                  新增預約
                </Link>
              </Button>
              <Button
                asChild
                className="h-9 justify-start rounded-[10px] px-3 text-[13px]"
                size="sm"
                variant="outline"
              >
                <Link href="/students/new">
                  <Plus className="size-4" />
                  新增學生
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[var(--color-fog)] bg-white px-4 py-3 shadow-[var(--shadow-subtle)]">
            <div className="flex min-w-0 items-center gap-2 overflow-hidden text-[13px] text-[var(--color-muted-gray)]">
              {breadcrumbs.map((crumb, index) => (
                <div className="flex min-w-0 items-center gap-2" key={crumb.href}>
                  {index > 0 ? <ChevronRight className="size-3.5 shrink-0" /> : null}
                  <Link
                    className={cn(
                      "truncate transition",
                      index === breadcrumbs.length - 1
                        ? "font-semibold text-[var(--color-ink)]"
                        : "hover:text-[var(--color-ink)]",
                    )}
                    href={crumb.href}
                  >
                    {crumb.label}
                  </Link>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-[10px] border border-[var(--color-fog)] bg-[var(--surface-canvas-white)] px-3 py-2 text-xs text-[var(--color-muted-gray)] md:flex">
                <Search className="size-3.5" />
                <span>Workspace Search</span>
              </div>
              <Button asChild className="h-9 rounded-[10px] px-3 text-[13px]" size="sm">
                <Link href="/bookings/new">
                  <Plus className="size-4" />
                  New
                </Link>
              </Button>
            </div>
          </header>

          <nav className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navigationItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);

              return (
                <Link
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-[10px] border px-3 py-2 text-xs font-medium transition",
                    active
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                      : "border-[var(--color-fog)] bg-white text-[var(--color-muted-gray)] hover:text-[var(--color-ink)]",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <item.icon className="size-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <main className="rounded-[22px] border border-[var(--color-fog)] bg-white p-4 shadow-[var(--shadow-subtle)] sm:p-6 lg:p-7">
            {children}
          </main>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-[var(--color-subtle-gray)]">
        {studioBrand.name}
      </p>
    </div>
  );
}
