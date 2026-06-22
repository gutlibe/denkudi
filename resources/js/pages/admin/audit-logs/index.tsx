import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const actionLabel = (action: string) => {
    const labels: Record<string, string> = {
        election_created: 'Created',
        election_updated: 'Updated',
        election_deleted: 'Deleted',
        election_status_changed: 'Status Changed',
        results_released: 'Results Released',
        results_withdrawn: 'Results Withdrawn',
        election_resumed: 'Resumed',
    };

    return labels[action] ?? action.replace(/_/g, ' ');
};

export default function AuditLogsPage({ logs, pagination }: Props) {
    return (
        <>
            <Head title="Audit Logs" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">
                        Audit Logs
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {pagination.total} total records &middot; showing{' '}
                        {pagination.from}–{pagination.to}
                    </p>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {logs.length === 0 ? (
                            <p className="py-16 text-center text-sm text-muted-foreground">
                                No audit logs yet.
                            </p>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-xs text-muted-foreground">
                                        <th className="px-6 py-3 text-left font-medium">
                                            Admin
                                        </th>
                                        <th className="px-6 py-3 text-left font-medium">
                                            Action
                                        </th>
                                        <th className="hidden px-6 py-3 text-left font-medium md:table-cell">
                                            Description
                                        </th>
                                        <th className="hidden px-6 py-3 text-right font-medium lg:table-cell">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b text-sm last:border-0"
                                        >
                                            <td className="px-6 py-3 font-medium whitespace-nowrap">
                                                {log.admin}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                                                    {actionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="hidden max-w-sm truncate px-6 py-3 text-muted-foreground md:table-cell">
                                                {log.description}
                                            </td>
                                            <td className="hidden px-6 py-3 text-right whitespace-nowrap text-muted-foreground lg:table-cell">
                                                {new Date(
                                                    log.created_at,
                                                ).toLocaleString('en-GB')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === 1}
                            onClick={() =>
                                router.get('/admin/audit-logs', {
                                    page: pagination.current_page - 1,
                                })
                            }
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {pagination.current_page} of{' '}
                            {pagination.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            onClick={() =>
                                router.get('/admin/audit-logs', {
                                    page: pagination.current_page + 1,
                                })
                            }
                        >
                            Next
                        </Button>
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
