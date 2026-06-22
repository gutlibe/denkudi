import {
    CheckmarkCircle01Icon,
    Search01Icon,
    Cancel01Icon,
    AlertDiamondIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard, verify as verifyRoute } from '@/routes';

type VoteDetail = { position: string; candidate: string; status: string };

type Props = {
    result: {
        found: boolean;
        election?: string;
        positions?: number;
        total_votes?: number;
        status?: string;
        details?: VoteDetail[];
    } | null;
    token: string | null;
};

export default function VerifyPage({ result, token: initialToken }: Props) {
    const [token, setToken] = useState(initialToken || '');

    return (
        <>
            <Head title="Verify Vote" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">
                        Verify Your Vote
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Paste your receipt token to confirm your vote was
                        recorded.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <HugeiconsIcon icon={Search01Icon} size={16} />
                            Enter Receipt Token
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();

                                if (token.trim()) {
                                    window.location.href = verifyRoute.url({
                                        query: { token: token.trim() },
                                    });
                                }
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="HTU-XXXX-XXXX-XXXX"
                                className="font-mono text-sm"
                                autoFocus
                            />
                            <Button type="submit" disabled={!token.trim()}>
                                Verify
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {result && (
                    <Card
                        className={
                            result.found
                                ? result.status === 'valid'
                                    ? 'border-green-500/30'
                                    : 'border-yellow-500/30'
                                : 'border-destructive/30'
                        }
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                {result.found ? (
                                    <>
                                        <div
                                            className={`flex h-7 w-7 items-center justify-center rounded-full ${result.status === 'valid' ? 'bg-green-500/15 text-green-500' : 'bg-yellow-500/15 text-yellow-500'}`}
                                        >
                                            <HugeiconsIcon
                                                icon={
                                                    result.status === 'valid'
                                                        ? CheckmarkCircle01Icon
                                                        : AlertDiamondIcon
                                                }
                                                size={16}
                                            />
                                        </div>
                                        {result.status === 'valid'
                                            ? 'Vote Verified'
                                            : 'Vote Quarantined'}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                                            <HugeiconsIcon
                                                icon={Cancel01Icon}
                                                size={16}
                                            />
                                        </div>
                                        Token Not Found
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {result.found ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                                Election
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium">
                                                {result.election}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                                Positions
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium">
                                                {result.positions}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                                Votes Cast
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium">
                                                {result.total_votes}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                                            <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                                Status
                                            </p>
                                            <p
                                                className={`mt-0.5 flex items-center gap-1 text-sm font-medium ${result.status === 'valid' ? 'text-green-500' : 'text-yellow-500'}`}
                                            >
                                                <HugeiconsIcon
                                                    icon={
                                                        result.status ===
                                                        'valid'
                                                            ? CheckmarkCircle01Icon
                                                            : AlertDiamondIcon
                                                    }
                                                    size={12}
                                                />
                                                {result.status === 'valid'
                                                    ? 'Valid'
                                                    : 'Quarantined'}
                                            </p>
                                        </div>
                                    </div>
                                    {result.details &&
                                        result.details.length > 0 && (
                                            <div className="space-y-1.5 rounded-lg border p-3">
                                                <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                                    Ballot Details
                                                </p>
                                                {result.details.map((d, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between text-xs"
                                                    >
                                                        <span className="text-muted-foreground">
                                                            {d.position}
                                                        </span>
                                                        <span className="font-medium">
                                                            {d.candidate}
                                                        </span>
                                                        <span
                                                            className={`inline-flex items-center gap-1 ${d.status === 'valid' ? 'text-green-500' : 'text-yellow-500'}`}
                                                        >
                                                            <HugeiconsIcon
                                                                icon={
                                                                    d.status ===
                                                                    'valid'
                                                                        ? CheckmarkCircle01Icon
                                                                        : AlertDiamondIcon
                                                                }
                                                                size={10}
                                                            />
                                                            {d.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    {result.status === 'valid' ? (
                                        <p className="text-xs text-muted-foreground">
                                            Your vote has been recorded
                                            securely. The ballot choices remain
                                            anonymous.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-yellow-600 dark:text-yellow-500">
                                            One or more votes linked to this
                                            receipt have been quarantined for
                                            integrity review. Please contact the
                                            election administrator.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No vote found with this token.
                                        Double-check the receipt code and try
                                        again.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Button variant="outline" asChild className="w-full">
                    <Link href={dashboard()}>Back to Dashboard</Link>
                </Button>
            </div>
        </>
    );
}

VerifyPage.layout = {
    breadcrumbs: [{ title: 'Verify Vote', href: verifyRoute() }],
};
