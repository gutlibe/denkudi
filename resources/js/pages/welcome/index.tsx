import { AiMagicIcon, AiSecurity01Icon, Analytics01Icon, ArrowRight02Icon, Group01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';

const steps = [
    { icon: Group01Icon, title: 'Register with your ID', description: 'Sign up with your 10-digit student ID. No email needed — your account is created instantly.' },
    { icon: Analytics01Icon, title: 'Cast your vote', description: 'Browse active elections, review candidates, and submit your ballot securely in seconds.' },
    { icon: AiSecurity01Icon, title: 'Transparent results', description: 'Watch real-time results after polls close. Every vote is anonymous and verifiable.' },
];

export default function Welcome() {
    const { props } = usePage<{ auth: { user?: unknown } }>();
    const isLoggedIn = Boolean(props.auth.user);

    return (
        <>
            <Head title="HTU E-Voting" />
            <div className="flex min-h-screen flex-col bg-background">
                <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">EV</div>
                            <span className="font-semibold tracking-tight">HTU E-Voting</span>
                        </Link>
                        <nav className="flex items-center gap-2">
                            {isLoggedIn ? (
                                <Button asChild variant="outline" size="sm"><Link href={dashboard()}>Dashboard</Link></Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm"><Link href={login()}>Log in</Link></Button>
                                    <Button asChild size="sm"><Link href={register()}>Get Started <HugeiconsIcon icon={ArrowRight02Icon} size={14} className="ml-1" /></Link></Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex flex-1 items-center">
                    <div className="mx-auto w-full max-w-6xl px-6 py-20">
                        <div className="mx-auto max-w-3xl text-center">
                            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
                                Secure student
                                <span className="block bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">e-voting, simplified</span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                                Cast your vote from anywhere. Fast, transparent, and built for HTU students — no email, just your student ID.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-4">
                                {isLoggedIn ? (
                                    <Button asChild size="lg"><Link href={dashboard()}>Go to Dashboard <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" /></Link></Button>
                                ) : (
                                    <>
                                        <Button asChild size="lg"><Link href={register()}>Register Now <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" /></Link></Button>
                                        <Button asChild variant="outline" size="lg"><Link href={login()}>Log In</Link></Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-24 grid gap-4 sm:grid-cols-3">
                            {steps.map((step, i) => (
                                <Card key={i} className="border-none bg-transparent shadow-none">
                                    <CardHeader>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <HugeiconsIcon icon={step.icon} size={20} />
                                        </div>
                                        <CardTitle className="text-base">
                                            <span className="mr-2 text-xs font-normal text-muted-foreground/50">{String(i + 1).padStart(2, '0')}</span>
                                            {step.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardDescription className="px-(--card-spacing) text-sm leading-relaxed">{step.description}</CardDescription>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>

                <footer className="border-t">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-center text-sm text-muted-foreground sm:flex-row">
                        <p>&copy; {new Date().getFullYear()} Ho Technical University</p>
                        <div className="flex items-center gap-1.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[9px] font-bold text-primary-foreground">EV</div>
                            <span>HTU E-Voting</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
