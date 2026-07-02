import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { dashboard } from '@/routes/admin';

type LogEntry = {
    id: number;
    admin: string;
    action: string;
    description: string;
    metadata: Record<string, unknown> | null;
    ip_address: string;
    created_at: string;
};

type Props = {
    logs: LogEntry[];
    pagination: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
};

const actionBadge = (action: string) => {
    const m: Record<
        string,
        {
            label: string;
            variant: 'default' | 'secondary' | 'destructive' | 'outline';
        }
    > = {
        election_created: { label: 'Created', variant: 'default' },
        election_updated: { label: 'Updated', variant: 'secondary' },
        election_deleted: { label: 'Deleted', variant: 'destructive' },
        election_status_changed: { label: 'Status', variant: 'outline' },
        results_released: { label: 'Results', variant: 'default' },
        results_withdrawn: { label: 'Withdrawn', variant: 'secondary' },
        election_resumed: { label: 'Resumed', variant: 'default' },
        election_auto_closed: { label: 'Auto Closed', variant: 'secondary' },
        user_role_changed: { label: 'Role', variant: 'outline' },
        quarantine_dismissed: { label: 'Dismissed', variant: 'secondary' },
        candidate_created: { label: 'Candidate', variant: 'default' },
        candidate_updated: { label: 'Candidate', variant: 'secondary' },
        candidate_deleted: { label: 'Candidate', variant: 'destructive' },
        position_created: { label: 'Position', variant: 'default' },
        position_updated: { label: 'Position', variant: 'secondary' },
        position_deleted: { label: 'Position', variant: 'destructive' },
    };

    return (
        m[action] ?? {
            label: action.replace(/_/g, ' '),
            variant: 'secondary' as const,
        }
    );
};

export default function AuditLogsPage({ logs, pagination }: Props) {
    const [search, setSearch] = useState('');

    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(
        1,
        pagination.current_page - Math.floor(maxPages / 2),
    );
    const endPage = Math.min(pagination.last_page, startPage + maxPages - 1);
    startPage = Math.max(1, endPage - maxPages + 1);

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    const goToPage = (page: number) => {
        const params: Record<string, string | number> = { page: String(page) };

        if (search) {
            params.search = search;
        }

        router.get('/admin/audit-logs', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = () => {
        router.get(
            '/admin/audit-logs',
            { search: search || undefined, page: '1' },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Audit Logs" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Audit Logs
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {pagination.total} total records &middot; Showing{' '}
                            {pagination.from}&ndash;{pagination.to}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch()
                            }
                            className="w-48"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSearch}
                        >
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={14}
                                className="mr-1.5"
                            />
                            Search
                        </Button>
                    </div>
                </div>

                <Card className="py-0">
                    <CardContent className="p-0">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-20">
                                <HugeiconsIcon
                                    icon={Search01Icon}
                                    size={32}
                                    className="text-muted-foreground/40"
                                />
                                <p className="text-sm text-muted-foreground">
                                    No audit logs found.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px]">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Admin
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Action
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Description
                                            </th>
                                            <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase md:table-cell">
                                                IP
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {logs.map((log) => {
                                            const badge = actionBadge(
                                                log.action,
                                            );

                                            return (
                                                <tr
                                                    key={log.id}
                                                    className="transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                                                        {log.admin}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <Badge
                                                            variant={
                                                                badge.variant
                                                            }
                                                            className="text-[11px] capitalize"
                                                        >
                                                            {badge.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="max-w-xs px-4 py-3 text-sm text-muted-foreground">
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <p className="cursor-default truncate">
                                                                    {
                                                                        log.description
                                                                    }
                                                                </p>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="top"
                                                                className="max-w-sm"
                                                            >
                                                                <p className="text-xs">
                                                                    {
                                                                        log.description
                                                                    }
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </td>
                                                    <td className="hidden px-4 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground md:table-cell">
                                                        {log.ip_address ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm whitespace-nowrap text-muted-foreground">
                                                        {new Date(
                                                            log.created_at,
                                                        ).toLocaleDateString(
                                                            'en-GB',
                                                            {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                        <span className="ml-1.5 text-xs opacity-60">
                                                            {new Date(
                                                                log.created_at,
                                                            ).toLocaleTimeString(
                                                                'en-GB',
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {pagination.current_page} of{' '}
                            {pagination.last_page}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === 1}
                                onClick={() =>
                                    goToPage(pagination.current_page - 1)
                                }
                            >
                                Prev
                            </Button>
                            {pages.map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === pagination.current_page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => goToPage(page)}
                                    className="min-w-9"
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    pagination.current_page ===
                                    pagination.last_page
                                }
                                onClick={() =>
                                    goToPage(pagination.current_page + 1)
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

AuditLogsPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Audit Logs', href: '/admin/audit-logs' },
    ],
};
