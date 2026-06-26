import {
    AlertCircleIcon,
    Analytics01Icon,
    ArrowRight01Icon,
    Calendar01Icon,
    CheckmarkCircle01Icon,
    File02Icon,
    PlusSignIcon,
    Settings01Icon,
    Shield01Icon,
    SourceCodeSquareIcon,
    UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes/admin';

type ActiveElection = {
    id: number;
    title: string;
    type: string;
    scope: string;
    position_count: number;
    vote_count: number;
    voter_count: number;
    turnout_pct: number;
    quarantined: number;
};

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
        paused_elections: number;
        total_students: number;
        total_valid_votes: number;
        total_quarantined: number;
        total_votes: number;
        voters_today: number;
        turnout_pct: number;
        chain_health: number;
    };
    election_distribution: {
        draft: number;
        scheduled: number;
        active: number;
        paused: number;
        closed: number;
    };
    active_elections: ActiveElection[];
    activity: { date: string; votes: number }[];
    recent_logs: LogEntry[];
};

const actionBadge = (action: string) => {
    const m: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
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

    return m[action] ?? { label: action.replace(/_/g, ' '), variant: 'secondary' as const };
};

export default function AdminDashboard({
    stats,
    election_distribution,
    active_elections,
    activity,
    recent_logs,
}: Props) {
    const [period, setPeriod] = useState('30d');

    const filteredActivity = (() => {
        if (activity.length === 0) {
return [];
}

        const ref = new Date(activity[activity.length - 1].date);
        const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
        const start = new Date(ref);
        start.setDate(start.getDate() - days);

        return activity.filter((a) => new Date(a.date) >= start);
    })();

    const totalElections = election_distribution.draft + election_distribution.scheduled + election_distribution.active + election_distribution.paused + election_distribution.closed;

    const distColors: Record<string, string> = {
        draft: 'bg-muted-foreground/30',
        scheduled: 'bg-blue-500',
        active: 'bg-emerald-500',
        paused: 'bg-yellow-500',
        closed: 'bg-muted-foreground/50',
    };
    const distLabels: Record<string, string> = {
        draft: 'Draft',
        scheduled: 'Scheduled',
        active: 'Active',
        paused: 'Paused',
        closed: 'Closed',
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your command center for election integrity.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/elections/create">
                                <HugeiconsIcon icon={PlusSignIcon} size={14} className="mr-1.5" />
                                New Election
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/elections">
                                <HugeiconsIcon icon={Settings01Icon} size={14} className="mr-1.5" />
                                Manage
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden p-4">
                        <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-primary/10" />
                        <div className="relative flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                <HugeiconsIcon icon={Analytics01Icon} size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Total Votes</p>
                                <p className="text-2xl font-bold tabular-nums">{stats.total_votes}</p>
                            </div>
                        </div>
                        <div className="relative mt-3 flex items-center gap-2 border-t pt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 text-emerald-600">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={11} />
                                {stats.total_valid_votes} valid
                            </span>
                            {stats.total_quarantined > 0 && (
                                <span className="flex items-center gap-1 text-yellow-600">
                                    &middot;
                                    <HugeiconsIcon icon={AlertCircleIcon} size={11} />
                                    {stats.total_quarantined} quarantined
                                </span>
                            )}
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm">
                                <HugeiconsIcon icon={UserGroupIcon} size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Registered Voters</p>
                                <p className="text-2xl font-bold tabular-nums">{stats.total_students}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 border-t pt-2 text-xs text-muted-foreground">
                            <span>{stats.turnout_pct}% participation</span>
                            <Separator orientation="vertical" className="mx-1 h-3" />
                            <span>{stats.voters_today} today</span>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shadow-sm">
                                <HugeiconsIcon icon={Shield01Icon} size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Chain Health</p>
                                <p className="text-2xl font-bold tabular-nums">{stats.chain_health}%</p>
                            </div>
                        </div>
                        <div className="mt-3 border-t pt-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${stats.chain_health}%`,
                                        background: stats.chain_health >= 99
                                            ? 'var(--emerald-500)'
                                            : stats.chain_health >= 95
                                              ? 'var(--yellow-500)'
                                              : 'var(--destructive)',
                                    }}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className={`p-4 ${stats.paused_elections > 0 ? 'ring-1 ring-yellow-500/40' : ''}`}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 shadow-sm">
                                <HugeiconsIcon icon={Calendar01Icon} size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Active Elections</p>
                                <p className="text-2xl font-bold tabular-nums">{stats.active_elections}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1 border-t pt-2 text-xs text-muted-foreground">
                            <span>{totalElections} total</span>
                            <Separator orientation="vertical" className="mx-1 h-3" />
                            <span>{stats.paused_elections} paused</span>
                            <Separator orientation="vertical" className="mx-1 h-3" />
                            <span>{stats.voters_today} today</span>
                        </div>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Active Elections</CardTitle>
                                <CardDescription>Currently running elections</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/elections">
                                    View all
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={13} className="ml-1" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {active_elections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12">
                                <HugeiconsIcon icon={SourceCodeSquareIcon} size={28} className="text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">No elections currently active.</p>
                                <Button asChild variant="outline" size="sm" className="mt-2">
                                    <Link href="/admin/elections/create">Create one</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {active_elections.map((e) => (
                                    <Link
                                        key={e.id}
                                        href={`/admin/elections/${e.id}/manage`}
                                        className="group block rounded-lg border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold group-hover:text-primary">
                                                    {e.title}
                                                </p>
                                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                                                    <Badge variant="secondary" className="text-[10px]">{e.type}</Badge>
                                                    <span>{e.position_count} position{e.position_count !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-end justify-between">
                                            <div>
                                                <p className="text-xl font-bold tabular-nums">{e.vote_count}</p>
                                                <p className="text-[11px] text-muted-foreground">{e.voter_count} voter{e.voter_count !== 1 ? 's' : ''}</p>
                                            </div>
                                            <p className="text-xs font-medium tabular-nums text-muted-foreground">
                                                {e.turnout_pct}%
                                            </p>
                                        </div>
                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all"
                                                style={{ width: `${Math.min(e.turnout_pct, 100)}%` }}
                                            />
                                        </div>
                                        {e.quarantined > 0 && (
                                            <p className="mt-2 flex items-center gap-1 text-[11px] text-yellow-600">
                                                <HugeiconsIcon icon={AlertCircleIcon} size={11} />
                                                {e.quarantined} quarantined
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                                    <CardDescription>Latest admin actions</CardDescription>
                                </div>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/admin/audit-logs">
                                        View all
                                        <HugeiconsIcon icon={ArrowRight01Icon} size={13} className="ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {recent_logs.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8">
                                    <HugeiconsIcon icon={File02Icon} size={24} className="text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recent_logs.map((log) => {
                                        const badge = actionBadge(log.action);

                                        return (
                                            <div key={log.id} className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50">
                                                <Badge variant={badge.variant} className="mt-0.5 shrink-0 text-[10px] capitalize">
                                                    {badge.label}
                                                </Badge>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs leading-tight">{log.description}</p>
                                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                                        {log.admin} &middot;{' '}
                                                        {new Date(log.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Election Distribution</CardTitle>
                            <CardDescription>Status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {totalElections === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12">
                                    <HugeiconsIcon icon={File02Icon} size={28} className="text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">No elections created yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {Object.entries(distColors).map(([key, color]) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-3 w-3 rounded-sm ${color}`} />
                                                <span className="w-16 text-sm capitalize">{distLabels[key]}</span>
                                            </div>
                                            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full rounded-full transition-all ${color}`}
                                                    style={{ width: `${totalElections > 0 ? (election_distribution[key as keyof typeof election_distribution] / totalElections) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-sm font-medium tabular-nums">
                                                {election_distribution[key as keyof typeof election_distribution]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <div className="flex items-center justify-between px-6 pt-6 pb-4">
                        <div>
                            <CardTitle className="text-base">Voting Activity</CardTitle>
                            <CardDescription>Votes cast over time</CardDescription>
                        </div>
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="all">All time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <CardContent className="pt-0">
                        {activity.length === 0 ? (
                            <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
                                <HugeiconsIcon icon={Analytics01Icon} size={28} className="text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">No voting activity yet.</p>
                            </div>
                        ) : (
                            <ChartContainer
                                config={{ votes: { label: 'Votes', color: 'var(--chart-1)' } } satisfies ChartConfig}
                                className="aspect-auto h-[300px] w-full"
                            >
                                <AreaChart data={filteredActivity}>
                                    <defs>
                                        <linearGradient id="fillVotes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-votes)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--color-votes)" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} strokeDasharray="4" />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={40}
                                        tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                        tickFormatter={(v) =>
                                            new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        }
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(v) =>
                                                    new Date(v).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                                                }
                                                indicator="dot"
                                            />
                                        }
                                    />
                                    <Area dataKey="votes" type="natural" fill="url(#fillVotes)" stroke="var(--color-votes)" strokeWidth={2} />
                                </AreaChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
