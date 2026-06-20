import { Head } from '@inertiajs/react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { VoteFlowMobile } from '@/components/vote-flow-mobile';
import { VoteFlowDesktop } from '@/components/vote-flow-desktop';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { dashboard } from '@/routes';

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
};

type Props = {
    activeElections: Election[];
    upcomingElections: Election[];
    pastElections: Election[];
    userName: string;
};

/* ─── Helpers ─── */
const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const formatRelative = (d: string | null) => {
    if (!d) return '—';
    const diff = new Date(d).getTime() - Date.now();
    const days = Math.ceil(diff / 86400000);
    if (days < 0) return 'Ended';
    if (days === 0) return 'Ends today';
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
        <Card className="ring-1 ring-border/50 p-3">
            <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accentBg} ${accentText}`}>
                    <HugeiconsIcon icon={icon} size={16} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-lg font-bold leading-tight">{value}</p>
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
    idx,
    onVoted,
}: {
    election: Election;
    idx: number;
    onVoted: (id: number) => void;
}) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const isMobile = useIsMobile();
    const pct = 20 + ((idx * 37 + 15) % 60);

    const VoteComponent = isMobile ? VoteFlowMobile : VoteFlowDesktop;

    return (
        <>
            <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <LiveBadge />
                                <span className="text-xs text-muted-foreground">{election.scope}</span>
                            </div>
                            <CardTitle className="text-base leading-snug">{election.title}</CardTitle>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <HugeiconsIcon icon={AiSecurity01Icon} size={18} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-muted/50 py-2 px-1">
                            <p className="text-lg font-bold">{election.position_count}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Positions</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 py-2 px-1">
                            <p className="text-lg font-bold">{election.candidate_count}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Candidates</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 py-2 px-1">
                            <p className="text-lg font-bold text-green-500">{pct}%</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Turnout</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                            <span className="flex items-center gap-1">
                                <HugeiconsIcon icon={Clock01Icon} size={11} />
                                {formatDate(election.starts_at)}
                            </span>
                            <span className="font-medium text-foreground">{formatRelative(election.ends_at)}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>

                    {election.has_voted ? (
                        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-500">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />
                            You've already voted
                        </div>
                    ) : (
                        <Button
                            className="w-full gap-2"
                            size="sm"
                            onClick={() => setSheetOpen(true)}
                        >
                            Cast Your Vote
                            <HugeiconsIcon icon={ArrowRight02Icon} size={14} />
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
        <Card className="group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <HugeiconsIcon icon={Calendar01Icon} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">{election.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {election.scope} · {election.position_count} position{election.position_count !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400 bg-blue-500/10 mb-1">
                            Scheduled
                        </Badge>
                        <p className="text-xs text-muted-foreground">{formatDate(election.starts_at)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ─── Past Election Card ─── */
function PastElectionCard({ election, idx }: { election: Election; idx: number }) {
    const pct = 55 + ((idx * 13 + 7) % 40);
    return (
        <Card className="group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 opacity-80 hover:opacity-100">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <HugeiconsIcon icon={Analytics01Icon} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">{election.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {election.scope} · {election.candidate_count} candidate{election.candidate_count !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                        {election.has_voted ? (
                            <div className="flex items-center gap-1 text-xs text-green-500">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
                                Voted
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">Not voted</p>
                        )}
                        <p className="text-xs font-semibold">{pct}% turnout</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ─── Section Header ─── */
function SectionHeader({ icon, label, count, accentBg, accentText }: {
    icon: IconSvgElement;
    label: string;
    count?: number;
    accentBg: string;
    accentText: string;
}) {
    return (
        <div className="flex items-center gap-2.5 mb-4">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accentBg} ${accentText}`}>
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

/* ─── Placeholder Data ─── */
const PLACEHOLDER_ACTIVE: Election[] = [
    {
        id: 1, title: 'Student Union President 2025', type_label: 'General', status_label: 'Active',
        status: 'active', scope: 'University-Wide', description: null,
        starts_at: '2025-06-15T00:00:00Z', ends_at: new Date(Date.now() + 2 * 86400000).toISOString(),
        is_active: true, has_voted: false, position_count: 3, candidate_count: 12,
    },
    {
        id: 2, title: 'Faculty of Engineering Elections', type_label: 'Faculty', status_label: 'Active',
        status: 'active', scope: 'Faculty', description: null,
        starts_at: '2025-06-17T00:00:00Z', ends_at: new Date(Date.now() + 4 * 86400000).toISOString(),
        is_active: true, has_voted: true, position_count: 5, candidate_count: 18,
    },
];

