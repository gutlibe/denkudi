import {
    Analytics01Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    ArrowExpand01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    election: { id: number; title: string; status: string };
    positions: Position[];
    chain: {
        valid: boolean;
        total: number;
        broken: number;
        quarantined: number;
    };
    turnout: number;
};

export default function AdminResults({
    election,
    positions,
    chain,
    turnout,
}: Props) {
    const [selected, setSelected] = useState<string>(
        positions[0]?.id.toString() ?? '',
    );

    const current =
        positions.find((p) => p.id.toString() === selected) ?? positions[0];
    const totalVotes = positions.reduce((s, p) => s + p.total_votes, 0);

    const chartData =
        current?.candidates.map((c) => ({
            candidate: c.name,
            votes: c.vote_count,
        })) ?? [];
    const chartConfig = {
        votes: { label: 'Votes', color: 'var(--chart-1)' },
    } satisfies ChartConfig;

    return (
        <>
            <Head title={`Results — ${election.title}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {election.title}
                        </h2>
                        <p className="mt-1 text-muted-foreground">
                            Election results &amp; chain integrity.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/admin/elections/${election.id}/results/fullscreen`}
                            target="_blank"
                        >
                            <HugeiconsIcon
                                icon={ArrowExpand01Icon}
                                size={14}
                                className="mr-1.5"
                            />
                            Present
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Votes
                            </CardTitle>
                            <HugeiconsIcon
                                icon={Analytics01Icon}
                                size={18}
                                className="text-muted-foreground"
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalVotes}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {turnout} voters
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Chain Integrity
                            </CardTitle>
                            {chain.valid ? (
                                <HugeiconsIcon
                                    icon={CheckmarkCircle01Icon}
                                    size={18}
                                    className="text-green-600"
                                />
                            ) : (
                                <HugeiconsIcon
                                    icon={AlertCircleIcon}
                                    size={18}
                                    className="text-destructive"
                                />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {chain.valid ? 'Valid' : 'Broken'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {chain.total} blocks, {chain.quarantined}{' '}
                                quarantined
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Positions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {positions.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {chain.quarantined > 0 && (
                    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
                        <CardContent className="flex items-center gap-3 py-3">
                            <HugeiconsIcon
                                icon={AlertCircleIcon}
                                size={20}
                                className="shrink-0 text-yellow-600"
                            />
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                {chain.quarantined} quarantined vote
                                {chain.quarantined !== 1 ? 's' : ''} detected.
                                Chain valid but review recommended.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {positions.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <CardTitle className="text-base">
                                No votes cast
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Results will appear once voting begins.
                            </CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Results by Position</CardTitle>
                                <CardDescription>
                                    Select a position to view detailed
                                    breakdown.
                                </CardDescription>
                            </div>
                            <Select
                                value={selected}
                                onValueChange={setSelected}
                            >
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={p.id.toString()}
                                        >
                                            {p.title} ({p.total_votes} votes)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {current && (
                                <>
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
                                                dataKey="candidate"
                                                type="category"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={10}
                                                width={120}
                                                tick={{
                                                    fontSize: 13,
                                                    fill: 'var(--foreground)',
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
                                                        ) => label as string}
                                                    />
                                                }
                                            />
                                            <Bar
                                                dataKey="votes"
                                                fill="var(--chart-1)"
                                                radius={[0, 6, 6, 0]}
                                                barSize={28}
                                            />
                                        </BarChart>
                                    </ChartContainer>

                                    <div className="mt-6">
                                        <h4 className="mb-3 text-sm font-medium">
                                            Vote Breakdown
                                        </h4>
                                        <div className="space-y-2">
                                            {current.candidates.map((c, i) => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center gap-4 rounded-lg border p-3"
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                                        {c.photo_url ? (
                                                            <img
                                                                src={
                                                                    c.photo_url
                                                                }
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <HugeiconsIcon
                                                                icon={
                                                                    Analytics01Icon
                                                                }
                                                                size={14}
                                                                className="text-muted-foreground"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {c.name}
                                                        </p>
                                                        {c.department && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {c.department}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="hidden h-2 w-24 flex-1 overflow-hidden rounded-full bg-muted sm:block">
                                                            <div
                                                                className="h-full rounded-full bg-primary transition-all"
                                                                style={{
                                                                    width: `${c.percentage}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="w-12 text-right font-medium tabular-nums">
                                                            {c.vote_count}
                                                        </span>
                                                        <span className="w-14 text-right text-muted-foreground tabular-nums">
                                                            {c.percentage}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

AdminResults.layout = {
    breadcrumbs: [
        { title: 'Elections', href: '/admin/elections' },
        { title: 'Results', href: '#' },
    ],
};
