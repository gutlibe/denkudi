import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            auth: Auth;
            name: string;
            sidebarOpen: boolean;
        };
    }
}

export interface AppSharedProps {
    auth: Auth;
    name: string;
    sidebarOpen: boolean;
    [key: string]: unknown;
}
