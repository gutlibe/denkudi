import { Head, Link, usePage } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    AiMagicIcon,
    AiSecurity01Icon,
    Analytics01Icon,
    ArrowRight02Icon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    GraduationCapIcon,
    Group01Icon,
} from '@hugeicons/core-free-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';

const steps = [
    {
        icon: Group01Icon,
        title: 'Register with your ID',
        description:
            'Sign up with your 10-digit student ID. No email needed — your account is created instantly.',
    },
    {
        icon: Analytics01Icon,
        title: 'Cast your vote',
        description:
            'Browse active elections, review candidates, and submit your ballot securely in seconds.',
    },
    {
        icon: AiSecurity01Icon,
        title: 'Transparent results',
        description:
            'Watch real-time results after polls close. Every vote is anonymous and verifiable.',
    },
];

const highlights = [
    { icon: AiSecurity01Icon, label: '100% Anonymous' },
    { icon: Clock01Icon, label: 'Real-time Results' },
    { icon: CheckmarkCircle01Icon, label: 'Counted Once' },
    { icon: GraduationCapIcon, label: 'Built for HTU' },
];

export default function Welcome() {
    const { props } = usePage<{ auth: { user?: unknown } }>();
    const isLoggedIn = Boolean(props.auth.user);

    return (
        <>
            <Head title="Welcome — HTU E-Voting" />
            <div className="flex min-h-screen flex-col bg-background">
                <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                                EV
                            </div>
                            <span className="font-semibold tracking-tight">HTU E-Voting</span>
                        </Link>
                        <nav className="flex items-center gap-2">
                            {isLoggedIn ? (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href={register()}>
                                            Get Started
                                            <HugeiconsIcon icon={ArrowRight02Icon} size={16} className="ml-1.5" />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex-1">
                    <section className="relative overflow-hidden border-b">
                        <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28 lg:pt-36">
                            <div className="mx-auto max-w-3xl text-center">
                                <Badge variant="secondary" className="mb-6 gap-1.5">
                                    <HugeiconsIcon icon={AiMagicIcon} size={14} className="text-primary" />
                                    Ho Technical University
                                </Badge>
                                <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                                    Secure student
                                    <span className="block bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                                        e-voting, simplified
                                    </span>
                                </h1>
                                <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
                                    Cast your vote from anywhere. Fast, transparent, and built for HTU
                                    students — no email, just your student ID.
                                </p>
                                <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                                    {isLoggedIn ? (
                                        <Button asChild size="lg">
                                            <Link href={dashboard()}>
                                                Go to Dashboard
                                                <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button asChild size="lg">
                                                <Link href={register()}>
                                                    Register Now
                                                    <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" />
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" size="lg">
                                                <Link href={login()}>Log In</Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-primary" />
                                    No email required — just your student ID
                                </p>
                            </div>

                            <div className="mt-16 mx-auto max-w-4xl">
                                <div className="grid grid-cols-2 overflow-hidden rounded-xl ring-1 ring-border sm:grid-cols-4">
                                    {highlights.map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-center gap-2.5 bg-card px-4 py-4"
                                        >
                                            <HugeiconsIcon icon={item.icon} size={16} className="text-primary shrink-0" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-muted/50 py-24 sm:py-32">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    How it works
                                </h2>
                                <p className="mt-4 text-muted-foreground">
                                    Three simple steps to make your voice heard.
                                </p>
                            </div>
                            <div className="mt-14 grid gap-6 md:grid-cols-3">
                                {steps.map((step, i) => (
                                    <Card key={i} className="hover:-translate-y-1 transition-transform duration-300">
                                        <CardHeader>
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <HugeiconsIcon icon={step.icon} size={24} />
                                            </div>
                                            <CardTitle className="text-lg">
                                                <span className="mr-2 text-sm font-normal text-muted-foreground/40">
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                                {step.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="leading-relaxed">
                                                {step.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="py-24 sm:py-32">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="mx-auto max-w-3xl text-center">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    Ready to vote?
                                </h2>
                                <p className="mt-4 text-muted-foreground">
                                    Join HTU students in shaping campus leadership. It takes less than a minute.
                                </p>
                                {!isLoggedIn && (
                                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                        <Button asChild size="lg">
                                            <Link href={register()}>
                                                Get Started Now
                                                <HugeiconsIcon icon={ArrowRight02Icon} size={18} className="ml-2" />
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="lg">
                                            <Link href={login()}>I have an account</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center text-sm text-muted-foreground sm:flex-row">
                        <p>&copy; {new Date().getFullYear()} HTU E-Voting</p>
                        <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[9px] font-bold text-primary-foreground">
                                EV
                            </div>
                            <span>Ho Technical University</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
