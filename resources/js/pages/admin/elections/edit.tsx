import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { DateTimePicker } from '@/components/date-time-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Props = {
    election: {
        id: number;
        title: string;
        type: string;
        scope: string;
        description: string | null;
        status: string;
        starts_at: string | null;
        ends_at: string | null;
    };
};

export default function ElectionsEdit({ election }: Props) {
    const [startsAt, setStartsAt] = useState(election.starts_at ?? '');
    const [endsAt, setEndsAt] = useState(election.ends_at ?? '');

    return (
        <>
            <Head title={`Edit — ${election.title}`} />
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Edit Election</h2>
                    <p className="text-muted-foreground">{election.title}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Election Details</CardTitle>
                        <CardDescription>Update the election parameters.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={`/admin/elections/${election.id}`}
                            method="put"
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input id="title" name="title" required defaultValue={election.title} />
                                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Select name="type" defaultValue={election.type}>
                                                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="student_body">Student Body</SelectItem>
                                                    <SelectItem value="departmental">Departmental</SelectItem>
                                                    <SelectItem value="referendum">Referendum</SelectItem>
                                                    <SelectItem value="special">Special</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="scope">Scope</Label>
                                            <Input id="scope" name="scope" required defaultValue={election.scope} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" name="description" rows={3} defaultValue={election.description ?? ''} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Schedule</Label>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <DateTimePicker id="starts_at" label="Starts" value={startsAt} onChange={setStartsAt} />
                                            <DateTimePicker id="ends_at" label="Ends" value={endsAt} onChange={setEndsAt} />
                                        </div>
                                    </div>
                                    <input type="hidden" name="starts_at" value={startsAt} />
                                    <input type="hidden" name="ends_at" value={endsAt} />

                                    <div className="flex items-center gap-3">
                                        <Button type="submit" disabled={processing}>Save Changes</Button>
                                        <Button asChild variant="outline"><Link href="/admin/elections">Cancel</Link></Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ElectionsEdit.layout = {
    breadcrumbs: [
        { title: 'Elections', href: '/admin/elections' },
        { title: 'Edit', href: '#' },
    ],
};
