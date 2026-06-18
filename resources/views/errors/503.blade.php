<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>503 — {{ config('app.name', 'HTU E-Voting') }}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #f8fafc;
            color: #0f172a;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        .card {
            text-align: center;
            max-width: 28rem;
            width: 100%;
        }
        .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            background: #2563eb;
            color: white;
            font-weight: 700;
            font-size: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
        }
        .code {
            font-size: 3.75rem;
            font-weight: 700;
            line-height: 1;
            color: #2563eb;
            margin-bottom: .5rem;
        }
        .title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: .5rem;
        }
        .desc {
            font-size: .875rem;
            color: #64748b;
            margin-bottom: 2rem;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 2.5rem;
            padding: 0 1.5rem;
            font-size: .875rem;
            font-weight: 500;
            border-radius: .5rem;
            background: #2563eb;
            color: white;
            text-decoration: none;
            transition: background .15s;
        }
        .btn:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">EV</div>
        <h1 class="code">503</h1>
        <p class="title">Under Maintenance</p>
        <p class="desc">We're currently down for maintenance. Check back soon.</p>
        <a href="/" class="btn">Back to Home</a>
    </div>
</body>
</html>
