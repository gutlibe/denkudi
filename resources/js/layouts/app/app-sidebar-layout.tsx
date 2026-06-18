import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="max-lg:max-h-svh max-lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                <AppSidebarHeader breadcrumbs={breadcrumbs} className="bg-transparent" />
                <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6 lg:py-8">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
