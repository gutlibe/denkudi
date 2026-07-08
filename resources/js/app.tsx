import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

// Read the app name from the initial page's shared props (set server-side
// from config('app.name')) rather than a Vite build-time env var — the
// production build runs in CI with no .env present, so VITE_APP_NAME is
// always undefined there and would otherwise bake 'Laravel' into the bundle.
const initialPage = JSON.parse(
    document.getElementById('app')?.getAttribute('data-page') ?? '{}',
);
const appName = initialPage?.props?.name || 'HTU E-Voting';
const pages = import.meta.glob('./pages/**/*.tsx');

initializeTheme();

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: (name) => {
        const exact = `./pages/${name}.tsx`;
        const folder = `./pages/${name}/index.tsx`;
        const importFn = pages[exact] || pages[folder];

        if (!importFn) {
            throw new Error(`Page not found: ${name}`);
        }

        return importFn() as any;
    },
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.endsWith('-fullscreen'):
                return null;
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <TooltipProvider delayDuration={0}>
                <App {...props} />
                <Toaster />
            </TooltipProvider>,
        );

        router.on('success', (event: any) => {
            const p = event.detail.page?.props?.toast as
                | {
                      type: 'success' | 'error' | 'info' | 'warning';
                      message: string;
                  }
                | undefined;

            if (p) {
                toast[p.type](p.message);
            }
        });
    },
    progress: { color: '#4B5563' },
});
