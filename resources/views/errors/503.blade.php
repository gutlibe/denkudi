@extends('errors.layout')

@section('title', 'Maintenance')

@section('content')
    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#2563EB" />
            <text x="24" y="32" textAnchor="middle" fill="white" fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="700">EV</text>
        </svg>
    </div>
    <h1 style="font-size: 3.75rem; font-weight: 700; line-height: 1; margin-bottom: 0.5rem;" role="status">503</h1>
    <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Under Maintenance</p>
    <p style="font-size: 0.875rem; color: var(--muted-foreground);">We're currently down for maintenance. Check back soon.</p>
@endsection
