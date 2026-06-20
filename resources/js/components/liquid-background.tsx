export function LiquidBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div
                className="absolute inset-0 hidden dark:block dark:opacity-[0.035]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
            />
            <div className="absolute -top-60 -left-60 h-[900px] w-[900px] rounded-full blur-[180px] animate-[liquid-1_16s_ease-in-out_infinite] bg-primary/5 dark:bg-primary/8" />
            <div className="absolute top-1/3 -right-60 h-[800px] w-[800px] rounded-full blur-[160px] animate-[liquid-2_18s_ease-in-out_infinite_3s] bg-indigo-500/3 dark:bg-indigo-500/6" />
            <div className="absolute -bottom-60 left-1/4 h-[850px] w-[850px] rounded-full blur-[180px] animate-[liquid-3_20s_ease-in-out_infinite_7s] bg-violet-500/3 dark:bg-violet-500/5" />
            <div className="absolute top-2/3 right-1/3 h-[600px] w-[600px] rounded-full blur-[140px] animate-[liquid-1_17s_ease-in-out_infinite_10s] bg-primary/3 dark:bg-primary/6" />
        </div>
    );
}
