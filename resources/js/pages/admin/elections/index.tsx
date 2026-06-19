import { Head, Link } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon, PlusSignIcon, PencilEdit02Icon, Delete01Icon, Analytics01Icon } from '@hugeicons/core-free-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard as adminDashboard } from '@/routes/admin';

type Election = {
    id: number;
    title: string;
    type: string;
    type_label: string;
    status: string;
    status_label: string;
    scope: string;
    starts_at: string | null;
    ends_at: string | null;
    created_by: string;
    created_at: string;
};

type Props = {
    elections: Election[];
};

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        draft: 'bg-muted text-muted-foreground',
        scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        paused_for_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        closed: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
    };
    return map[status] ?? '';
};

export default function ElectionsIndex({ elections }: Props) {
    return (
        <>
            <Head title="Elections" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Elections</h2>
                        <p className="text-muted-foreground">Create and manage elections.</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/elections/create">
                            <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-1.5" />
                            New Election
                        </Link>
                    </Button>
                </div>

                {elections.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                                <HugeiconsIcon icon={Analytics01Icon} size={24} />
                            </div>
                            <CardTitle className="text-lg">No elections yet</CardTitle>
                            <CardDescription className="mt-1">
                                Create your first election to get started.
                            </CardDescription>
                            <Button asChild className="mt-6" variant="outline">
                                <Link href="/admin/elections/create">
                                    <HugeiconsIcon icon={PlusSignIcon} size={16} className="mr-1.5" />
                                    Create Election
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-sm text-muted-foreground">
                                        <th className="px-6 py-3 font-medium">Title</th>
                                        <th className="px-6 py-3 font-medium">Type</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium">Scope</th>
                                        <th className="px-6 py-3 font-medium">Created</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {elections.map((election) => (
                                        <tr key={election.id} className="border-b text-sm last:border-0">
                                            <td className="px-6 py-3 font-medium">{election.title}</td>
                                            <td className="px-6 py-3">{election.type_label}</td>
                                            <td className="px-6 py-3">
                                                <Badge className={statusBadge(election.status)} variant="outline">
                                                    {election.status_label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-muted-foreground">{election.scope}</td>
                                            <td className="px-6 py-3 text-muted-foreground">
                                                {new Date(election.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button asChild variant="ghost" size="icon-sm">
                                                        <Link href={`/admin/elections/${election.id}/edit`}>
                                                            <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
                                                        </Link>
                                                    </Button>
                                                    <Button asChild variant="ghost" size="icon-sm">
                                                        <Link href={`/admin/elections/${election.id}`} method="delete" as="button">
                                                            <HugeiconsIcon icon={Delete01Icon} size={16} />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

ElectionsIndex.layout = {
    breadcrumbs: [{ title: 'Elections', href: '/admin/elections' }],
};
