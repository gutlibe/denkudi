import { Head, Link } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon, Analytics01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { results } from '@/routes/elections';

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

export default function ResultsPage({ election, positions }: Props) {
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
                        <h2 className="text-xl font-bold tracking-tight">{election.title}</h2>
                        <p className="text-sm text-muted-foreground">
                            {notReleased ? 'Official results pending publication.' : `Live results · ${positions.reduce((s, p) => s + p.total_votes, 0)} total votes`}
                        </p>
                    </div>
                </div>

                {notReleased ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                <HugeiconsIcon icon={Analytics01Icon} size={32} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold">Results Pending</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    Official results have not been published for this election yet. Please check back later.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : positions.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <HugeiconsIcon icon={Analytics01Icon} size={22} />
                            </div>
                            <p className="text-sm text-muted-foreground">No results available yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {positions.map((position) => (
                            <Card key={position.id}>
                                <CardHeader>
                                    <div className="flex items-baseline justify-between">
                                        <CardTitle className="text-base">{position.title}</CardTitle>
                                        <span className="text-xs text-muted-foreground">{position.total_votes} vote{position.total_votes !== 1 ? 's' : ''}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {position.candidates.map((candidate) => {
                                        const maxVotes = position.candidates[0]?.vote_count || 1;
                                        const width = maxVotes > 0 ? (candidate.vote_count / maxVotes) * 100 : 0;
                                        const isWinner = position.total_votes > 0 && candidate.vote_count === maxVotes && maxVotes > 0;

                                        return (
                                            <div key={candidate.id} className="space-y-1.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                                                        {candidate.photo_url ? (
                                                            <img src={candidate.photo_url} alt={candidate.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <HugeiconsIcon icon={UserIcon} size={14} className="text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium truncate">{candidate.name}</p>
                                                            {isWinner && (
                                                                <span className="text-[10px] font-semibold text-primary">Leading</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${isWinner ? 'bg-primary' : 'bg-primary/40'}`}
                                                                    style={{ width: `${width}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
                                                                {candidate.percentage}%
                                                            </span>
                                                            <span className="text-xs font-medium w-10 text-right shrink-0">
                                                                {candidate.vote_count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ))}
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
