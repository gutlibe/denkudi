import {
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    CrownIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

export default function ResultsFullscreen({
    election,
    positions: initialPositions,
    chain: initialChain,
    turnout: initialTurnout,
}: Props) {
    const [selected, setSelected] = useState<string>(
        initialPositions[0]?.id.toString() ?? '',
    );
    const [countdown, setCountdown] = useState(30);
    const [positions, setPositions] = useState(initialPositions);
    const [chain, setChain] = useState(initialChain);
    const [turnout, setTurnout] = useState(initialTurnout);

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

                    return 30;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [election.id]);

    const current =
        positions.find((p) => p.id.toString() === selected) ?? positions[0];
    const totalVotes = positions.reduce((s, p) => s + p.total_votes, 0);

    return (
        <>
            <Head title={`Results — ${election.title}`} />
            <div className="min-h-screen space-y-6 bg-background p-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                            EV
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {election.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Live Results — HTU E-Voting
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant={chain.valid ? 'secondary' : 'destructive'}
                            className="gap-1.5"
                        >
                            {chain.valid ? (
                                <HugeiconsIcon
                                    icon={CheckmarkCircle01Icon}
                                    size={14}
                                />
                            ) : (
                                <HugeiconsIcon
                                    icon={AlertCircleIcon}
                                    size={14}
                                />
                            )}
                            Chain {chain.valid ? 'Valid' : 'Broken'}
                        </Badge>
                        <Select value={selected} onValueChange={setSelected}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {positions.map((p) => (
                                    <SelectItem
                                        key={p.id}
                                        value={p.id.toString()}
                                    >
                                        {p.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{totalVotes} total votes</span>
                    <span>·</span>
                    <span>{turnout} voters</span>
                    <span>·</span>
                    <span>{positions.length} positions</span>
                    {chain.quarantined > 0 && (
                        <>
                            <span>·</span>
                            <span className="text-yellow-600">
                                {chain.quarantined} quarantined
                            </span>
                        </>
                    )}
                    <span className="ml-auto">Refreshing in {countdown}s</span>
                </div>

                {current && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    {current.title}
                                </CardTitle>
                                <CardDescription>
                                    {current.total_votes} votes cast
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {current.candidates.map((c, i) => {
                                    const isFirst = i === 0;
                                    const isLast =
                                        i === current.candidates.length - 1;

                                    return (
                                        <div key={c.id} className="group">
                                            <div className="mb-1.5 flex items-center gap-4">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                                                    {i + 1}
                                                </span>
                                                <span className="flex-1 truncate text-sm font-medium">
                                                    {c.name}
                                                </span>
                                                <span className="text-sm font-semibold tabular-nums">
                                                    {c.vote_count}
                                                </span>
                                                <span className="w-12 text-right text-sm text-muted-foreground tabular-nums">
                                                    {c.percentage}%
                                                </span>
                                            </div>
                                            <div className="relative h-8 overflow-hidden rounded-lg bg-muted">
                                                <div
                                                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-1000 ease-out"
                                                    style={{
                                                        width: `${Math.max(c.percentage, 3)}%`,
                                                        background: isFirst
                                                            ? 'linear-gradient(90deg, var(--chart-1), var(--chart-2))'
                                                            : isLast
                                                              ? 'linear-gradient(90deg, var(--chart-4), var(--chart-5))'
                                                              : `linear-gradient(90deg, var(--chart-${i + 1}), var(--chart-${i + 2}))`,
                                                    }}
                                                />
                                                {isFirst &&
                                                    current.total_votes > 0 && (
                                                        <span className="absolute inset-y-0 right-3 flex items-center gap-1 text-[11px] font-semibold text-white drop-shadow-sm">
                                                            <HugeiconsIcon
                                                                icon={CrownIcon}
                                                                size={12}
                                                            />
                                                            Leading
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">
                                        Live Tally
                                    </CardTitle>
                                    <CardDescription>
                                        {current.total_votes} votes cast
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {current.candidates.map((c, i) => {
                                        const top =
                                            current.candidates[0]?.vote_count ??
                                            1;

                                        return (
                                            <div
                                                key={c.id}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="w-5 font-mono text-xs text-muted-foreground">
                                                    {i + 1}
                                                </span>
                                                <span className="flex-1 truncate text-sm">
                                                    {c.name}
                                                </span>
                                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${top > 0 ? (c.vote_count / top) * 100 : 0}%`,
                                                            background: `var(--chart-${i + 1})`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="w-10 text-right text-sm font-medium tabular-nums">
                                                    {c.vote_count}
                                                </span>
                                                <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                                                    {c.percentage}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
