import { Analytics01Icon, ArrowLeft02Icon, CrownIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
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
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';

type Candidate = {
    id: number;
    name: string;
    department: string | null;
    photo_url: string | null;
    vote_count: number;
    percentage: number;
};
type Position = {
    id: number;
    title: string;
    total_votes: number;
    candidates: Candidate[];
};
type Props = {
    election: {
        id: number;
        title: string;
        status: string;
        results_released: boolean;
    };
    positions: Position[];
};

const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

export default function ResultsPage({ election, positions }: Props) {
    const totalVotes = positions.reduce((s, p) => s + p.total_votes, 0);
    const totalCandidates = positions.reduce((s, p) => s + p.candidates.length, 0);
    const notReleased = !election.results_released;

    if (notReleased) {
        return (
            <>
                <Head title={`Results — ${election.title}`} />
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon-sm" asChild>
                            <Link href={dashboard()}>
                                <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{election.title}</h2>
                            <p className="text-sm text-muted-foreground">Results not yet released.</p>
                        </div>
                    </div>
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-4 py-20">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                <HugeiconsIcon icon={Analytics01Icon} size={32} className="text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">Results Pending</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Official results have not been published for this election yet.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    if (positions.length === 0) {
        return (
            <>
                <Head title={`Results — ${election.title}`} />
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon-sm" asChild>
                            <Link href={dashboard()}>
                                <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{election.title}</h2>
                            <p className="text-sm text-muted-foreground">No results available yet.</p>
                        </div>
                    </div>
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-20">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                <HugeiconsIcon icon={Analytics01Icon} size={22} className="text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">No votes have been cast yet.</p>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Results — ${election.title}`} />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon-sm" asChild>
                            <Link href={dashboard()}>
                                <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{election.title}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Official election results</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
                                <HugeiconsIcon icon={Analytics01Icon} size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Votes</p>
                                <p className="text-xl font-bold tabular-nums">{totalVotes}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm">
                                <HugeiconsIcon icon={UserGroupIcon} size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Positions</p>
                                <p className="text-xl font-bold tabular-nums">{positions.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shadow-sm">
                                <HugeiconsIcon icon={UserGroupIcon} size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Candidates</p>
                                <p className="text-xl font-bold tabular-nums">{totalCandidates}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    {positions.map((position) => {
                        const chartData = position.candidates.map((c, i) => ({
                            name: c.name,
                            votes: c.vote_count,
                            fill: COLORS[i % COLORS.length],
                        }));

                        const chartConfig = Object.fromEntries(
                            position.candidates.map((c, i) => [
                                c.name,
                                { label: c.name, color: COLORS[i % COLORS.length] },
                            ]),
                        ) satisfies ChartConfig;

                        const winner = position.total_votes > 0 ? position.candidates[0] : null;

                        return (
                            <Card key={position.id}>
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <CardTitle className="text-lg">{position.title}</CardTitle>
                                            <CardDescription>
                                                {position.total_votes} vote{position.total_votes !== 1 ? 's' : ''} cast
                                            </CardDescription>
                                        </div>
                                        {winner && (
                                            <Badge className="gap-1 shrink-0 bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">
                                                <HugeiconsIcon icon={CrownIcon} size={12} />
                                                {winner.name}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {position.total_votes === 0 ? (
                                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                                            No votes cast for this position.
                                        </div>
                                    ) : (
                                        <>
                                            <ChartContainer
                                                config={chartConfig}
                                                style={{ height: `${Math.max(80, chartData.length * 44)}px` }}
                                                className="w-full select-none"
                                            >
                                                <BarChart
                                                    data={chartData}
                                                    layout="vertical"
                                                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                                    barCategoryGap={8}
                                                    accessibilityLayer={false}
                                                >
                                                    <CartesianGrid horizontal={false} strokeDasharray="4" />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="name"
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickMargin={8}
                                                        width={110}
                                                        tick={{ fontSize: 13, fill: 'var(--foreground)' }}
                                                    />
                                                    <XAxis type="number" hide />
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={
                                                            <ChartTooltipContent
                                                                indicator="line"
                                                                labelFormatter={(label) => label as string}
                                                            />
                                                        }
                                                    />
                                                    <Bar dataKey="votes" radius={[0, 6, 6, 0]} barSize={26} activeBar={false}>
                                                        {chartData.map((entry, i) => (
                                                            <Cell key={`cell-${entry.name}-${i}`} fill={COLORS[i % COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ChartContainer>

                                            <Separator className="my-4" />

                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {position.candidates.map((c, i) => (
                                                    <div key={c.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                                            {c.photo_url ? (
                                                                <img src={c.photo_url} alt={c.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <span className="text-xs font-bold text-muted-foreground">
                                                                    {c.name.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="h-2 w-2 shrink-0 rounded-full"
                                                                    style={{ background: COLORS[i % COLORS.length] }}
                                                                />
                                                                <p className="truncate text-sm font-medium">{c.name}</p>
                                                            </div>
                                                            {c.department && (
                                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.department}</p>
                                                            )}
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <p className="text-sm font-semibold tabular-nums">{c.vote_count}</p>
                                                            <p className="text-xs text-muted-foreground tabular-nums">{c.percentage}%</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

ResultsPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Results', href: '#' },
    ],
};
