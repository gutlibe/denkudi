import { Head, Link } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Analytics01Icon, Group01Icon, DashboardSquare02Icon, PlusSignIcon, CheckmarkCircle01Icon, Shield01Icon, Clock01Icon, File01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';

type LogEntry = {
    id: number;
    admin: string;
    action: string;
    description: string;
    created_at: string;
};

type Props = {
    stats: {
        total_elections: number;
        active_elections: number;
        total_voters: number;
        total_votes: number;
        paused_elections: number;
    };
    recent_logs: LogEntry[];
};

const actionLabel = (action: string) => {
    const m: Record<string, string> = {
        election_created: 'Created',
        election_updated: 'Updated',
        election_deleted: 'Deleted',
        election_status_changed: 'Status',
        results_released: 'Released',
        results_withdrawn: 'Withdrawn',
        election_resumed: 'Resumed',
    };
    return m[action] ?? action.replace(/_/g, ' ');
};

export default function AdminDashboard({ stats, recent_logs }: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-sm text-muted-foreground mt-1">Overview of your election platform.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <HugeiconsIcon icon={Analytics01Icon} size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Elections</p>
                                <p className="text-lg font-bold">{stats.total_elections}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
                                <p className="text-lg font-bold">{stats.active_elections}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                <HugeiconsIcon icon={Group01Icon} size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Voters</p>
                                <p className="text-lg font-bold">{stats.total_voters}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                                <HugeiconsIcon icon={Shield01Icon} size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Votes</p>
                                <p className="text-lg font-bold">{stats.total_votes}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className={`p-3 ${stats.paused_elections > 0 ? 'ring-1 ring-yellow-500/30' : ''}`}>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                                <HugeiconsIcon icon={Clock01Icon} size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Paused</p>
                                <p className="text-lg font-bold">{stats.paused_elections}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <HugeiconsIcon icon={PlusSignIcon} size={14} />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href="/admin/elections/create">
                                    <HugeiconsIcon icon={PlusSignIcon} size={13} className="mr-1.5" />
                                    New Election
                                </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href="/admin/elections">
                                    <HugeiconsIcon icon={Analytics01Icon} size={13} className="mr-1.5" />
                                    Manage Elections
                                </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href="/admin/audit-logs">
                                    <HugeiconsIcon icon={File01Icon} size={13} className="mr-1.5" />
                                    Audit Logs
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <HugeiconsIcon icon={Clock01Icon} size={14} />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0">
                            {recent_logs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No recent activity.</p>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {recent_logs.map((log) => (
                                        <div key={log.id} className="flex items-start gap-2 py-2 first:pt-0 last:pb-0">
                                            <span className="mt-0.5 flex h-5 min-w-12 shrink-0 items-center justify-center rounded bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                                                {actionLabel(log.action)}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs leading-tight truncate">{log.description}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{log.admin} &middot; {new Date(log.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
