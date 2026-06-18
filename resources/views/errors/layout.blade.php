<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') — {{ config('app.name', 'HTU E-Voting') }}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <style>
        *, ::before, ::after {
            --tw-border-spacing-x: 0;
            --tw-border-spacing-y: 0;
            --tw-translate-x: 0;
            --tw-translate-y: 0;
            --tw-rotate: 0;
            --tw-skew-x: 0;
            --tw-skew-y: 0;
            --tw-scale-x: 1;
            --tw-scale-y: 1;
        }
        ::backdrop { --tw-border-spacing-x: 0; --tw-border-spacing-y: 0; --tw-translate-x: 0; --tw-translate-y: 0; --tw-rotate: 0; --tw-skew-x: 0; --tw-skew-y: 0; --tw-scale-x: 1; --tw-scale-y: 1; }
        *, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: #e5e7eb; }
        body { margin: 0; line-height: inherit; }
        :root {
            --background: #ffffff;
            --foreground: #0a0a0a;
            --card: #ffffff;
            --card-foreground: #0a0a0a;
            --primary: #2563eb;
            --primary-foreground: #ffffff;
            --muted: #f5f5f5;
            --muted-foreground: #737373;
            --border: #e5e5e5;
            --ring: #2563eb;
            --radius: 0.625rem;
        }
        .dark {
            --background: #0a0a0a;
            --foreground: #fafafa;
            --card: #171717;
            --card-foreground: #fafafa;
            --primary: #3b82f6;
            --primary-foreground: #ffffff;
            --muted: #262626;
            --muted-foreground: #a3a3a3;
            --border: #262626;
            --ring: #3b82f6;
        }
        body {
            font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
            background-color: var(--background);
            color: var(--foreground);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    </style>
</head>
<body class="flex min-h-screen items-center justify-center p-6">
    <div class="w-full max-w-md text-center">
        @yield('content')
        <div class="mt-8">
            <a href="/" style="display: inline-flex; align-items: center; justify-content: center; height: 2.5rem; padding: 0 1.5rem; font-size: 0.875rem; font-weight: 500; border-radius: var(--radius); background-color: var(--primary); color: var(--primary-foreground); text-decoration: none; transition: opacity 0.15s;">
                Back to Home
            </a>
        </div>
    </div>
</body>
</html>
