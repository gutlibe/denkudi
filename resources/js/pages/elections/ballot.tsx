import { Head, router } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

type Candidate = {
    id: number;
    name: string;
    department: string | null;
    manifesto: string | null;
    photo_url: string | null;
};

type Position = {
    id: number;
    title: string;
    max_selections: number;
    candidates: Candidate[];
};

type Props = {
    election: {
        id: number;
        title: string;
        description?: string | null;
        positions?: Position[];
    };
    alreadyVoted: boolean;
    receipt?: string;
};

export default function BallotPage({ election, alreadyVoted, receipt }: Props) {
    const [selections, setSelections] = useState<Record<number, number>>({});

    if (alreadyVoted) {
        return (
            <>
                <Head title="Vote Submitted" />
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-600 mb-4">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={36} />
                        </div>
                        <CardTitle className="text-xl">Vote Submitted</CardTitle>
                        <CardDescription className="mt-2">
                            Your vote for {election.title} has been recorded.
                        </CardDescription>
                        {receipt && (
                            <div className="mt-6 rounded-lg bg-muted px-6 py-3">
                                <p className="text-xs text-muted-foreground mb-1">Your receipt token</p>
                                <p className="text-xl font-mono font-bold tracking-wider">{receipt}</p>
                                <p className="text-xs text-muted-foreground mt-2">Save this — you can use it to verify your vote later.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </>
        );
    }

    const positions = election.positions ?? [];

    const select = (positionId: number, candidateId: number) => {
        setSelections((s) => ({ ...s, [positionId]: candidateId }));
    };

    const submit = () => {
        const ballot = Object.entries(selections).map(([posId, candId]) => ({
            position_id: parseInt(posId),
            candidate_id: candId,
        }));

        router.post(`/elections/${election.id}/vote`, { ballot }, {
            preserveState: true,
        });
    };

    const allSelected = positions.every((p) => selections[p.id] !== undefined);

    return (
        <>
            <Head title={`Vote — ${election.title}`} />
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{election.title}</h2>
                    {election.description && <p className="text-muted-foreground mt-1">{election.description}</p>}
                </div>

                <div className="space-y-6">
                    {positions.map((position) => (
                        <Card key={position.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{position.title}</CardTitle>
                                <CardDescription>
                                    {position.max_selections === 1 ? 'Select one candidate' : `Select up to ${position.max_selections}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {position.candidates.map((candidate) => (
                                        <button
                                            key={candidate.id}
                                            type="button"
                                            onClick={() => select(position.id, candidate.id)}
                                            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                                                selections[position.id] === candidate.id
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                    : 'hover:border-primary/40'
                                            }`}
                                        >
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary overflow-hidden">
                                                {candidate.photo_url ? (
                                                    <img src={candidate.photo_url} alt={candidate.name} className="h-12 w-12 object-cover" />
                                                ) : (
                                                    <HugeiconsIcon icon={UserIcon} size={20} />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">{candidate.name}</p>
                                                {candidate.department && (
                                                    <p className="text-xs text-muted-foreground">{candidate.department}</p>
                                                )}
                                                {candidate.manifesto && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{candidate.manifesto}</p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Button size="lg" className="w-full" disabled={!allSelected} onClick={submit}>
                    Submit Ballot
                </Button>
            </div>
        </>
    );
}
