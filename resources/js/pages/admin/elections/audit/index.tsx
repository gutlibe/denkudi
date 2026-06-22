import { ArrowLeft02Icon, CheckmarkCircle01Icon, Cancel01Icon, Search01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
        previous_hash: string;
        current_hash: string;
        receipt: string;
        status: string;
    }[];
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string;
    };
};

export default function AuditPage({ election, chain, votes, pagination, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

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
                    <Card className="p-3 text-center">
                        <p className="text-lg font-bold">{chain.total}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Votes</p>
                    </Card>
                    <Card className={`p-3 text-center ${chain.broken > 0 ? 'ring-1 ring-destructive/30' : ''}`}>
                        <p className={`text-lg font-bold ${chain.broken > 0 ? 'text-destructive' : 'text-green-500'}`}>{chain.broken}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Broken Links</p>
                    </Card>
                    <Card className={`p-3 text-center ${chain.quarantined > 0 ? 'ring-1 ring-yellow-500/30' : ''}`}>
                        <p className={`text-lg font-bold ${chain.quarantined > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}>{chain.quarantined}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Quarantined</p>
                    </Card>
                    <Card className={`p-3 text-center ${chain.valid ? 'ring-1 ring-green-500/30' : 'ring-1 ring-destructive/30'}`}>
                        <div className={`flex items-center justify-center gap-1.5 ${chain.valid ? 'text-green-500' : 'text-destructive'}`}>
                            <HugeiconsIcon icon={chain.valid ? CheckmarkCircle01Icon : Cancel01Icon} size={16} />
                            <span className="text-lg font-bold">{chain.valid ? 'Valid' : 'Broken'}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Chain Status</p>
                    </Card>
                </div>

                {chain.details.length > 0 && (
                    <Card className="border-destructive/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <HugeiconsIcon icon={Cancel01Icon} size={14} className="text-destructive" />
                                Integrity Issues
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {chain.details.map((d) => (
                                <div key={d.vote_id} className="flex items-center gap-3 rounded bg-destructive/5 px-3 py-1.5 text-xs">
                                    <span className="font-mono text-muted-foreground">#{d.vote_id}</span>
                                    <span className="text-destructive">{d.failures.join(', ')}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <HugeiconsIcon icon={Shield01Icon} size={14} />
                                Hash Chain
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">{pagination.total} records</span>
                            <div className="relative ml-auto w-48">
                                <HugeiconsIcon icon={Search01Icon} size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search receipt..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && router.get(`/admin/elections/${election.id}/audit`, { search }, { preserveState: true })}
                                    className="pl-7 h-7 text-xs"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        {votes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-12">No votes recorded.</p>
                        ) : (
                            <table className="w-full whitespace-nowrap">
                                <thead>
                                    <tr className="border-b text-[11px] text-muted-foreground">
                                        <th className="text-left px-4 py-2 font-medium w-10">#</th>
                                        <th className="text-left px-4 py-2 font-medium">Position</th>
                                        <th className="text-left px-4 py-2 font-medium">Candidate</th>
                                        <th className="text-left px-4 py-2 font-medium font-mono">Prev Hash</th>
                                        <th className="text-left px-4 py-2 font-medium font-mono">Curr Hash</th>
                                        <th className="text-left px-4 py-2 font-medium">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {votes.map((vote) => (
                                        <tr key={vote.id} className={`border-b text-xs last:border-0 ${vote.status !== 'valid' ? 'bg-destructive/5' : ''}`}>
                                            <td className="px-4 py-2.5 text-muted-foreground">{vote.id}</td>
                                            <td className="px-4 py-2.5 font-medium">{vote.position}</td>
                                            <td className="px-4 py-2.5">{vote.candidate}</td>
                                            <td className="px-4 py-2.5 font-mono text-muted-foreground/70">{vote.previous_hash}</td>
                                            <td className="px-4 py-2.5 font-mono">
                                                <span className={vote.status !== 'valid' ? 'text-destructive' : ''}>{vote.current_hash}</span>
                                                {vote.status !== 'valid' && (
                                                    <span className="ml-1.5 text-[9px] text-destructive font-bold uppercase">{vote.status}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">{vote.receipt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === 1}
                            onClick={() => router.get(`/admin/elections/${election.id}/audit`, { page: pagination.current_page - 1 })}
                        >
                            Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Page {pagination.current_page} of {pagination.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => router.get(`/admin/elections/${election.id}/audit`, { page: pagination.current_page + 1 })}
                        >
                            Next
                        </Button>
                    </div>
                )}
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
