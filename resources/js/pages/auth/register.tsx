import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">
                        Create your account
                    </CardTitle>
                    <CardDescription>
                        Enter your details to join the HTU e-voting platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password', 'password_confirmation']}
                        disableWhileProcessing
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="first_name">
                                                First name
                                            </Label>
                                            <Input
                                                id="first_name"
                                                type="text"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="given-name"
                                                name="first_name"
                                                placeholder="John"
                                            />
                                            <InputError
                                                message={errors.first_name}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="last_name">
                                                Last name
                                            </Label>
                                            <Input
                                                id="last_name"
                                                type="text"
                                                required
                                                tabIndex={2}
                                                autoComplete="family-name"
                                                name="last_name"
                                                placeholder="Doe"
                                            />
                                            <InputError
                                                message={errors.last_name}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="student_id">
                                            Student ID
                                        </Label>
                                        <Input
                                            id="student_id"
                                            type="text"
                                            required
                                            tabIndex={3}
                                            name="student_id"
                                            placeholder="0000000000"
                                            maxLength={10}
                                            inputMode="numeric"
                                            pattern="\d{10}"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Your 10-digit student ID. You'll log
                                            in with it.
                                        </p>
                                        <InputError
                                            message={errors.student_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            name="password"
                                            placeholder="Password"
                                            passwordrules={passwordRules}
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            required
                                            tabIndex={5}
                                            autoComplete="new-password"
                                            name="password_confirmation"
                                            placeholder="Confirm password"
                                            passwordrules={passwordRules}
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mt-2 w-full"
                                        tabIndex={6}
                                        data-test="register-user-button"
                                    >
                                        {processing && <Spinner />}
                                        Create account
                                    </Button>
                                </div>

                                <div className="text-center text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <TextLink href={login()} tabIndex={7}>
                                        Log in
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
};
