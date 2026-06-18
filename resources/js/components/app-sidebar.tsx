import { Link, usePage } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    DashboardSquare02Icon,
    PanelLeftOpenIcon,
    Settings01Icon,
    Shield01Icon,
} from '@hugeicons/core-free-icons';
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { props } = usePage<{ auth: { admin?: boolean } }>();
    const { state, setOpen } = useSidebar();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: () => <HugeiconsIcon icon={DashboardSquare02Icon} size={18} />,
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
        <Sidebar collapsible="icon" variant="inset">
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
