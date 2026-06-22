import { Shield01Icon, Search01Icon } from '@hugeicons/core-free-icons';
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

    return (
        <>
            <Head title="User Management" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        User Management
                    </h2>
                    <p className="mt-1 text-muted-foreground">
                        {pagination.total} registered user
                        {pagination.total !== 1 ? 's' : ''}
                    </p>
                </div>

                <Card>
                    <CardContent className="flex items-end gap-4 p-3">
                        <div className="grid flex-1 gap-1.5">
                            <Label htmlFor="search" className="text-xs">
                                Search
                            </Label>
                            <div className="relative">
                                <HugeiconsIcon
                                    icon={Search01Icon}
                                    size={14}
                                    className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    id="search"
                                    placeholder="Name, ID or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && applySearch()
                                    }
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full whitespace-nowrap">
                            <thead>
                                <tr className="border-b text-left text-sm text-muted-foreground">
                                    <th className="px-6 py-3 font-medium">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Student ID
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b text-sm last:border-0"
                                    >
                                        <td className="px-6 py-3 font-medium">
                                            {user.first_name} {user.last_name}
                                        </td>
                                        <td className="px-6 py-3 font-mono text-xs">
                                            {user.student_id}
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-3">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    user.role === 'admin'
                                                        ? 'border-primary/20 bg-primary/10 text-primary'
                                                        : 'bg-muted text-muted-foreground'
                                                }
                                            >
                                                <HugeiconsIcon
                                                    icon={Shield01Icon}
                                                    size={12}
                                                    className="mr-1"
                                                />
                                                {user.role_label}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-right">
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
                                            className="px-6 py-12 text-center text-sm text-muted-foreground"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {pagination.from}–{pagination.to} of{' '}
                            {pagination.total}
                        </p>
                        <div className="flex gap-1">
                            {Array.from(
                                { length: pagination.last_page },
                                (_, i) => i + 1,
                            ).map((p) => (
                                <Button
                                    key={p}
                                    variant={
                                        p === pagination.current_page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="icon-sm"
                                    onClick={() =>
                                        router.get(
                                            '/admin/users',
                                            { search, page: p },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    {p}
                                </Button>
                            ))}
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
