import { Head, Link } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon, CheckmarkCircle01Icon, Cancel01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';

type Props = {
    election: { id: number; title: string; status: string };
    chain: {
        valid: boolean;
        total: number;
        broken: number;
        quarantined: number;
        details: { vote_id: number; failures: string[] }[];
    };
    votes: {
        id: number;
        position: string;
        candidate: string;
        receipt_token: string;
        previous_hash: string;
        current_hash: string;
        status: string;
    }[];
};

export default function AuditPage({ election, chain, votes }: Props) {
    return (
        <>
            <Head title={`Chain Audit — ${election.title}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon-sm" asChild>
                        <Link href="/admin/elections">
                            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Chain Audit</h2>
                        <p className="text-sm text-muted-foreground">{election.title}</p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold">{chain.total}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Votes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className={`text-2xl font-bold ${chain.broken > 0 ? 'text-destructive' : 'text-green-500'}`}>{chain.broken}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Broken Links</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className={`text-2xl font-bold ${chain.quarantined > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}>{chain.quarantined}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quarantined</p>
                        </CardContent>
                    </Card>
                    <Card className={chain.valid ? 'border-green-500/30' : 'border-destructive/30'}>
                        <CardContent className="p-4 text-center">
                            <div className={`flex items-center justify-center gap-1.5 ${chain.valid ? 'text-green-500' : 'text-destructive'}`}>
                                <HugeiconsIcon icon={chain.valid ? CheckmarkCircle01Icon : Cancel01Icon} size={18} />
                                <span className="text-lg font-bold">{chain.valid ? 'Valid' : 'Broken'}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Chain Status</p>
                        </CardContent>
                    </Card>
                </div>

                {chain.details.length > 0 && (
                    <Card className="border-destructive/30">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-destructive" />
                                Integrity Issues
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {chain.details.map((d) => (
                                <div key={d.vote_id} className="flex items-center gap-3 rounded-lg bg-destructive/5 px-4 py-2.5 text-sm">
                                    <span className="font-mono text-xs text-muted-foreground">Vote #{d.vote_id}</span>
                                    <span className="text-destructive">{d.failures.join(', ')}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <HugeiconsIcon icon={Shield01Icon} size={16} />
                            Hash Chain
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {votes.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No votes recorded.</p>
                            ) : (
                                votes.map((vote, i) => (
                                    <div
                                        key={vote.id}
                                        className={`flex flex-col gap-1 rounded-lg px-4 py-2.5 text-xs font-mono ${vote.status === 'valid' ? 'bg-muted/30' : 'bg-destructive/5 border border-destructive/20'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-foreground">#{vote.id} — {vote.position} · {vote.candidate}</span>
                                            {vote.status !== 'valid' && (
                                                <span className="text-[10px] text-destructive font-bold uppercase">{vote.status}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-4 text-muted-foreground">
                                            <span>Prev: {vote.previous_hash}</span>
                                            <span>Curr: {vote.current_hash}</span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground/60">Receipt: {vote.receipt_token}</div>
                                        {i < votes.length - 1 && (
                                            <div className="text-center text-[10px] text-muted-foreground/30">↓</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AuditPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Elections', href: '/admin/elections' },
        { title: 'Audit', href: '#' },
    ],
};
