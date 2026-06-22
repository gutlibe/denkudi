import { CheckmarkCircle01Icon, Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { dashboard, verify as verifyRoute } from '@/routes';

type Props = {
    result: {
        found: boolean;
        election?: string;
        positions?: number;
        total_votes?: number;
        status?: string;
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
                    <h2 className="text-xl font-bold tracking-tight">Verify Your Vote</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Paste your receipt token to confirm your vote was recorded.
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
                                    window.location.href = verifyRoute.url({ query: { token: token.trim() } });
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
                    <Card className={result.found ? 'border-green-500/30' : 'border-destructive/30'}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                {result.found ? (
                                    <>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-500">
                                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                                        </div>
                                        Vote Verified
                                    </>
                                ) : (
                                    <>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                                            <HugeiconsIcon icon={Cancel01Icon} size={16} />
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
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Election</p>
                                            <p className="text-sm font-medium mt-0.5">{result.election}</p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Positions</p>
                                            <p className="text-sm font-medium mt-0.5">{result.positions}</p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Votes Cast</p>
                                            <p className="text-sm font-medium mt-0.5">{result.total_votes}</p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</p>
                                            <p className={`text-sm font-medium mt-0.5 flex items-center gap-1 ${result.status === 'valid' ? 'text-green-500' : 'text-destructive'}`}>
                                                <HugeiconsIcon icon={result.status === 'valid' ? CheckmarkCircle01Icon : Cancel01Icon} size={12} />
                                                {result.status === 'valid' ? 'Valid' : 'Tampered'}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Your vote has been recorded securely. The ballot choices remain anonymous.
                                    </p>
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No vote found with this token. Double-check the receipt code and try again.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Button variant="outline" asChild className="w-full">
                    <Link href={dashboard()}>
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </>
    );
}

VerifyPage.layout = {
    breadcrumbs: [{ title: 'Verify Vote', href: verifyRoute() }],
};
