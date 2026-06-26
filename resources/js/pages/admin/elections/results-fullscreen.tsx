import {
    AlertCircleIcon,
    Analytics01Icon,
    ArrowLeft02Icon,
    ArrowRight02Icon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    CrownIcon,
    UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

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

const AUTO_ROTATE_MS = 12_000;
const REFRESH_INTERVAL = 30;

export default function ResultsFullscreen({
    election,
    positions: initialPositions,
    chain: initialChain,
    turnout: initialTurnout,
}: Props) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
    const [positions, setPositions] = useState(initialPositions);
    const [chain, setChain] = useState(initialChain);
    const [turnout, setTurnout] = useState(initialTurnout);
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalVotes = positions.reduce((s, p) => s + p.total_votes, 0);
    const current = positions[activeIdx] ?? positions[0];

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    fetch(`/admin/elections/${election.id}/results`, {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    })
                        .then((r) => r.json())
                        .then((data) => {
                            setPositions(data.positions);
                            setChain(data.chain);
                            setTurnout(data.turnout);
                        })
                        .catch(() => {});

                    return REFRESH_INTERVAL;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [election.id]);

    useEffect(() => {
        if (paused || positions.length <= 1) {
return;
}

        intervalRef.current = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % positions.length);
        }, AUTO_ROTATE_MS);

        return () => {
            if (intervalRef.current) {
clearInterval(intervalRef.current);
}
        };
    }, [paused, positions.length]);

    if (positions.length === 0) {
        return (
            <>
                <Head title={`Results — ${election.title}`} />
                <div className="flex min-h-screen items-center justify-center bg-background p-8">
                    <Card className="w-full max-w-md text-center">
                        <CardContent className="flex flex-col items-center gap-4 py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                                <HugeiconsIcon
                                    icon={Analytics01Icon}
                                    size={32}
                                    className="text-muted-foreground"
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    No votes yet
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {election.title} — Results will appear once
                                    voting begins.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    const chartData = current.candidates.map((c) => ({
        candidate: c.name,
        votes: c.vote_count,
        fill:
            current.candidates.indexOf(c) === 0
                ? 'var(--chart-1)'
                : 'var(--chart-2)',
    }));
    const chartConfig = {
        votes: { label: 'Votes', color: 'var(--chart-1)' },
    } satisfies ChartConfig;

    const leader = current.candidates[0];
    const runnerUp = current.candidates[1];

    return (
        <>
            <Head title={`Results — ${election.title}`} />
            <div className="relative flex min-h-screen flex-col bg-background">
                <header className="flex flex-col gap-2 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                            EV
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                                {election.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Live Results
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Badge
                            variant={chain.valid ? 'secondary' : 'destructive'}
                            className="gap-1.5"
                        >
                            <HugeiconsIcon
                                icon={
                                    chain.valid
                                        ? CheckmarkCircle01Icon
                                        : AlertCircleIcon
                                }
                                size={13}
                            />
                            {chain.valid ? 'Chain Valid' : 'Chain Broken'}
                        </Badge>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <HugeiconsIcon icon={Clock01Icon} size={13} />
                            {countdown}s
                        </span>
                    </div>
                </header>

                <div className="flex flex-wrap items-center gap-3 border-b px-6 py-3">
                    <div className="flex items-center gap-1.5 text-sm">
                        <HugeiconsIcon
                            icon={Analytics01Icon}
                            size={15}
                            className="text-muted-foreground"
                        />
                        <span className="font-semibold tabular-nums">
                            {totalVotes}
                        </span>
                        <span className="text-muted-foreground">
                            total votes
                        </span>
                    </div>
                    <span className="text-muted-foreground">&middot;</span>
                    <div className="flex items-center gap-1.5 text-sm">
                        <HugeiconsIcon
                            icon={UserGroupIcon}
                            size={15}
                            className="text-muted-foreground"
                        />
                        <span className="font-semibold tabular-nums">
                            {turnout}
                        </span>
                        <span className="text-muted-foreground">voters</span>
                    </div>
                    <span className="text-muted-foreground">&middot;</span>
                    <span className="text-sm text-muted-foreground">
                        {positions.length} position
                        {positions.length !== 1 ? 's' : ''}
                    </span>
                    {chain.quarantined > 0 && (
                        <>
                            <span className="text-muted-foreground">
                                &middot;
                            </span>
                            <span className="text-sm font-medium text-yellow-600">
                                {chain.quarantined} quarantined
                            </span>
                        </>
                    )}
                </div>

                <main className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
                    <div className="flex flex-1 flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    {current.title}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {current.total_votes} votes cast
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        setPaused(true);
                                        setActiveIdx(
                                            (prev) =>
                                                (prev - 1 + positions.length) %
                                                positions.length,
                                        );
                                    }}
                                >
                                    <HugeiconsIcon
                                        icon={ArrowLeft02Icon}
                                        size={16}
                                    />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setPaused(!paused)}
                                    title={paused ? 'Resume' : 'Pause'}
                                >
                                    <span className="text-xs font-mono tabular-nums">
                                        {paused ? '||' : '||'}
                                    </span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        setPaused(true);
                                        setActiveIdx(
                                            (prev) =>
                                                (prev + 1) % positions.length,
                                        );
                                    }}
                                >
                                    <HugeiconsIcon
                                        icon={ArrowRight02Icon}
                                        size={16}
                                    />
                                </Button>
                                <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                                    {activeIdx + 1}/{positions.length}
                                </span>
                            </div>
                        </div>

                        <Card className="flex-1 overflow-hidden">
                            <CardContent className="h-full p-4 sm:p-6">
                                {current.candidates.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        No candidates for this position.
                                    </div>
                                ) : (
                                    <ChartContainer
                                        config={chartConfig}
                                        className="h-full w-full"
                                    >
                                        <BarChart
                                            data={chartData}
                                            layout="vertical"
                                            margin={{
                                                top: 4,
                                                right: 4,
                                                bottom: 4,
                                                left: 4,
                                            }}
                                            barCategoryGap={
                                                current.candidates.length > 8
                                                    ? 4
                                                    : current.candidates
                                                            .length > 5
                                                      ? 8
                                                      : 12
                                            }
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
                                                width={130}
                                                tick={{
                                                    fontSize: 14,
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
                                                        ) =>
                                                            label as string}
                                                    />
                                                }
                                            />
                                            <Bar
                                                dataKey="votes"
                                                fill="var(--chart-1)"
                                                radius={[0, 6, 6, 0]}
                                                barSize={
                                                    current.candidates.length >
                                                    8
                                                        ? 20
                                                        : current.candidates
                                                                .length > 5
                                                          ? 28
                                                          : 36
                                                }
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex w-full flex-col gap-4 lg:w-80 xl:w-96">
                        <Card>
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">
                                        Live Tally
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {current.total_votes} votes
                                    </span>
                                </div>

                                {current.candidates.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        No candidates
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {current.candidates.map((c, i) => {
                                            const top =
                                                current.candidates[0]
                                                    ?.vote_count ?? 1;

                                            return (
                                                <div
                                                    key={c.id}
                                                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                                                >
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                                        {i + 1}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {c.name}
                                                        </p>
                                                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-700"
                                                                style={{
                                                                    width: `${top > 0 ? (c.vote_count / top) * 100 : 0}%`,
                                                                    background:
                                                                        i === 0
                                                                            ? 'linear-gradient(90deg, var(--chart-1), var(--chart-2))'
                                                                            : `var(--chart-${(i % 12) + 1})`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold tabular-nums">
                                                            {c.vote_count}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground tabular-nums">
                                                            {c.percentage}%
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {leader &&
                            current.total_votes > 0 &&
                            runnerUp &&
                            leader.vote_count > 0 && (
                                <Card className="overflow-hidden border-primary/30 bg-primary/5">
                                    <CardContent className="p-4 sm:p-5">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                            <HugeiconsIcon
                                                icon={CrownIcon}
                                                size={16}
                                            />
                                            Leading
                                        </div>
                                        <p className="mt-1 text-lg font-bold">
                                            {leader.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {leader.vote_count} votes (
                                            {leader.percentage}%) &middot;
                                            Leading by{' '}
                                            {leader.vote_count -
                                                runnerUp.vote_count}{' '}
                                            vote
                                            {leader.vote_count -
                                                runnerUp.vote_count !==
                                            1
                                                ? 's'
                                                : ''}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                        <div className="hidden gap-2 lg:grid lg:grid-cols-2">
                            {positions.map((p, i) => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setPaused(true);
                                        setActiveIdx(i);
                                    }}
                                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:bg-muted ${
                                        i === activeIdx
                                            ? 'border-primary bg-primary/10 font-medium text-primary'
                                            : ''
                                    }`}
                                >
                                    <p className="truncate">{p.title}</p>
                                    <p className="mt-0.5 text-muted-foreground">
                                        {p.total_votes} votes
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </main>

                <footer className="flex items-center justify-between border-t px-6 py-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                            EV
                        </div>
                        <span>HTU E-Voting System</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="hidden sm:inline">
                            Auto-rotating{' '}
                            {paused ? '(paused)' : `every ${AUTO_ROTATE_MS / 1000}s`}
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
