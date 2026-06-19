import { Head, Link, router, useForm, setLayoutProps } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    PlusSignIcon,
    PencilEdit02Icon,
    Delete01Icon,
    UserIcon,
    AiImageIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRef, useState } from 'react';

type Candidate = {
    id: number;
    name: string;
    department: string | null;
    manifesto: string | null;
    photo_url: string | null;
};

type Props = {
    election: { id: number; title: string };
    position: { id: number; title: string; max_selections: number; candidates: Candidate[] };
};

export default function CandidatesIndex({ election, position }: Props) {
    setLayoutProps({
        breadcrumbs: [
            { title: 'Elections', href: '/admin/elections' },
            { title: election.title, href: `/admin/elections/${election.id}/manage` },
            { title: position.title, href: '#' },
        ],
    });

    const [dialog, setDialog] = useState<{ open: boolean; edit: Candidate | null }>({ open: false, edit: null });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm({ name: '', department: '', manifesto: '', position_id: 0, photo: null as File | null });

    const openDialog = (edit: Candidate | null) => {
        if (edit) {
            form.setData({
                name: edit.name,
                department: edit.department ?? '',
                manifesto: edit.manifesto ?? '',
                position_id: position.id,
                photo: null,
            });
            setDialog({ open: true, edit });
        } else {
            form.reset();
            form.setData('position_id', position.id);
            setDialog({ open: true, edit: null });
        }
    };

    const save = () => {
        const url = `/admin/elections/${election.id}/candidates`;
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.getAttribute('content') ?? '';

        if (form.data.photo) {
            const fd = new FormData();
            fd.append('name', form.data.name);
            fd.append('position_id', String(position.id));
            fd.append('department', form.data.department);
            fd.append('manifesto', form.data.manifesto);
            fd.append('photo', form.data.photo);

            if (dialog.edit) {
                fd.append('_method', 'put');
                fetch(`${url}/${dialog.edit.id}`, {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
                    body: fd,
                }).then((r) => {
                    if (!r.ok && r.status === 419) window.location.reload();
                    if (r.ok) window.location.reload();
                });
            } else {
                fetch(url, {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
                    body: fd,
                }).then((r) => {
                    if (!r.ok && r.status === 419) window.location.reload();
                    if (r.ok) window.location.reload();
                });
            }
        } else {
            if (dialog.edit) {
                router.put(`${url}/${dialog.edit.id}`, {
                    name: form.data.name,
                    position_id: position.id,
                    department: form.data.department,
                    manifesto: form.data.manifesto,
                }, {
                    onSuccess: () => setDialog({ open: false, edit: null }),
                });
            } else {
                router.post(url, {
                    name: form.data.name,
                    position_id: position.id,
                    department: form.data.department,
                    manifesto: form.data.manifesto,
                }, {
                    onSuccess: () => setDialog({ open: false, edit: null }),
                });
            }
        }
    };

    return (
        <>
            <Head title={`Candidates — ${position.title}`} />
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{position.title}</h2>
                    <p className="text-muted-foreground mt-1">
                        {position.max_selections === 1 ? 'Single choice' : `Up to ${position.max_selections} selections`}
                        &middot; {position.candidates.length} candidate{position.candidates.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Manage candidates for this position.</p>
                    <Button size="sm" onClick={() => openDialog(null)}>
                        <HugeiconsIcon icon={PlusSignIcon} size={14} className="mr-1" />
                        Add Candidate
                    </Button>
                </div>

                {position.candidates.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <CardTitle className="text-base">No candidates yet</CardTitle>
                            <CardDescription className="mt-1">Add candidates for this position.</CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {position.candidates.map((candidate) => (
                            <div key={candidate.id} className="flex items-start gap-3 rounded-xl border p-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary overflow-hidden">
                                    {candidate.photo_url ? (
                                        <img src={candidate.photo_url} alt={candidate.name} className="h-12 w-12 object-cover" />
                                    ) : (
                                        <HugeiconsIcon icon={UserIcon} size={20} />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{candidate.name}</p>
                                    {candidate.department && <p className="truncate text-xs text-muted-foreground">{candidate.department}</p>}
                                    {candidate.manifesto && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{candidate.manifesto}</p>}
                                </div>
                                <div className="flex shrink-0 gap-0.5">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon-sm" onClick={() => openDialog(candidate)}>
                                                <HugeiconsIcon icon={PencilEdit02Icon} size={13} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(candidate.id)}>
                                                <HugeiconsIcon icon={Delete01Icon} size={13} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Remove</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={dialog.open} onOpenChange={(o) => !o && setDialog({ open: false, edit: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialog.edit ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
                        <DialogDescription>
                            {dialog.edit ? 'Update candidate details.' : `Add a candidate for ${position.title}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cand-name">Name</Label>
                            <Input id="cand-name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Full name" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cand-dept">Department</Label>
                            <Input id="cand-dept" value={form.data.department} onChange={(e) => form.setData('department', e.target.value)} placeholder="Computer Science" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cand-manifesto">Manifesto</Label>
                            <Textarea id="cand-manifesto" rows={3} value={form.data.manifesto} onChange={(e) => form.setData('manifesto', e.target.value)} placeholder="Campaign statement..." />
                        </div>
                        <div className="grid gap-2">
                            <Label>Photo</Label>
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
                                    {form.data.photo ? (
                                        <img src={URL.createObjectURL(form.data.photo)} className="h-12 w-12 object-cover" />
                                    ) : dialog.edit?.photo_url ? (
                                        <img src={dialog.edit.photo_url} className="h-12 w-12 object-cover" />
                                    ) : (
                                        <HugeiconsIcon icon={AiImageIcon} size={20} className="text-muted-foreground" />
                                    )}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                                    Upload
                                </Button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    if (e.target.files?.[0]) form.setData('photo', e.target.files[0]);
                                }} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialog({ open: false, edit: null })}>Cancel</Button>
                        <Button onClick={save} disabled={form.processing}>
                            {form.processing && <Spinner className="mr-1.5" />}
                            {dialog.edit ? 'Save' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Candidate</DialogTitle>
                        <DialogDescription>This will permanently remove the candidate.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                            if (deleteId) router.delete(`/admin/elections/${election.id}/candidates/${deleteId}`);
                            setDeleteId(null);
                        }}>Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
