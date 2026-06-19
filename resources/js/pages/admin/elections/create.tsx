import { Form, Head, Link } from '@inertiajs/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function ElectionsCreate() {
    return (
        <>
            <Head title="Create Election" />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon-sm">
                        <Link href="/admin/elections">
                            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Election</h2>
                        <p className="text-muted-foreground">Set up a new election for students to vote in.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Election Details</CardTitle>
                        <CardDescription>Configure the election parameters.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action="/admin/elections"
                            method="post"
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            required
                                            placeholder="2026 SRC Presidential Election"
                                        />
                                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Select name="type" defaultValue="student_body">
                                                <SelectTrigger id="type">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="student_body">Student Body</SelectItem>
                                                    <SelectItem value="departmental">Departmental</SelectItem>
                                                    <SelectItem value="referendum">Referendum</SelectItem>
                                                    <SelectItem value="special">Special</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="scope">Scope</Label>
                                            <Input
                                                id="scope"
                                                name="scope"
                                                required
                                                placeholder="All"
                                            />
                                            {errors.scope && <p className="text-sm text-destructive">{errors.scope}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            placeholder="Describe this election..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="starts_at">Starts At</Label>
                                            <Input id="starts_at" name="starts_at" type="datetime-local" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="ends_at">Ends At</Label>
                                            <Input id="ends_at" name="ends_at" type="datetime-local" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button type="submit" disabled={processing}>
                                            Create Election
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href="/admin/elections">Cancel</Link>
                                        </Button>
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

ElectionsCreate.layout = {
    breadcrumbs: [
        { title: 'Elections', href: '/admin/elections' },
        { title: 'Create', href: '/admin/elections/create' },
    ],
};
