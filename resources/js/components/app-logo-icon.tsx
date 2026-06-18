import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#2563EB" />
            <text
                x="24"
                y="32"
                textAnchor="middle"
                fill="white"
                fontFamily="system-ui, sans-serif"
                fontSize="22"
                fontWeight="700"
                letterSpacing="0.05em"
            >
                EV
            </text>
        </svg>
    );
}
