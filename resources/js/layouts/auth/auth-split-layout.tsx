import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="flex min-h-svh">
            <div className="relative hidden w-[480px] shrink-0 flex-col justify-between border-r bg-sidebar p-12 text-sidebar-foreground lg:flex">
                <div>
                    <Link
                        href={home()}
                        className="flex items-center gap-3 font-semibold"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                            <AppLogoIcon className="size-6" />
                        </div>
                        <span className="text-lg">{name as string}</span>
                    </Link>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl leading-tight font-semibold">
                            HTU E-Voting
                        </h2>
                        <p className="text-sm leading-relaxed text-sidebar-foreground/70">
                            Secure, transparent student elections for Ho
                            Technical University.
                        </p>
                    </div>
                    <div className="space-y-3 text-sm text-sidebar-foreground/70">
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/10 text-xs font-medium text-sidebar-primary">
                                1
                            </span>
                            <span>Register with your student ID</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/10 text-xs font-medium text-sidebar-primary">
                                2
                            </span>
                            <span>Browse active elections</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/10 text-xs font-medium text-sidebar-primary">
                                3
                            </span>
                            <span>Cast your vote securely</span>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-sidebar-foreground/50">
                    &copy; {new Date().getFullYear()} HTU. All rights reserved.
                </p>
            </div>
            <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 sm:px-12">
                <div className="w-full max-w-sm space-y-6">
                    <div className="flex items-center justify-center gap-3 lg:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <AppLogoIcon className="size-5" />
                        </div>
                        <span className="text-sm font-semibold">
                            {name as string}
                        </span>
                    </div>
                    <div className="space-y-2 text-center">
                        <h1 className="text-xl font-semibold">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
