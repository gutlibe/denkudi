import { PlusSignIcon, PencilEdit02Icon, Delete01Icon, Analytics01Icon, Search01Icon, Settings01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    results_released: boolean;
    created_by: string;
    created_at: string;
};

type Props = {
    elections: Election[];
    filters: { status: string; search: string };
    statuses: Record<string, string>;
    pagination: { current_page: number; last_page: number; total: number };
};

const statusTransitions: Record<string, { value: string; label: string }[]> = {
    draft: [{ value: 'scheduled', label: 'Schedule' }],
    scheduled: [{ value: 'active', label: 'Activate' }],
    active: [{ value: 'closed', label: 'Close' }],
    closed: [],
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

const typeIcon = (type: string) => {
    const map: Record<string, string> = {
        student_body: 'bg-blue-500/10 text-blue-400',
        faculty: 'bg-violet-500/10 text-violet-400',
        department: 'bg-amber-500/10 text-amber-400',
        hall: 'bg-emerald-500/10 text-emerald-400',
    };

    return map[type] ?? 'bg-muted text-muted-foreground';
};

export default function ElectionsIndex({ elections, filters, statuses, pagination }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [releaseId, setReleaseId] = useState<Election | null>(null);
    const [statusChange, setStatusChange] = useState<{ id: number; status: string; label: string } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilters = (overrides: Record<string, string>) => {
        router.get('/admin/elections', { ...filters, ...overrides }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Elections" />
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Elections</h2>
                        <p className="text-sm text-muted-foreground">Create and manage elections.</p>
                    </div>
                    <Button asChild size="sm">
                        <Link href="/admin/elections/create">
                            <HugeiconsIcon icon={PlusSignIcon} size={14} className="mr-1.5" />
                            New
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <HugeiconsIcon icon={Search01Icon} size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search elections..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            className="pl-8 h-9 text-sm"
                        />
                    </div>
                    <Select
                        value={filters.status}
                        onValueChange={(v) => applyFilters({ status: v === 'all' ? '' : v })}
                    >
                        <SelectTrigger className="w-36 h-9 text-sm">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {Object.entries(statuses).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {elections.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <HugeiconsIcon icon={Analytics01Icon} size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">No elections found</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {filters.status || filters.search ? 'No elections match your filters.' : 'Create your first election to get started.'}
                                </p>
                            </div>
                            {!filters.status && !filters.search && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/admin/elections/create">
                                        <HugeiconsIcon icon={PlusSignIcon} size={14} className="mr-1.5" />
                                        Create Election
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {elections.map((election) => (
                            <Card key={election.id} className="flex flex-col group pb-0 gap-0">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-sm leading-snug line-clamp-2">{election.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${typeIcon(election.type)}`}>
                                                    {election.type_label}
                                                </span>
                                                {statusTransitions[election.status]?.length > 0 ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="cursor-pointer">
                                                                <Badge className={statusBadge(election.status)} variant="outline">{election.status_label}</Badge>
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start" className="w-32">
                                                            {statusTransitions[election.status].map((t) => (
                                                                <DropdownMenuItem key={t.value} onClick={() => setStatusChange({ id: election.id, status: t.value, label: t.label })}>
                                                                    {t.label}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <Badge className={statusBadge(election.status)} variant="outline">{election.status_label}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 pb-3 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground/70">{election.scope}</span>
                                        <span>&middot;</span>
                                        <span>{new Date(election.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    {election.starts_at && (
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(election.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — {election.ends_at ? new Date(election.ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '...' }
                                        </p>
                                    )}
                                </CardContent>
                                <Separator />
                                <div className="flex items-center justify-between px-3 py-0.5">
                                    <div className="flex items-center gap-0.5">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon-sm" onClick={() => setReleaseId(election)} className={election.results_released ? 'text-green-500 hover:text-green-600' : 'text-muted-foreground'}>
                                                    <HugeiconsIcon icon={Analytics01Icon} size={14} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{election.results_released ? 'Withdraw Results' : 'Release Results'}</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button asChild variant="ghost" size="icon-sm">
                                                    <Link href={`/admin/elections/${election.id}/audit`}>
                                                        <HugeiconsIcon icon={Shield01Icon} size={14} />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Audit Chain</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button asChild variant="ghost" size="icon-sm">
                                                    <Link href={`/admin/elections/${election.id}/results`}>
                                                        <HugeiconsIcon icon={Analytics01Icon} size={14} />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Results</TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button asChild variant="ghost" size="icon-sm">
                                                    <Link href={`/admin/elections/${election.id}/manage`}>
                                                        <HugeiconsIcon icon={Settings01Icon} size={14} />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Manage</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button asChild variant="ghost" size="icon-sm">
                                                    <Link href={`/admin/elections/${election.id}/edit`}>
                                                        <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-muted-foreground hover:text-destructive"
                                                    onClick={() => setDeleteId(election.id)}
                                                >
                                                    <HugeiconsIcon icon={Delete01Icon} size={14} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {pagination.current_page < pagination.last_page && (
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => router.get('/admin/elections', { ...filters, page: pagination.current_page + 1 }, { preserveState: true, preserveScroll: false })}
                        >
                            Load More
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Election</DialogTitle>
                        <DialogDescription>
                            This will permanently delete the election and all associated data — positions, candidates, votes, and audit records.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
                        <Button variant="destructive" disabled={deleting} onClick={() => {
                            if (deleteId) {
                                setDeleting(true);
                                router.delete(`/admin/elections/${deleteId}`, {
                                    onFinish: () => {
                                        setDeleting(false);
                                        setDeleteId(null);
                                    },
                                });
                            }
                        }}>
                            {deleting ? <><Spinner className="mr-1.5" /> Deleting…</> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={releaseId !== null} onOpenChange={() => setReleaseId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{releaseId?.results_released ? 'Withdraw Results' : 'Release Results'}</DialogTitle>
                        <DialogDescription>
                            {releaseId?.results_released
                                ? 'Voters will no longer be able to view the results for this election.'
                                : 'Voters will be able to view the results for this election.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReleaseId(null)}>Cancel</Button>
                        <Button onClick={() => {
                            if (releaseId) {
router.patch(`/admin/elections/${releaseId.id}/release-results`);
}

                            setReleaseId(null);
                        }}>
                            {releaseId?.results_released ? 'Withdraw Results' : 'Release Results'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={statusChange !== null} onOpenChange={() => setStatusChange(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Status</DialogTitle>
                        <DialogDescription>
                            {statusChange?.label} this election? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusChange(null)}>Cancel</Button>
                        <Button onClick={() => {
                            if (statusChange) {
router.patch(`/admin/elections/${statusChange.id}/status`, { status: statusChange.status });
}

                            setStatusChange(null);
                        }}>
                            {statusChange?.label}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ElectionsIndex.layout = {
    breadcrumbs: [{ title: 'Elections', href: '/admin/elections' }],
};
