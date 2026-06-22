import { Form, Head } from '@inertiajs/react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />

            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Confirm password</CardTitle>
                    <CardDescription>
                        This is a secure area. Please confirm your password
                        before continuing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <PasskeyVerify
                        routes={{
                            options: confirmOptions(),
                            submit: confirmStore(),
                        }}
                        label="Confirm with passkey"
                        loadingLabel="Confirming..."
                        separator="Or confirm with password"
                    />

                    <Form {...store.form()} resetOnSuccess={['password']}>
                        {({ processing, errors }) => (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        autoComplete="current-password"
                                        autoFocus
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <Button
                                    className="w-full"
                                    disabled={processing}
                                    data-test="confirm-password-button"
                                >
                                    {processing && <Spinner />}
                                    Confirm
                                </Button>
                            </div>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirm password',
};
