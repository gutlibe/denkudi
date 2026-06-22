import { CheckmarkCircle01Icon, UserIcon, ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

type Candidate = { id: number; name: string; department: string | null; manifesto: string | null; photo_url: string | null };
type Position = { id: number; title: string; max_selections: number; candidates: Candidate[] };
type Props = { election: { id: number; title: string; description?: string | null; positions?: Position[] }; alreadyVoted: boolean; receipt?: string };

export default function BallotPage({ election, alreadyVoted, receipt }: Props) {
    const [selections, setSelections] = useState<Record<number, number[]>>({});
    const [reviewing, setReviewing] = useState(false);

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
                        <CardDescription className="mt-2">Your vote for {election.title} has been recorded.</CardDescription>
                        {receipt && (
                            <div className="mt-6 rounded-lg bg-muted px-6 py-3">
                                <p className="text-xs text-muted-foreground mb-1">Your receipt token</p>
                                <p className="text-xl font-mono font-bold tracking-wider">{receipt}</p>
                                <p className="text-xs text-muted-foreground mt-2">Save this — you can use it to verify your vote later.</p>
                            </div>
                        )}
                        <Button asChild variant="outline" className="mt-6">
                            <Link href={dashboard()}>
                                <HugeiconsIcon icon={ArrowLeft02Icon} size={14} className="mr-1.5" />
                                Back to Dashboard
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </>
        );
    }

    const positions = election.positions ?? [];

    const toggle = (positionId: number, candidateId: number, max: number) => {
        setSelections((s) => {
            const current = s[positionId] ?? [];
            if (current.includes(candidateId)) return { ...s, [positionId]: current.filter((id) => id !== candidateId) };
            if (max === 1) return { ...s, [positionId]: [candidateId] };
            if (current.length >= max) return s;
            return { ...s, [positionId]: [...current, candidateId] };
        });
    };

    const isSelected = (positionId: number, candidateId: number) =>
        (selections[positionId] ?? []).includes(candidateId);

    const getCandidate = (pid: number, cid: number) =>
        positions.find((p) => p.id === pid)?.candidates.find((c) => c.id === cid);

    const submit = () => {
        const ballot = Object.entries(selections).flatMap(([posId, candIds]) =>
            candIds.map((candId) => ({ position_id: parseInt(posId), candidate_id: candId }))
        );
        router.post(`/elections/${election.id}/vote`, { ballot }, { preserveState: true });
    };

    const allSelected = positions.every((p) => (selections[p.id]?.length ?? 0) > 0);

    if (reviewing) {
        return (
            <>
                <Head title={`Review — ${election.title}`} />
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Review Your Ballot</h2>
                        <p className="text-muted-foreground mt-1">Please confirm your selections before submitting. You cannot change your vote after submission.</p>
                    </div>
                    <Card>
                        <CardContent className="divide-y">
                            {positions.map((pos) => {
                                const selected = selections[pos.id] ?? [];
                                return (
                                    <div key={pos.id} className="py-4 first:pt-4 last:pb-4">
                                        <p className="text-sm font-medium mb-2">{pos.title}</p>
                                        <div className="space-y-2">
                                            {selected.map((cid) => {
                                                const c = getCandidate(pos.id, cid);
                                                return (
                                                    <div key={cid} className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                                                            {c?.photo_url ? <img src={c.photo_url} alt="" className="h-full w-full object-cover" /> : <HugeiconsIcon icon={UserIcon} size={14} />}
                                                        </div>
                                                        <span className="text-sm">{c?.name ?? '—'}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                    <div className="flex gap-3">
                        <Button variant="outline" size="lg" className="flex-1" onClick={() => setReviewing(false)}>
                            <HugeiconsIcon icon={ArrowLeft02Icon} size={14} className="mr-1.5" />Go Back
                        </Button>
                        <Button size="lg" className="flex-1" onClick={submit}>
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="mr-1.5" />Confirm &amp; Submit
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Vote — ${election.title}`} />
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{election.title}</h2>
                    {election.description && <p className="text-muted-foreground mt-1">{election.description}</p>}
                </div>
                <div className="space-y-6">
                    {positions.map((pos) => (
                        <Card key={pos.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{pos.title}</CardTitle>
                                <CardDescription>
                                    {pos.max_selections === 1 ? 'Select one candidate' : `Select up to ${pos.max_selections}`}
                                    {pos.max_selections > 1 && (
                                        <span className="ml-1 text-muted-foreground">
                                            ({selections[pos.id]?.length ?? 0}/{pos.max_selections})
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {pos.candidates.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => toggle(pos.id, c.id, pos.max_selections)}
                                            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                                                isSelected(pos.id, c.id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/40'
                                            }`}
                                        >
                                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
                                                style={{
                                                    borderColor: isSelected(pos.id, c.id) ? 'var(--primary)' : 'var(--border)',
                                                    background: isSelected(pos.id, c.id) ? 'var(--primary)' : 'transparent',
                                                }}
                                            >
                                                {isSelected(pos.id, c.id) && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-primary-foreground" />}
                                            </div>
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                                                {c.photo_url ? <img src={c.photo_url} alt={c.name} className="h-full w-full object-cover" /> : <HugeiconsIcon icon={UserIcon} size={18} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">{c.name}</p>
                                                {c.department && <p className="text-xs text-muted-foreground">{c.department}</p>}
                                                {c.manifesto && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.manifesto}</p>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Button size="lg" className="w-full" disabled={!allSelected} onClick={() => setReviewing(true)}>Review Ballot</Button>
            </div>
        </>
    );
}
