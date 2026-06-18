// Components
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Forgot password</CardTitle>
                    <CardDescription>
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...email.form()} className="flex flex-col gap-6">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Student email</Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        name="email"
                                        autoComplete="off"
                                        autoFocus
                                        placeholder="0000000000@htu.edu.gh"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <Button
                                    className="w-full"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && <Spinner />}
                                    Send reset link
                                </Button>

                                <div className="text-center text-sm text-muted-foreground">
                                    <TextLink href={login()}>Back to log in</TextLink>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
};