const PLACEHOLDER_UPCOMING: Election[] = [
    {
        id: 3, title: 'Departmental Rep Elections – CS', type_label: 'Department', status_label: 'Scheduled',
        status: 'scheduled', scope: 'Department', description: null,
        starts_at: new Date(Date.now() + 7 * 86400000).toISOString(), ends_at: new Date(Date.now() + 10 * 86400000).toISOString(),
        is_active: false, has_voted: false, position_count: 2, candidate_count: 6,
    },
    {
        id: 4, title: 'Hall of Residence Committee', type_label: 'Hall', status_label: 'Scheduled',
        status: 'scheduled', scope: 'Hall', description: null,
        starts_at: new Date(Date.now() + 14 * 86400000).toISOString(), ends_at: new Date(Date.now() + 17 * 86400000).toISOString(),
        is_active: false, has_voted: false, position_count: 4, candidate_count: 9,
    },
    {
        id: 5, title: 'SRC General Elections Q3', type_label: 'General', status_label: 'Scheduled',
        status: 'scheduled', scope: 'University-Wide', description: null,
        starts_at: new Date(Date.now() + 21 * 86400000).toISOString(), ends_at: new Date(Date.now() + 24 * 86400000).toISOString(),
        is_active: false, has_voted: false, position_count: 7, candidate_count: 24,
    },
];

const PLACEHOLDER_PAST: Election[] = [
    {
        id: 6, title: 'Student Union President 2024', type_label: 'General', status_label: 'Closed',
        status: 'closed', scope: 'University-Wide', description: null,
        starts_at: '2024-06-01T00:00:00Z', ends_at: '2024-06-05T00:00:00Z',
        is_active: false, has_voted: true, position_count: 3, candidate_count: 10,
    },
    {
        id: 7, title: 'Faculty of Science Elections 2024', type_label: 'Faculty', status_label: 'Closed',
        status: 'closed', scope: 'Faculty', description: null,
        starts_at: '2024-05-10T00:00:00Z', ends_at: '2024-05-14T00:00:00Z',
        is_active: false, has_voted: false, position_count: 4, candidate_count: 13,
    },
    {
        id: 8, title: 'SRC Mid-Year By-Elections', type_label: 'General', status_label: 'Closed',
        status: 'closed', scope: 'University-Wide', description: null,
        starts_at: '2024-03-20T00:00:00Z', ends_at: '2024-03-23T00:00:00Z',
        is_active: false, has_voted: true, position_count: 2, candidate_count: 7,
    },
];

/* ─── Page ─── */
export default function DashboardPage({ activeElections, upcomingElections, pastElections, userName }: Props) {
    const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

    const rawActive = activeElections.length ? activeElections : PLACEHOLDER_ACTIVE;
    const upcoming = upcomingElections.length ? upcomingElections : PLACEHOLDER_UPCOMING;
    const past = pastElections.length ? pastElections : PLACEHOLDER_PAST;

    // Merge optimistic voted state
    const active = rawActive.map((e) => votedIds.has(e.id) ? { ...e, has_voted: true } : e);

    const totalVoted = [...active, ...past].filter((e) => e.has_voted).length;
    const totalElections = active.length + upcoming.length + past.length;

    const markVoted = (id: number) => setVotedIds((s) => new Set(s).add(id));

    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-8">

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
                        Welcome, <span className="font-medium text-foreground">{userName.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground">
                        <HugeiconsIcon icon={Clock01Icon} size={13} />
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>

                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mt-4">
                    <StatCard label="Total" value={totalElections} icon={Analytics01Icon} accentBg="bg-primary/15" accentText="text-primary" />
                    <StatCard label="Active" value={active.length} icon={AiMagicIcon} accentBg="bg-green-500/15" accentText="text-green-500" />
                    <StatCard label="Voted" value={totalVoted} icon={AiSecurity01Icon} accentBg="bg-violet-500/15" accentText="text-violet-400" />
                    <StatCard label="Upcoming" value={upcoming.length} icon={Calendar01Icon} accentBg="bg-blue-500/15" accentText="text-blue-400" />
                </div>

                <section>
                    <SectionHeader icon={AiMagicIcon} label="Active Voting" count={active.length} accentBg="bg-green-500/15" accentText="text-green-500" />
                    {active.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <HugeiconsIcon icon={GraduationCapIcon} size={22} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">No active elections</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Check back when voting opens.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {active.map((e, i) => (
                                <ActiveElectionCard key={e.id} election={e} idx={i} onVoted={markVoted} />
                            ))}
                        </div>
                    )}
                </section>

                <Separator className="opacity-50" />

                <section>
                    <SectionHeader icon={Calendar01Icon} label="Upcoming Elections" count={upcoming.length} accentBg="bg-blue-500/15" accentText="text-blue-400" />
                    {upcoming.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <HugeiconsIcon icon={Calendar01Icon} size={22} />
                                </div>
                                <p className="text-sm text-muted-foreground">No upcoming elections scheduled.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {upcoming.map((e) => <UpcomingElectionCard key={e.id} election={e} />)}
                        </div>
                    )}
                </section>

                <Separator className="opacity-50" />

                <section>
                    <SectionHeader icon={Analytics01Icon} label="Past Elections" count={past.length} accentBg="bg-muted" accentText="text-muted-foreground" />
                    {past.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <HugeiconsIcon icon={Analytics01Icon} size={22} />
                                </div>
                                <p className="text-sm text-muted-foreground">No past elections yet.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {past.map((e, i) => <PastElectionCard key={e.id} election={e} idx={i} />)}
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
