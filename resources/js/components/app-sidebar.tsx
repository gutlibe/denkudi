import { Link, usePage } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Clock01Icon,
    DashboardSquare02Icon,
    PanelLeftOpenIcon,
    Search01Icon,
    Settings01Icon,
    Shield01Icon,
} from '@hugeicons/core-free-icons';
import { Moon, Sun } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';
import { dashboard, verify as verifyRoute } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { props } = usePage<{ auth: { admin?: boolean } }>();
    const { state, setOpen } = useSidebar();
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: () => <HugeiconsIcon icon={DashboardSquare02Icon} size={18} />,
        },
        {
            title: 'Past Elections',
            href: dashboard(),
            icon: () => <HugeiconsIcon icon={Clock01Icon} size={18} />,
        },
        {
            title: 'Verify Vote',
            href: verifyRoute(),
            icon: () => <HugeiconsIcon icon={Search01Icon} size={18} />,
        },
    ];

    if (props.auth.admin) {
        mainNavItems.push({
            title: 'Admin',
            href: '/admin/dashboard',
            icon: () => <HugeiconsIcon icon={Shield01Icon} size={18} />,
        });
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Settings',
            href: '/settings/profile',
            icon: () => <HugeiconsIcon icon={Settings01Icon} size={18} />,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="[&_[data-sidebar=sidebar]]:rounded-2xl [&_[data-sidebar=sidebar]]:overflow-hidden">
            <SidebarHeader className="flex-row items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-0">
                <SidebarMenu className="flex-1 group-data-[collapsible=icon]:flex-none">
                    <SidebarMenuItem>
                        {state === 'collapsed' ? (
                            <SidebarMenuButton
                                size="lg"
                                onClick={() => setOpen(true)}
                                tooltip={{ children: 'Expand sidebar' }}
                                className="group/expand relative overflow-hidden"
                            >
                                <span className="group-hover/expand:opacity-0 transition-opacity">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                                        <HugeiconsIcon icon={DashboardSquare02Icon} size={18} />
                                    </div>
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/expand:opacity-100 transition-opacity">
                                    <HugeiconsIcon icon={PanelLeftOpenIcon} size={20} />
                                </span>
                            </SidebarMenuButton>
                        ) : (
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={dashboard()} prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SidebarTrigger className="-mr-1 shrink-0 group-data-[collapsible=icon]:hidden" />
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center" sideOffset={8}>
                        Collapse sidebar
                    </TooltipContent>
                </Tooltip>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            onClick={() => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
                            tooltip={{ children: resolvedAppearance === 'dark' ? 'Switch to light mode' : 'Switch to dark mode' }}
                            className="relative group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!"
                        >
                            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="group-data-[collapsible=icon]:hidden">
                                {resolvedAppearance === 'dark' ? 'Light mode' : 'Dark mode'}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
