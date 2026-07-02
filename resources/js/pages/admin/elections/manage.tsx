import {
    Delete01Icon,
    PencilEdit02Icon,
    PlusSignIcon,
    Settings01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link, router, useForm, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type PositionItem = {
    id: number;
    title: string;
    max_selections: number;
    sort_order: number;
    candidate_count: number;
};

type Props = {
    election: {
        id: number;
        title: string;
        type: string;
        status: string;
        scope: string;
        positions: PositionItem[];
    };
};

export default function ElectionManage({ election }: Props) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Elections', href: '/admin/elections' },
            { title: election.title, href: '#' },
        ],
    });

    const [posDialog, setPosDialog] = useState<{
        open: boolean;
        edit: PositionItem | null;
    }>({ open: false, edit: null });
    const [deletePosId, setDeletePosId] = useState<number | null>(null);

    const posForm = useForm({ title: '', max_selections: 1 });

    const openPosDialog = (edit: PositionItem | null) => {
        if (edit) {
            posForm.setData({
                title: edit.title,
                max_selections: edit.max_selections,
            });
            setPosDialog({ open: true, edit });
        } else {
            posForm.reset();
            setPosDialog({ open: true, edit: null });
        }
    };

    const savePosition = () => {
        if (posDialog.edit) {
            posForm.put(
                `/admin/elections/${election.id}/positions/${posDialog.edit.id}`,
                {
                    onSuccess: () => setPosDialog({ open: false, edit: null }),
                },
            );
        } else {
            posForm.post(`/admin/elections/${election.id}/positions`, {
                onSuccess: () => setPosDialog({ open: false, edit: null }),
            });
        }
    };

    return (
        <>
            <Head title={`Manage — ${election.title}`} />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {election.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {election.scope} &middot;{' '}
                            {election.positions.length} position
                            {election.positions.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button size="sm" onClick={() => openPosDialog(null)}>
                        <HugeiconsIcon
                            icon={PlusSignIcon}
                            size={14}
                            className="mr-1.5"
                        />
                        Add Position
                    </Button>
                </div>

                <Separator />

                {election.positions.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                                <HugeiconsIcon
                                    icon={Settings01Icon}
                                    size={22}
                                    className="text-muted-foreground"
                                />
                            </div>
                            <div className="text-center">
                                <CardTitle className="text-base">
                                    No positions yet
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Add positions like President, VP, Treasurer.
                                </CardDescription>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="py-0">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Position
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Selections
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Candidates
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {election.positions.map((pos) => (
                                            <tr
                                                key={pos.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {pos.title}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {pos.max_selections === 1
                                                        ? 'Single choice'
                                                        : `Up to ${pos.max_selections}`}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {pos.candidate_count}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    asChild
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                >
                                                                    <Link
                                                                        href={`/admin/elections/${election.id}/positions/${pos.id}/candidates`}
                                                                    >
                                                                        <HugeiconsIcon
                                                                            icon={
                                                                                Settings01Icon
                                                                            }
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    </Link>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Candidates
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    onClick={() =>
                                                                        openPosDialog(
                                                                            pos,
                                                                        )
                                                                    }
                                                                >
                                                                    <HugeiconsIcon
                                                                        icon={
                                                                            PencilEdit02Icon
                                                                        }
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Edit
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    onClick={() =>
                                                                        setDeletePosId(
                                                                            pos.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <HugeiconsIcon
                                                                        icon={
                                                                            Delete01Icon
                                                                        }
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Delete
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog
                open={posDialog.open}
                onOpenChange={(o) =>
                    !o && setPosDialog({ open: false, edit: null })
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {posDialog.edit ? 'Edit Position' : 'Add Position'}
                        </DialogTitle>
                        <DialogDescription>
                            {posDialog.edit
                                ? 'Update the position details.'
                                : 'Add a new position to this election.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="pos-title">Title</Label>
                            <Input
                                id="pos-title"
                                value={posForm.data.title}
                                onChange={(e) =>
                                    posForm.setData('title', e.target.value)
                                }
                                placeholder="President"
                            />
                            {posForm.errors.title && (
                                <p className="text-sm text-destructive">
                                    {posForm.errors.title}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pos-max">Max selections</Label>
                            <Input
                                id="pos-max"
                                type="number"
                                min={1}
                                max={10}
                                value={posForm.data.max_selections}
                                onChange={(e) =>
                                    posForm.setData(
                                        'max_selections',
                                        parseInt(e.target.value) || 1,
                                    )
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setPosDialog({ open: false, edit: null })
                            }
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={savePosition}
                            disabled={posForm.processing}
                        >
                            {posForm.processing && (
                                <Spinner className="mr-1.5" />
                            )}
                            {posDialog.edit ? 'Save' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deletePosId !== null}
                onOpenChange={() => setDeletePosId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Position</DialogTitle>
                        <DialogDescription>
                            This will permanently remove the position and all
                            its candidates.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletePosId(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deletePosId) {
                                    router.delete(
                                        `/admin/elections/${election.id}/positions/${deletePosId}`,
                                    );
                                }

                                setDeletePosId(null);
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
