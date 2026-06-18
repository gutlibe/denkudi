import { Head } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Analytics01Icon, Group01Icon, DashboardSquare02Icon } from '@hugeicons/core-free-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Manage elections, positions, and candidates.</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <HugeiconsIcon icon={Analytics01Icon} size={20} />
                            </div>
                            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <HugeiconsIcon icon={Group01Icon} size={20} />
                            </div>
                            <CardTitle className="text-sm font-medium">Registered Voters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <HugeiconsIcon icon={DashboardSquare02Icon} size={20} />
                            </div>
                            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">0</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
