import {
    Analytics01Icon,
    Group01Icon,
    Shield01Icon,
    Clock01Icon,
    CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    activity: { date: string; votes: number }[];
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

export default function AdminDashboard({
    stats,
    recent_logs,
    activity,
}: Props) {
    const [period, setPeriod] = useState('30d');

    const filteredActivity = (() => {
        if (activity.length === 0) {
            return [];
        }

        const ref = new Date(activity[activity.length - 1].date);
        const days =
            period === '7d'
                ? 7
                : period === '30d'
                  ? 30
                  : period === '90d'
                    ? 90
                    : 365;
        const start = new Date(ref);
        start.setDate(start.getDate() - days);

        return activity.filter((a) => new Date(a.date) >= start);
    })();

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">
                        Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Overview of your election platform.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <HugeiconsIcon
                                    icon={Analytics01Icon}
                                    size={16}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                    Elections
                                </p>
                                <p className="text-lg font-bold">
                                    {stats.total_elections}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                                <HugeiconsIcon
                                    icon={CheckmarkCircle01Icon}
                                    size={16}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                    Active
                                </p>
                                <p className="text-lg font-bold">
                                    {stats.active_elections}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                <HugeiconsIcon icon={Group01Icon} size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                    Voters
                                </p>
                                <p className="text-lg font-bold">
                                    {stats.total_voters}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                                <HugeiconsIcon icon={Shield01Icon} size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                    Votes
                                </p>
                                <p className="text-lg font-bold">
                                    {stats.total_votes}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card
                        className={`p-3 ${stats.paused_elections > 0 ? 'ring-1 ring-yellow-500/30' : ''}`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                                <HugeiconsIcon icon={Clock01Icon} size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                    Paused
                                </p>
                                <p className="text-lg font-bold">
                                    {stats.paused_elections}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between px-(--card-spacing) pt-6 pb-4">
                            <div>
                                <h3 className="font-heading text-base font-medium">
                                    Voting Activity
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Votes cast over the selected period
                                </p>
                            </div>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">
                                        Last 7 days
                                    </SelectItem>
                                    <SelectItem value="30d">
                                        Last 30 days
                                    </SelectItem>
                                    <SelectItem value="90d">
                                        Last 90 days
                                    </SelectItem>
                                    <SelectItem value="all">
                                        All time
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <CardContent className="pt-0">
                            {activity.length === 0 ? (
                                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                                    No voting activity yet.
                                </div>
                            ) : (
                                <ChartContainer
                                    config={
                                        {
                                            votes: {
                                                label: 'Votes',
                                                color: 'var(--chart-1)',
                                            },
                                        } satisfies ChartConfig
                                    }
                                    className="aspect-auto h-[250px] w-full"
                                >
                                    <AreaChart data={filteredActivity}>
                                        <defs>
                                            <linearGradient
                                                id="fillVotes"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-votes)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-votes)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="4"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                            tick={{
                                                fontSize: 12,
                                                fill: 'var(--muted-foreground)',
                                            }}
                                            tickFormatter={(v) => {
                                                const d = new Date(v);

                                                return d.toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    },
                                                );
                                            }}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(v) =>
                                                        new Date(
                                                            v,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'long',
                                                                day: 'numeric',
                                                            },
                                                        )
                                                    }
                                                    indicator="dot"
                                                />
                                            }
                                        />
                                        <Area
                                            dataKey="votes"
                                            type="natural"
                                            fill="url(#fillVotes)"
                                            stroke="var(--color-votes)"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recent_logs.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No recent activity.
                                </p>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {recent_logs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-start gap-2 py-2 first:pt-0 last:pb-0"
                                        >
                                            <span className="mt-0.5 flex h-5 min-w-12 shrink-0 items-center justify-center rounded bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                                                {actionLabel(log.action)}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs leading-tight">
                                                    {log.description}
                                                </p>
                                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                    {log.admin} &middot;{' '}
                                                    {new Date(
                                                        log.created_at,
                                                    ).toLocaleTimeString(
                                                        'en-GB',
                                                        {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        },
                                                    )}
                                                </p>
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
