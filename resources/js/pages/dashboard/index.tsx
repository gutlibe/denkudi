import {
    ArrowRight02Icon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    Analytics01Icon,
    Calendar01Icon,
    GraduationCapIcon,
    AiMagicIcon,
    AiSecurity01Icon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VoteFlowDesktop } from '@/components/vote-flow-desktop';
import { VoteFlowMobile } from '@/components/vote-flow-mobile';
import { useIsMobile } from '@/hooks/use-mobile';
import { dashboard } from '@/routes';
import { results } from '@/routes/elections';

/* ─── Types ─── */
type Election = {
    id: number;
    title: string;
    type_label: string;
    status_label: string;
    status: string;
    scope: string;
    description: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    has_voted: boolean;
    position_count: number;
    candidate_count: number;
    voter_count: number;
    total_voters: number;
};

type Props = {
    activeElections: Election[];
    upcomingElections: Election[];
    pastElections: Election[];
    userName: string;
};

/* ─── Helpers ─── */
const formatDate = (d: string | null) =>
    d
        ? new Date(d).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '—';

const formatRelative = (d: string | null) => {
    if (!d) {
        return '—';
    }

    const diff = new Date(d).getTime() - Date.now();
    const days = Math.ceil(diff / 86400000);

    if (days < 0) {
        return 'Ended';
    }

    if (days === 0) {
        return 'Ends today';
    }

    return `${days}d left`;
};

/* ─── Stat Card ─── */
function StatCard({
    label,
    value,
    icon,
    accentBg,
    accentText,
}: {
    label: string;
    value: string | number;
    icon: IconSvgElement;
    accentBg: string;
    accentText: string;
}) {
    return (
        <Card className="p-3 ring-1 ring-border/50">
            <div className="flex items-center gap-2.5">
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accentBg} ${accentText}`}
                >
                    <HugeiconsIcon icon={icon} size={16} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="text-lg leading-tight font-bold">{value}</p>
                </div>
            </div>
        </Card>
    );
}

/* ─── Live badge ─── */
function LiveBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-500">
            <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            LIVE
        </span>
    );
}

/* ─── Active Election Card ─── */
function ActiveElectionCard({
    election,
    onVoted,
}: {
    election: Election;
    onVoted: (id: number) => void;
}) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const isMobile = useIsMobile();
    const pct =
        election.total_voters > 0
            ? Math.round((election.voter_count / election.total_voters) * 100)
            : 0;

    const VoteComponent = isMobile ? VoteFlowMobile : VoteFlowDesktop;

    return (
        <>
            <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                                <LiveBadge />
                                <span className="text-xs text-muted-foreground">
                                    {election.scope}
                                </span>
                            </div>
                            <CardTitle className="text-base leading-snug">
                                {election.title}
                            </CardTitle>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <HugeiconsIcon icon={AiSecurity01Icon} size={18} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-muted/50 px-1 py-2">
                            <p className="text-lg font-bold">
                                {election.position_count}
                            </p>
                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                Positions
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 px-1 py-2">
                            <p className="text-lg font-bold">
                                {election.candidate_count}
                            </p>
                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                Candidates
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 px-1 py-2">
                            <p className="text-lg font-bold text-green-500">
                                {pct}%
                            </p>
                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                Turnout
                            </p>
                        </div>
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <HugeiconsIcon icon={Clock01Icon} size={11} />
                                {formatDate(election.starts_at)}
                            </span>
                            <span className="font-medium text-foreground">
                                {formatRelative(election.ends_at)}
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>

                    {election.has_voted ? (
                        <>
                            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-500">
                                <HugeiconsIcon
                                    icon={CheckmarkCircle01Icon}
                                    size={15}
                                />
                                You've already voted
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full gap-2"
                                size="sm"
                            >
                                <Link href={results({ election: election.id })}>
                                    <HugeiconsIcon
                                        icon={Analytics01Icon}
                                        size={14}
                                    />
                                    View Results
                                </Link>
                            </Button>
                        </>
                    ) : election.is_active ? (
                        <Button
                            className="w-full gap-2"
                            size="sm"
                            onClick={() => setSheetOpen(true)}
                        >
                            Cast Your Vote
                            <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
                        </Button>
                    ) : (
                        <Button
                            asChild
                            variant="outline"
                            className="w-full gap-2"
                            size="sm"
                        >
                            <Link href={results({ election: election.id })}>
                                <HugeiconsIcon
                                    icon={Analytics01Icon}
                                    size={14}
                                />
                                View Results
                            </Link>
                        </Button>
                    )}
                </CardContent>
            </Card>

            <VoteComponent
                election={election}
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onVoted={() => onVoted(election.id)}
            />
        </>
    );
}

/* ─── Upcoming Election Card ─── */
function UpcomingElectionCard({ election }: { election: Election }) {
    return (
        <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <HugeiconsIcon icon={Calendar01Icon} size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm leading-tight font-semibold">
                            {election.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {election.scope} · {election.position_count}{' '}
                            position{election.position_count !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <Badge
                            variant="outline"
                            className="mb-1 border-blue-500/30 bg-blue-500/10 text-[10px] text-blue-400"
                        >
                            Scheduled
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                            {formatDate(election.starts_at)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ─── Past Election Card ─── */
function PastElectionCard({ election }: { election: Election }) {
    const pct =
        election.total_voters > 0
            ? Math.round((election.voter_count / election.total_voters) * 100)
            : 0;

    return (
        <Link
            href={results({ election: election.id })}
            className="group block opacity-80 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100"
        >
            <Card className="hover:shadow-md">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <HugeiconsIcon icon={Analytics01Icon} size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm leading-tight font-semibold">
                                {election.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {election.scope} · {election.candidate_count}{' '}
                                candidate
                                {election.candidate_count !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="shrink-0 space-y-1 text-right">
                            {election.has_voted ? (
                                <div className="flex items-center gap-1 text-xs text-green-500">
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle01Icon}
                                        size={12}
                                    />
                                    Voted
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Not voted
                                </p>
                            )}
                            <p className="text-xs font-semibold">
                                {pct}% turnout
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

/* ─── Section Header ─── */
function SectionHeader({
    icon,
    label,
    count,
    accentBg,
    accentText,
}: {
    icon: IconSvgElement;
    label: string;
    count?: number;
    accentBg: string;
    accentText: string;
}) {
    return (
        <div className="mb-4 flex items-center gap-2.5">
            <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${accentBg} ${accentText}`}
            >
                <HugeiconsIcon icon={icon} size={14} />
            </div>
            <h3 className="text-sm font-semibold tracking-wide">{label}</h3>
            {count !== undefined && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-bold text-muted-foreground">
                    {count}
                </span>
            )}
        </div>
    );
}

