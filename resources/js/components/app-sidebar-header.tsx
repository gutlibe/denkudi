import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    className,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    className?: string;
}) {
    return (
        <header
            className={cn(
                'sticky top-0 z-40 flex h-13 shrink-0 items-center gap-2 border-b border-sidebar-border/40 bg-background/80 px-3 backdrop-blur-md transition-[height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 lg:h-16 lg:px-4',
                className,
            )}
        >
            <div className="flex w-full items-center gap-2">
                <SidebarTrigger className="-ml-1 md:hidden" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
