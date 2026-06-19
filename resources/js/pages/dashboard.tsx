import { Head, Link } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    ArrowRight02Icon,
    Analytics01Icon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    GraduationCapIcon,
} from '@hugeicons/core-free-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

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

const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const statusBadge = (status: string) => {
    const m: Record<string, string> = {
        active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        closed: 'bg-neutral-100 text-neutral-700',
        paused_for_review: 'bg-yellow-100 text-yellow-700',
    };
    return m[status] ?? 'bg-muted text-muted-foreground';
};

function ElectionCard({ election }: { election: Election }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-base">{election.title}</CardTitle>
                        <CardDescription>
                            {election.scope} &middot; {election.position_count} position{election.position_count !== 1 ? 's' : ''}
                            &middot; {election.candidate_count} candidate{election.candidate_count !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    <Badge className={statusBadge(election.status)} variant="outline">{election.status_label}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><HugeiconsIcon icon={Clock01Icon} size={14} />{formatDate(election.starts_at)} — {formatDate(election.ends_at)}</span>
                </div>
                {election.is_active && (
                    <>
                        {election.has_voted ? (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                                You've voted in this election.
                            </div>
                        ) : (
                            <Button asChild size="sm">
                                <Link href={`/elections/${election.id}/vote`}>
                                    Vote Now
                                    <HugeiconsIcon icon={ArrowRight02Icon} size={14} className="ml-1" />
                                </Link>
                            </Button>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function EmptySection({ title, description }: { title: string; description: string }) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <HugeiconsIcon icon={Analytics01Icon} size={24} />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage({ activeElections, upcomingElections, pastElections, userName }: Props) {
    const hasContent = activeElections.length > 0 || upcomingElections.length > 0 || pastElections.length > 0;

    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome back, {userName}</h2>
                    <p className="text-muted-foreground">Here are your elections.</p>
                </div>

                {!hasContent ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                                <HugeiconsIcon icon={GraduationCapIcon} size={32} />
                            </div>
                            <CardTitle className="text-xl">No elections yet</CardTitle>
                            <CardDescription className="mt-2 text-base">Check back when elections are scheduled.</CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {activeElections.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Voting</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {activeElections.map((e) => <ElectionCard key={e.id} election={e} />)}
                                </div>
                            </section>
                        )}

                        {upcomingElections.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {upcomingElections.map((e) => <ElectionCard key={e.id} election={e} />)}
                                </div>
                            </section>
                        )}

                        {pastElections.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Past</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {pastElections.map((e) => <ElectionCard key={e.id} election={e} />)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

DashboardPage.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