/* ─── Page ─── */
export default function DashboardPage({
    activeElections,
    upcomingElections,
    pastElections,
    userName,
}: Props) {
    const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

    const active = activeElections.map((e) =>
        votedIds.has(e.id) ? { ...e, has_voted: true } : e,
    );

    const totalVoted = [...active, ...pastElections].filter(
        (e) => e.has_voted,
    ).length;
    const totalElections =
        active.length + upcomingElections.length + pastElections.length;

    const markVoted = (id: number) => setVotedIds((s) => new Set(s).add(id));

    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
                        Welcome,{' '}
                        <span className="font-medium text-foreground">
                            {userName.split(' ')[0]}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
                        <HugeiconsIcon icon={Clock01Icon} size={13} />
                        {new Date().toLocaleDateString('en-GB', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard
                        label="Total"
                        value={totalElections}
                        icon={Analytics01Icon}
                        accentBg="bg-primary/15"
                        accentText="text-primary"
                    />
                    <StatCard
                        label="Active"
                        value={active.length}
                        icon={AiMagicIcon}
                        accentBg="bg-green-500/15"
                        accentText="text-green-500"
                    />
                    <StatCard
                        label="Voted"
                        value={totalVoted}
                        icon={AiSecurity01Icon}
                        accentBg="bg-violet-500/15"
                        accentText="text-violet-400"
                    />
                    <StatCard
                        label="Upcoming"
                        value={upcomingElections.length}
                        icon={Calendar01Icon}
                        accentBg="bg-blue-500/15"
                        accentText="text-blue-400"
                    />
                </div>

                <section>
                    <SectionHeader
                        icon={AiMagicIcon}
                        label="Active Voting"
                        count={active.length}
                        accentBg="bg-green-500/15"
                        accentText="text-green-500"
                    />
                    {active.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <HugeiconsIcon
                                        icon={GraduationCapIcon}
                                        size={22}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        No active elections
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Check back when voting opens.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {active.map((e) => (
                                <ActiveElectionCard
                                    key={e.id}
                                    election={e}
                                    onVoted={markVoted}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <Separator className="opacity-50" />

                <section>
                    <SectionHeader
                        icon={Calendar01Icon}
                        label="Upcoming Elections"
                        count={upcomingElections.length}
                        accentBg="bg-blue-500/15"
                        accentText="text-blue-400"
                    />
                    {upcomingElections.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <HugeiconsIcon
                                        icon={Calendar01Icon}
                                        size={22}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    No upcoming elections scheduled.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {upcomingElections.map((e) => (
                                <UpcomingElectionCard key={e.id} election={e} />
                            ))}
                        </div>
                    )}
                </section>

                <Separator className="opacity-50" />

                <section>
                    <SectionHeader
                        icon={Analytics01Icon}
                        label="Past Elections"
                        count={pastElections.length}
                        accentBg="bg-muted"
                        accentText="text-muted-foreground"
                    />
                    {pastElections.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <HugeiconsIcon
                                        icon={Analytics01Icon}
                                        size={22}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    No past elections yet.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {pastElections.map((e) => (
                                <PastElectionCard key={e.id} election={e} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

DashboardPage.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
