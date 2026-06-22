import { usePage } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';

export function MobileFloatingHeader() {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { resolvedAppearance, updateAppearance } = useAppearance();

    if (!auth.user) {
        return null;
    }

    const name = `${auth.user.first_name} ${auth.user.last_name}`;

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            <div className="fixed top-3 left-3 z-50 md:hidden">
                <div className="flex items-center gap-0.5 rounded-full bg-background/80 p-1 shadow-lg shadow-black/10 backdrop-blur-xl dark:bg-white/10 dark:shadow-none dark:ring-1 dark:ring-white/10">
                    <SidebarTrigger className="size-9 rounded-full hover:bg-muted/50 dark:hover:bg-white/10 [&_svg]:size-[18px]" />
                </div>
            </div>

            <div className="fixed top-3 right-3 z-50 md:hidden">
                <div className="flex items-center gap-0.5 rounded-full bg-background/80 p-1 shadow-lg shadow-black/10 backdrop-blur-xl dark:bg-white/10 dark:shadow-none dark:ring-1 dark:ring-white/10">
                    <button
                        onClick={toggleTheme}
                        className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                        aria-label={`Switch to ${resolvedAppearance === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <Sun className="size-[18px] shrink-0 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute top-1/2 left-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="size-9 cursor-pointer rounded-full ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none">
                                <Avatar className="size-9 bg-gradient-to-br from-primary/20 to-violet-500/20 after:hidden dark:from-primary/30 dark:to-violet-500/30">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={name}
                                    />
                                    <AvatarFallback className="bg-transparent text-xs font-semibold text-primary dark:text-white">
                                        {getInitials(name)}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="bottom"
                            align="end"
                            sideOffset={12}
                            className="w-56 rounded-xl"
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </>
    );
}
