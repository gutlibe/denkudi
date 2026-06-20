import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { LiquidBackground } from '@/components/liquid-background';
import { MobileFloatingHeader } from '@/components/mobile-floating-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="max-lg:max-h-svh max-lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                <LiquidBackground />
                <div className="relative z-10 flex flex-1 flex-col">
                    <MobileFloatingHeader />
                    <div className="flex flex-1 flex-col gap-4 overflow-x-hidden px-4 pt-16 pb-6 md:pt-4 lg:px-6 lg:py-8">
                        {children}
                    </div>
                </div>
            </AppContent>
        </AppShell>
    );
}
