import {
    ArrowRight02Icon,
    CheckmarkCircle01Icon,
    Analytics01Icon,
    AiSecurity01Icon,
    Calendar01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link, usePage } from '@inertiajs/react';
import { GuestMobileHeader } from '@/components/guest-mobile-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { props } = usePage<{ auth: { user?: unknown } }>();
    const isLoggedIn = Boolean(props.auth.user);

    return (
        <>
            <Head title="HTU E-Voting" />

            <GuestMobileHeader />

            <div className="flex min-h-screen flex-col bg-background">
                <header className="sticky top-0 z-50 hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:flex">
                    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                                EV
                            </div>
                            <span className="hidden font-semibold tracking-tight sm:inline">
                                HTU E-Voting
                            </span>
                        </Link>
                        <nav className="flex items-center gap-2">
                            {isLoggedIn ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href={register()}>
                                            Get Started{' '}
                                            <HugeiconsIcon
                                                icon={ArrowRight02Icon}
                                                size={14}
                                                className="ml-1"
                                            />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex-1">
                    {/* Hero */}
                    <section className="border-b">
                        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-36">
                            <div className="mx-auto max-w-3xl text-center">
                                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                                    Live voting
                                    <span className="block bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                                        for HTU
                                    </span>
                                </h1>
                                <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                                    Cast your vote from anywhere. For student
                                    elections, referendums, department polls,
                                    and more — no email, just your student ID.
                                </p>
                                {!isLoggedIn && (
                                    <div className="mt-8 flex items-center justify-center gap-3">
                                        <Button asChild size="lg">
                                            <Link href={register()}>
                                                Get Started{' '}
                                                <HugeiconsIcon
                                                    icon={ArrowRight02Icon}
                                                    size={16}
                                                    className="ml-1.5"
                                                />
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                        >
                                            <Link href={login()}>Log In</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* How it works — 3 visual steps */}
                    <section className="py-16 sm:py-24">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="mx-auto mb-12 max-w-2xl text-center">
                                <h2 className="text-3xl font-bold tracking-tight">
                                    How it works
                                </h2>
                                <p className="mt-3 text-muted-foreground">
                                    Three simple steps to make your voice heard.
                                </p>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-3">
                                {/* Step 1: Register */}
                                <Card className="relative overflow-hidden">
                                    <span className="absolute top-3 right-4 text-6xl font-bold text-muted-foreground/10">
                                        01
                                    </span>
                                    <CardHeader>
                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <HugeiconsIcon
                                                icon={ArrowRight02Icon}
                                                size={20}
                                            />
                                        </div>
                                        <CardTitle className="text-lg">
                                            Register
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Sign up with your 10-digit student
                                            ID. No email needed.
                                        </p>
                                        <div className="space-y-2 rounded-lg border bg-card p-3 opacity-70">
                                            <div className="h-2 w-20 rounded bg-muted" />
                                            <div className="h-8 rounded-md bg-muted" />
                                            <div className="h-2 w-20 rounded bg-muted" />
                                            <div className="h-8 rounded-md bg-muted" />
                                            <div className="h-9 rounded-md bg-primary/80" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Step 2: Vote */}
                                <Card className="relative overflow-hidden border-primary/30 bg-primary/[0.02]">
                                    <span className="absolute top-3 right-4 text-6xl font-bold text-muted-foreground/10">
                                        02
                                    </span>
                                    <CardHeader>
                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                            <HugeiconsIcon
                                                icon={CheckmarkCircle01Icon}
                                                size={20}
                                            />
                                        </div>
                                        <CardTitle className="text-lg">
                                            Vote
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            Select candidates, review your
                                            ballot, and submit securely.
                                        </p>
                                        <div className="space-y-1.5 rounded-lg border border-primary/20 bg-background p-3">
                                            <div className="mb-1 text-xs text-muted-foreground">
                                                President
                                            </div>
                                            <div className="flex items-center gap-2 rounded-md border border-primary bg-primary/5 p-2">
                                                <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-primary text-[10px] text-primary-foreground">
                                                    <HugeiconsIcon
                                                        icon={
                                                            CheckmarkCircle01Icon
                                                        }
                                                        size={10}
                                                    />
                                                </div>
                                                <div className="h-3 w-24 rounded bg-muted" />
                                            </div>
                                            <div className="flex items-center gap-2 rounded-md border p-2 opacity-50">
                                                <div className="h-4 w-4 rounded-sm border" />
                                                <div className="h-3 w-20 rounded bg-muted" />
                                            </div>
                                            <div className="flex items-center gap-2 rounded-md border p-2 opacity-50">
                                                <div className="h-4 w-4 rounded-sm border" />
                                                <div className="h-3 w-24 rounded bg-muted" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Step 3: Results */}
                                <Card className="relative overflow-hidden">
                                    <span className="absolute top-3 right-4 text-6xl font-bold text-muted-foreground/10">
                                        03
                                    </span>
                                    <CardHeader>
                                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <HugeiconsIcon
                                                icon={Analytics01Icon}
                                                size={20}
                                            />
                                        </div>
                                        <CardTitle className="text-lg">
                                            Results
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-sm text-muted-foreground">
                                            View live results with charts and
                                            verify your vote.
                                        </p>
                                        <div className="space-y-2 rounded-lg border bg-card p-3 opacity-70">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="h-3 w-16 rounded bg-primary/40" />
                                                <span className="ml-auto h-3 w-8 rounded bg-muted" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 flex-1 rounded-full bg-primary/60" />
                                                    <span className="w-8 text-right text-[10px] text-muted-foreground">
                                                        42%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 flex-1 rounded-full bg-muted" />
                                                    <span className="w-8 text-right text-[10px] text-muted-foreground">
                                                        33%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 flex-1 rounded-full bg-muted" />
                                                    <span className="w-8 text-right text-[10px] text-muted-foreground">
                                                        25%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Trust badges */}
                    <section className="py-12 sm:py-16">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <HugeiconsIcon
                                        icon={AiSecurity01Icon}
                                        size={16}
                                        className="text-primary"
                                    />
                                    <span>Anonymous voting</span>
                                </div>
                                <span className="hidden text-border sm:inline">
                                    |
                                </span>
                                <div className="flex items-center gap-2">
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle01Icon}
                                        size={16}
                                        className="text-primary"
                                    />
                                    <span>Chain verified</span>
                                </div>
                                <span className="hidden text-border sm:inline">
                                    |
                                </span>
                                <div className="flex items-center gap-2">
                                    <HugeiconsIcon
                                        icon={Calendar01Icon}
                                        size={16}
                                        className="text-primary"
                                    />
                                    <span>Live results</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-center text-sm text-muted-foreground sm:flex-row">
                        <p>
                            &copy; {new Date().getFullYear()} Ho Technical
                            University
                        </p>
                        <span>HTU E-Voting</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
