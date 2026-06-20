import { Link, usePage } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Clock01Icon,
    DashboardSquare02Icon,
    PanelLeftOpenIcon,
    Search01Icon,
    Shield01Icon,
} from '@hugeicons/core-free-icons';
import AppLogo from '@/components/app-logo';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { dashboard, verify as verifyRoute } from '@/routes';
import { results } from '@/routes/elections';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { props } = usePage<{ auth: { admin?: boolean }; pastElections: { id: number; title: string; scope: string; status: string; ends_at: string | null }[] }>();
    const { state, setOpen } = useSidebar();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: () => <HugeiconsIcon icon={DashboardSquare02Icon} size={18} />,
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
                <div className="mt-4 border-t border-sidebar-border/40 pt-3 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:pt-1">
                    <div className="px-3 pb-2 group-data-[collapsible=icon]:hidden">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">Past Elections</p>
                    </div>
                    <ScrollArea className="h-40 group-data-[collapsible=icon]:h-auto">
                        {props.pastElections && props.pastElections.length > 0 ? (
                            <div className="space-y-0.5 px-1.5">
                                {props.pastElections.map((e) => (
                                    <Tooltip key={e.id}>
                                        <TooltipTrigger asChild>
                                            <SidebarMenuButton size="sm" asChild className="justify-start h-auto py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:size-8">
                                                <Link href={results({ election: e.id })} className="flex-col items-start gap-0.5">
                                                    <span className="text-xs font-medium leading-tight line-clamp-1 group-data-[collapsible=icon]:hidden">{e.title}</span>
                                                    <span className="text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                                                        {e.ends_at ? new Date(e.ends_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
                                                    </span>
                                                    <HugeiconsIcon icon={Clock01Icon} size={14} className="hidden group-data-[collapsible=icon]:block text-muted-foreground" />
                                                </Link>
                                            </SidebarMenuButton>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" align="center" sideOffset={8}>
                                            {e.title}
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] text-muted-foreground px-3 group-data-[collapsible=icon]:hidden">No past elections yet.</p>
                        )}
                    </ScrollArea>
                </div>
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
