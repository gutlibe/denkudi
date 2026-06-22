import { Analytics01Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
    const notReleased = !election.results_released;

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
                        <h2 className="text-xl font-bold tracking-tight">
                            {election.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {notReleased
                                ? 'Official results pending publication.'
                                : `Results · ${totalVotes} total vote${totalVotes !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                {notReleased ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <HugeiconsIcon
                                    icon={Analytics01Icon}
                                    size={32}
                                />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold">
                                    Results Pending
                                </h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Official results have not been published for
                                    this election yet.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : positions.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <HugeiconsIcon
                                    icon={Analytics01Icon}
                                    size={22}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No results available yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {positions.map((position) => {
                            const chartData = position.candidates.map(
                                (c, i) => ({
                                    name: c.name,
                                    votes: c.vote_count,
                                    percentage: c.percentage,
                                    fill: COLORS[i % COLORS.length],
                                }),
                            );

                            const chartConfig = Object.fromEntries(
                                position.candidates.map((c, i) => [
                                    c.name,
                                    {
                                        label: c.name,
                                        color: COLORS[i % COLORS.length],
                                    },
                                ]),
                            ) satisfies ChartConfig;

                            const winner = position.candidates.reduce(
                                (max, c) =>
                                    c.vote_count > (max?.vote_count ?? -1)
                                        ? c
                                        : max,
                                null as Candidate | null,
                            );

                            return (
                                <Card key={position.id}>
                                    <CardHeader>
                                        <div className="flex items-baseline justify-between">
                                            <div>
                                                <CardTitle className="text-base">
                                                    {position.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {position.total_votes} vote
                                                    {position.total_votes !== 1
                                                        ? 's'
                                                        : ''}{' '}
                                                    cast
                                                </CardDescription>
                                            </div>
                                            {winner &&
                                                position.total_votes > 0 && (
                                                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                        <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-primary/20">
                                                            {winner.photo_url ? (
                                                                <img
                                                                    src={
                                                                        winner.photo_url
                                                                    }
                                                                    alt={
                                                                        winner.name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-[10px]">
                                                                    🏆
                                                                </span>
                                                            )}
                                                        </div>
                                                        {winner.name}
                                                    </div>
                                                )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer
                                            config={chartConfig}
                                            style={{
                                                height: `${Math.max(100, chartData.length * 48)}px`,
                                            }}
                                            className="w-full"
                                        >
                                            <BarChart
                                                data={chartData}
                                                layout="vertical"
                                                margin={{
                                                    top: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    left: 0,
                                                }}
                                                barCategoryGap={6}
                                            >
                                                <CartesianGrid
                                                    horizontal={false}
                                                    strokeDasharray="4"
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="name"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    width={100}
                                                    tick={{
                                                        fontSize: 12,
                                                        fill: 'var(--muted-foreground)',
                                                    }}
                                                />
                                                <XAxis type="number" hide />
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={
                                                        <ChartTooltipContent
                                                            indicator="line"
                                                            labelFormatter={(
                                                                label,
                                                            ) =>
                                                                label as string
                                                            }
                                                        />
                                                    }
                                                />
                                                <Bar
                                                    dataKey="votes"
                                                    radius={[0, 6, 6, 0]}
                                                    barSize={24}
                                                >
                                                    {chartData.map(
                                                        (entry, i) => (
                                                            <rect
                                                                key={i}
                                                                fill={
                                                                    COLORS[
                                                                        i %
                                                                            COLORS.length
                                                                    ]
                                                                }
                                                                rx={6}
                                                            />
                                                        ),
                                                    )}
                                                </Bar>
                                            </BarChart>
                                        </ChartContainer>

                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                            {position.candidates.map((c, i) => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div
                                                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                                        style={{
                                                            background:
                                                                COLORS[
                                                                    i %
                                                                        COLORS.length
                                                                ],
                                                        }}
                                                    />
                                                    <span className="truncate">
                                                        {c.name}
                                                    </span>
                                                    <span className="ml-auto font-medium text-foreground">
                                                        {c.vote_count} (
                                                        {c.percentage}%)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
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
