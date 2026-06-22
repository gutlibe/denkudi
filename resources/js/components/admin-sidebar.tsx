import {
    Analytics01Icon,
    DashboardSquare02Icon,
    PanelLeftOpenIcon,
    Shield01Icon,
    UserGroup02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@inertiajs/react';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboard } from '@/routes/admin';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: () => <HugeiconsIcon icon={DashboardSquare02Icon} size={18} />,
    },
    {
        title: 'Elections',
        href: '/admin/elections',
        icon: () => <HugeiconsIcon icon={Analytics01Icon} size={18} />,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: () => <HugeiconsIcon icon={UserGroup02Icon} size={18} />,
    },
];

export function AdminSidebar() {
    const { state, setOpen } = useSidebar();

    return (
        <Sidebar collapsible="icon" variant="sidebar">
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
                                <span className="transition-opacity group-hover/expand:opacity-0">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <HugeiconsIcon
                                            icon={Shield01Icon}
                                            size={18}
                                        />
                                    </div>
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/expand:opacity-100">
                                    <HugeiconsIcon
                                        icon={PanelLeftOpenIcon}
                                        size={20}
                                    />
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
                <NavMain items={mainNavItems} label="Admin" />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
