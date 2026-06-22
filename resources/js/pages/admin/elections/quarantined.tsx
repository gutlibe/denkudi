import {
    ArrowLeft02Icon,
    AlertDiamondIcon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { dashboard } from '@/routes/admin';

type QuarantinedVote = {
    id: number;
    position: string;
    candidate: string;
    receipt: string;
    previous_hash: string;
    current_hash: string;
};

type Props = {
    election: {
        id: number;
        title: string;
        status: string;
        quarantine_count: number;
    };
    votes: QuarantinedVote[];
    pagination: { current_page: number; last_page: number; total: number };
};

export default function QuarantinedPage({
    election,
    votes,
    pagination,
}: Props) {
    const [dismissingId, setDismissingId] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);

    return (
        <>
            <Head title={`Quarantined Votes — ${election.title}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon-sm" asChild>
                        <Link href={`/admin/elections/${election.id}/audit`}>
                            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Quarantined Votes
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {election.title}
                        </p>
                    </div>
                </div>

                <Card className="border-yellow-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <HugeiconsIcon
                                icon={AlertDiamondIcon}
                                size={14}
                                className="text-yellow-500"
                            />
                            {election.quarantine_count} quarantined vote
                            {election.quarantine_count !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Review each quarantined vote below. Dismissing a
                            vote restores it to valid status and decrements the
                            quarantine counter. Use the Resume action (via the
                            status dropdown on the elections page) to resume
                            voting after review.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        {votes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle01Icon}
                                        size={20}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    No quarantined votes for this election.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full whitespace-nowrap">
                                <thead>
                                    <tr className="border-b text-[11px] text-muted-foreground">
                                        <th className="w-10 px-4 py-2 text-left font-medium">
                                            #
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium">
                                            Position
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium">
                                            Candidate
                                        </th>
                                        <th className="px-4 py-2 text-left font-mono font-medium">
                                            Prev Hash
                                        </th>
                                        <th className="px-4 py-2 text-left font-mono font-medium">
                                            Curr Hash
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium">
                                            Receipt
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {votes.map((vote) => (
                                        <tr
                                            key={vote.id}
                                            className="border-b bg-yellow-500/5 text-xs last:border-0"
                                        >
                                            <td className="px-4 py-2.5 text-muted-foreground">
                                                {vote.id}
                                            </td>
                                            <td className="px-4 py-2.5 font-medium">
                                                {vote.position}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                {vote.candidate}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-muted-foreground/70">
                                                {vote.previous_hash}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-yellow-600">
                                                {vote.current_hash}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
                                                {vote.receipt}
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        busy &&
                                                        dismissingId === vote.id
                                                    }
                                                    onClick={() => {
                                                        setDismissingId(
                                                            vote.id,
                                                        );
                                                        setBusy(true);
                                                        router.patch(
                                                            `/admin/elections/${election.id}/votes/${vote.id}/dismiss`,
                                                            {},
                                                            {
                                                                onFinish:
                                                                    () => {
                                                                        setBusy(
                                                                            false,
                                                                        );
                                                                        setDismissingId(
                                                                            null,
                                                                        );
                                                                    },
                                                            },
                                                        );
                                                    }}
                                                >
                                                    {busy &&
                                                    dismissingId === vote.id ? (
                                                        <Spinner className="mr-1.5" />
                                                    ) : (
                                                        <HugeiconsIcon
                                                            icon={Cancel01Icon}
                                                            size={12}
                                                            className="mr-1"
                                                        />
                                                    )}
                                                    Dismiss
                                                </Button>
                                            </td>
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
                            onClick={() =>
                                router.get(
                                    `/admin/elections/${election.id}/quarantined`,
                                    { page: pagination.current_page - 1 },
                                )
                            }
                        >
                            Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Page {pagination.current_page} of{' '}
                            {pagination.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                pagination.current_page === pagination.last_page
                            }
                            onClick={() =>
                                router.get(
                                    `/admin/elections/${election.id}/quarantined`,
                                    { page: pagination.current_page + 1 },
                                )
                            }
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

QuarantinedPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Elections', href: '/admin/elections' },
        { title: 'Quarantined', href: '#' },
    ],
};
