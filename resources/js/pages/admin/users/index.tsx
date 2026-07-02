import { Search01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type User = {
    id: number;
    first_name: string;
    last_name: string;
    student_id: string;
    email: string;
    role: string;
    role_label: string;
    created_at: string;
};

type Props = {
    users: User[];
    pagination: {
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search: string };
    roles: Record<string, string>;
};

export default function UsersIndex({
    users,
    pagination,
    filters,
    roles,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [roleDialog, setRoleDialog] = useState<{
        user: User | null;
        role: string;
    }>({ user: null, role: '' });

    const applySearch = () =>
        router.get(
            '/admin/users',
            { search },
            { preserveState: true, replace: true },
        );

    const goToPage = (page: number) =>
        router.get(
            '/admin/users',
            { search, page: String(page) },
            { preserveState: true },
        );

    const openRoleDialog = (user: User) =>
        setRoleDialog({
            user,
            role: user.role === 'admin' ? 'student' : 'admin',
        });

    const changeRole = () => {
        if (!roleDialog.user) {
            return;
        }

        router.patch(
            `/admin/users/${roleDialog.user.id}/role`,
            { role: roleDialog.role },
            {
                preserveState: true,
                onSuccess: () => setRoleDialog({ user: null, role: '' }),
            },
        );
    };

    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(
        1,
        pagination.current_page - Math.floor(maxPages / 2),
    );
    const endPage = Math.min(pagination.last_page, startPage + maxPages - 1);
    startPage = Math.max(1, endPage - maxPages + 1);

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <>
            <Head title="User Management" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            User Management
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {pagination.total} registered user
                            {pagination.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Search name, ID or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applySearch()
                            }
                            className="w-64"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={applySearch}
                        >
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={14}
                                className="mr-1.5"
                            />
                            Search
                        </Button>
                    </div>
                </div>

                <Card className="py-0">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Student ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Role
                                        </th>
                                        <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase md:table-cell">
                                            Joined
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                                                {user.first_name}{' '}
                                                {user.last_name}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                                                {user.student_id}
                                            </td>
                                            <td className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge
                                                    variant={
                                                        user.role === 'admin'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="gap-1 text-[11px]"
                                                >
                                                    <HugeiconsIcon
                                                        icon={Shield01Icon}
                                                        size={11}
                                                    />
                                                    {user.role_label}
                                                </Badge>
                                            </td>
                                            <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground md:table-cell">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openRoleDialog(user)
                                                    }
                                                >
                                                    Change Role
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-16 text-center"
                                            >
                                                <p className="text-sm text-muted-foreground">
                                                    No users found.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {pagination.current_page} of{' '}
                            {pagination.last_page}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === 1}
                                onClick={() =>
                                    goToPage(pagination.current_page - 1)
                                }
                            >
                                Prev
                            </Button>
                            {pages.map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === pagination.current_page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => goToPage(page)}
                                    className="min-w-9"
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    pagination.current_page ===
                                    pagination.last_page
                                }
                                onClick={() =>
                                    goToPage(pagination.current_page + 1)
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                open={roleDialog.user !== null}
                onOpenChange={() => setRoleDialog({ user: null, role: '' })}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Role</DialogTitle>
                        <DialogDescription>
                            {roleDialog.user ? (
                                <>
                                    Update role for{' '}
                                    <strong>
                                        {roleDialog.user.first_name}{' '}
                                        {roleDialog.user.last_name}
                                    </strong>{' '}
                                    ({roleDialog.user.student_id}).
                                </>
                            ) : (
                                ''
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Current Role</Label>
                            <p className="text-sm text-muted-foreground">
                                {roleDialog.user?.role_label}
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-role">New Role</Label>
                            <Select
                                value={roleDialog.role}
                                onValueChange={(v) =>
                                    setRoleDialog((s) => ({ ...s, role: v }))
                                }
                            >
                                <SelectTrigger id="new-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roles).map(
                                        ([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setRoleDialog({ user: null, role: '' })
                            }
                        >
                            Cancel
                        </Button>
                        <Button onClick={changeRole}>Confirm Change</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'User Management', href: '/admin/users' }],
};
