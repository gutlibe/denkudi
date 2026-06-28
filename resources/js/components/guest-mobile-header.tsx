import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';

export function GuestMobileHeader() {
    return (
        <>
            <div className="fixed top-3 left-3 z-50 lg:hidden">
                <div className="flex items-center gap-2 rounded-full bg-muted/80 px-3 py-2 shadow-sm backdrop-blur">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">EV</div>
                    <span className="text-sm font-semibold">HTU E-Voting</span>
                </div>
            </div>
            <div className="fixed top-3 right-3 z-50 lg:hidden">
                <div className="flex items-center gap-0.5 rounded-full bg-muted/80 p-1 shadow-sm backdrop-blur">
                    <Button asChild variant="ghost" size="sm" className="rounded-full h-8">
                        <Link href={login()}>Log in</Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-full h-8">
                        <Link href={register()}>Sign up</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
