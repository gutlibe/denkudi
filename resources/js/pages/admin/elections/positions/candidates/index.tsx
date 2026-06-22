import {
    PlusSignIcon,
    PencilEdit02Icon,
    Delete01Icon,
    UserIcon,
    AiImageIcon,
    Doc01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Head, Link, router, useForm, setLayoutProps } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Candidate = { id: number; name: string; department: string | null; manifesto: string | null; photo_url: string | null };
type Props = { election: { id: number; title: string }; position: { id: number; title: string; max_selections: number; candidates: Candidate[] } };

export default function CandidatesIndex({ election, position }: Props) {
    setLayoutProps({ breadcrumbs: [{ title: 'Elections', href: '/admin/elections' }, { title: election.title, href: `/admin/elections/${election.id}/manage` }, { title: position.title, href: '#' }] });

    const [dialog, setDialog] = useState<{ open: boolean; edit: Candidate | null }>({ open: false, edit: null });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving] = useState(false);
    const [viewManifesto, setViewManifesto] = useState<{ name: string; text: string } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const form = useForm({ name: '', department: '', manifesto: '', position_id: 0, photo: null as File | null });

    const openDialog = (edit: Candidate | null) => {
        form.setData({
            name: edit?.name ?? '',
            department: edit?.department ?? '',
            manifesto: edit?.manifesto ?? '',
            position_id: position.id,
            photo: null,
        });
        setDialog({ open: true, edit });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const base = `/admin/elections/${election.id}/candidates`;

        console.log('Submitting...', { edit: !!dialog.edit, name: form.data.name, hasPhoto: !!form.data.photo });

        if (dialog.edit) {
            const data: Record<string, unknown> = {
                _method: 'put',
                name: form.data.name,
                position_id: String(position.id),
                department: form.data.department,
                manifesto: form.data.manifesto,
            };

            if (form.data.photo) {
data.photo = form.data.photo;
}

            router.post(`${base}/${dialog.edit.id}`, data as unknown as Record<string, string | File>, {
                forceFormData: true,
                onSuccess: () => {
 console.log('Edit success'); setDialog({ open: false, edit: null }); window.location.reload(); 
},
                onError: (e) => console.log('Edit error', e),
            });
        } else {
            form.post(base, {
                onSuccess: () => {
 console.log('Add success'); setDialog({ open: false, edit: null }); window.location.reload(); 
},
                onError: (e) => console.log('Add error', e),
            });
        }
    };

    return (
        <>
            <Head title={`Candidates — ${position.title}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{position.title}</h2>
                        <p className="text-muted-foreground mt-1">{position.max_selections === 1 ? 'Single choice' : `Up to ${position.max_selections}`} &middot; {position.candidates.length} candidate{position.candidates.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Button size="sm" onClick={() => openDialog(null)}><HugeiconsIcon icon={PlusSignIcon} size={14} className="mr-1" />Add Candidate</Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/admin/elections" className="hover:text-foreground">Elections</Link><span>/</span><Link href={`/admin/elections/${election.id}/manage`} className="hover:text-foreground">{election.title}</Link></div>
                {position.candidates.length === 0 ? (
                    <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center"><CardTitle className="text-base">No candidates yet</CardTitle><CardDescription className="mt-1">Add candidates for this position.</CardDescription></CardContent></Card>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {position.candidates.map((c) => (
                            <Card key={c.id} className="flex-row items-center gap-4 p-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                    {c.photo_url ? (
                                        <img src={c.photo_url} alt={c.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <HugeiconsIcon icon={UserIcon} size={28} className="text-muted-foreground" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{c.name}</p>
                                    {c.department && <p className="truncate text-xs text-muted-foreground">{c.department}</p>}
                                    <div className="mt-2 flex items-center gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon-sm" onClick={() => openDialog(c)}>
                                                    <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit</TooltipContent>
                                        </Tooltip>
                                        {c.manifesto && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => setViewManifesto({ name: c.name, text: c.manifesto! })}>
                                                        <HugeiconsIcon icon={Doc01Icon} size={14} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>View manifesto</TooltipContent>
                                            </Tooltip>
                                        )}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(c.id)}>
                                                    <HugeiconsIcon icon={Delete01Icon} size={14} />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Remove</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <Dialog open={dialog.open} onOpenChange={(o) => !o && setDialog({ open: false, edit: null })}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{dialog.edit ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle><DialogDescription>{dialog.edit ? 'Update candidate details.' : `Add a candidate for ${position.title}.`}</DialogDescription></DialogHeader>
                    <form onSubmit={submit} className="flex flex-col gap-4 py-4">
                        <div className="grid gap-2"><Label htmlFor="cand-name">Name</Label><Input id="cand-name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Full name" /></div>
                        <div className="grid gap-2"><Label htmlFor="cand-dept">Department</Label><Input id="cand-dept" value={form.data.department} onChange={(e) => form.setData('department', e.target.value)} placeholder="Computer Science" /></div>
                        <div className="grid gap-2"><Label htmlFor="cand-manifesto">Manifesto ({form.data.manifesto.length}/5000)</Label><Textarea id="cand-manifesto" rows={4} maxLength={5000} value={form.data.manifesto} onChange={(e) => form.setData('manifesto', e.target.value)} placeholder="Campaign statement..." /></div>
                        <div className="grid gap-2">
                            <Label>Photo</Label>
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
                                    {form.data.photo ? <img src={URL.createObjectURL(form.data.photo)} className="h-12 w-12 object-cover" /> : dialog.edit?.photo_url ? <img src={dialog.edit.photo_url} className="h-12 w-12 object-cover" /> : <HugeiconsIcon icon={AiImageIcon} size={20} className="text-muted-foreground" />}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Upload</Button>
                                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
 const f = e.target.files?.[0];

 if (f) {
form.setData('photo', f);
} 
}} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialog({ open: false, edit: null })}>Cancel</Button>
                            <Button type="submit" disabled={saving}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Remove Candidate</DialogTitle><DialogDescription>This will permanently remove the candidate.</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" onClick={() => {
 if (deleteId) {
router.delete(`/admin/elections/${election.id}/candidates/${deleteId}`);
}

 setDeleteId(null); 
}}>Remove</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={viewManifesto !== null} onOpenChange={() => setViewManifesto(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{viewManifesto?.name}</DialogTitle><DialogDescription>Manifesto</DialogDescription></DialogHeader>
                    <ScrollArea className="max-h-80">
                        <div className="py-2 text-sm whitespace-pre-wrap leading-relaxed pr-4">{viewManifesto?.text}</div>
                    </ScrollArea>
                    <DialogFooter><Button variant="outline" onClick={() => setViewManifesto(null)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
