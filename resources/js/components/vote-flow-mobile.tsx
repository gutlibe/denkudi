import {
    ArrowRight02Icon,
    CheckmarkCircle01Icon,
    ArrowLeft02Icon,
    UserIcon,
    Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBallot } from '@/hooks/use-ballot';
import type { Candidate } from '@/hooks/use-ballot';
import { verify as verifyRoute } from '@/routes';

type Props = {
    election: { id: number; title: string; description: string | null };
    open: boolean;
    onClose: () => void;
    onVoted: () => void;
};

function CandidatePhoto({
    candidate,
    isSelected,
}: {
    candidate: Candidate;
    isSelected: boolean;
}) {
    return (
        <div className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl transition-all duration-200">
            <div className="flex h-full w-full items-center justify-center bg-muted">
                {candidate.photo_url ? (
                    <img
                        src={candidate.photo_url}
                        alt={candidate.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        <HugeiconsIcon icon={UserIcon} size={32} />
                    </div>
                )}
            </div>
            {isSelected && (
                <div className="absolute right-1.5 bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-md">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path
                            d="M2 6L5 9L10 3"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
}

export function VoteFlowMobile({ election, open, onClose, onVoted }: Props) {
    const {
        ballotData,
        loading,
        submitted,
        receipt,
        error,
        currentStep,
        positions,
        currentPosition,
        isLastStep,
        selectedForCurrent,
        canProceed,
        goNext,
        goPrev,
        toggleCandidate,
        submit,
        positionsCompleted,
        loadBallot,
        submitting,
    } = useBallot(election, open, onVoted);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex animate-in flex-col bg-gradient-to-b from-background to-card duration-200 fade-in">
            {submitted ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/15 text-green-500">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Vote Submitted!</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your ballot for{' '}
                            <span className="font-medium text-foreground">
                                {election.title}
                            </span>{' '}
                            has been recorded.
                        </p>
                    </div>
                    {receipt && (
                        <div className="w-full rounded-2xl border border-border/60 bg-muted/50 px-5 py-4">
                            <p className="mb-2 text-[10px] tracking-wider text-muted-foreground uppercase">
                                Receipt Token
                            </p>
                            <p className="font-mono text-xl font-bold tracking-widest text-primary">
                                {receipt}
                            </p>
                            <p className="mt-2 text-[10px] text-muted-foreground">
                                Save this to verify your vote later.
                            </p>
                        </div>
                    )}
                    {receipt && (
                        <Button asChild className="w-full gap-2" size="lg">
                            <Link
                                href={verifyRoute.url({
                                    query: { token: receipt },
                                })}
                            >
                                <HugeiconsIcon icon={Search01Icon} size={16} />
                                Verify Your Vote
                            </Link>
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                    >
                        Back to Dashboard
                    </Button>
                </div>
            ) : loading ? (
                <div className="flex flex-col">
                    <div className="relative shrink-0 bg-gradient-to-b from-muted/20 to-transparent pt-12 pb-6">
                        <div className="flex scrollbar-none gap-3 overflow-x-auto px-8">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex w-20 shrink-0 flex-col items-center gap-2"
                                >
                                    <Skeleton className="h-18 w-18 rounded-2xl" />
                                    <Skeleton className="h-3 w-14" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-1.5">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-1.5 w-1.5 rounded-full bg-muted"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="relative -mt-4 flex flex-1 flex-col overflow-hidden rounded-t-3xl border-x border-t border-border/30 bg-muted/60 shadow-lg shadow-black/5 dark:border-border/10 dark:bg-card">
                        <div className="space-y-3 px-6 pt-6">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-56" />
                        </div>
                        <div className="flex-1 space-y-2 px-4 py-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 rounded-2xl border border-border/50 p-3.5"
                                >
                                    <Skeleton className="h-18 w-18 shrink-0 rounded-2xl" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                </div>
                            ))}
                        </div>
                        <div className="shrink-0 space-y-3 border-t border-border/40 px-6 py-4">
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-11 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            ) : !ballotData ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                    <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${error ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}
                    >
                        <HugeiconsIcon icon={UserIcon} size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">
                            {error || 'Could not load ballot'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Please try again or visit the election page
                            directly.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="mt-2 gap-1.5"
                        onClick={loadBallot}
                    >
                        Retry
                    </Button>
                </div>
            ) : (
                <>
                    <div className="relative shrink-0 bg-gradient-to-b from-muted/20 to-transparent pt-12 pb-6">
                        {currentStep > 0 && (
                            <button
                                onClick={goPrev}
                                className="absolute top-4 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
                            >
                                <HugeiconsIcon
                                    icon={ArrowLeft02Icon}
                                    size={14}
                                />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M1 1l12 12M13 1L1 13" />
                            </svg>
                        </button>
                        <div className="flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto px-8">
                            {currentPosition.candidates.map((candidate) => {
                                const isSelected = selectedForCurrent.includes(
                                    candidate.id,
                                );

                                return (
                                    <button
                                        key={candidate.id}
                                        onClick={() =>
                                            toggleCandidate(
                                                currentPosition.id,
                                                candidate.id,
                                            )
                                        }
                                        className="flex w-20 shrink-0 snap-center flex-col items-center gap-2"
                                    >
                                        <CandidatePhoto
                                            candidate={candidate}
                                            isSelected={isSelected}
                                        />
                                        <span
                                            className={`line-clamp-2 text-center text-[11px] leading-tight font-medium transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                                        >
                                            {candidate.name.split(' ')[0]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-1.5">
                            {positions.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-5 bg-primary' : i < currentStep ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted-foreground/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="relative -mt-4 flex flex-1 flex-col overflow-hidden rounded-t-3xl border-x border-t border-border/30 bg-muted/60 shadow-lg shadow-black/5 dark:border-border/10 dark:bg-card dark:shadow-none">
                        <div className="px-6 pt-6 pb-1">
                            <div className="flex items-baseline justify-between">
                                <h2 className="text-lg font-bold">
                                    {currentPosition.title}
                                </h2>
                                <span className="text-xs text-muted-foreground">
                                    {currentStep + 1} of {positions.length}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {currentPosition.max_selections === 1
                                    ? 'Select one candidate'
                                    : `Select up to ${currentPosition.max_selections} candidates`}
                            </p>
                        </div>
                        <div className="flex-1 scrollbar-none space-y-2 overflow-y-auto px-4 py-3">
                            {currentPosition.candidates.map((candidate) => {
                                const isSelected = selectedForCurrent.includes(
                                    candidate.id,
                                );

                                return (
                                    <button
                                        key={candidate.id}
                                        type="button"
                                        onClick={() =>
                                            toggleCandidate(
                                                currentPosition.id,
                                                candidate.id,
                                            )
                                        }
                                        className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-150 ${isSelected ? 'border-primary bg-primary/5 shadow-sm ring-1 shadow-primary/5 ring-primary/30' : 'border-border/50 hover:border-border hover:bg-muted/30'}`}
                                    >
                                        <CandidatePhoto
                                            candidate={candidate}
                                            isSelected={isSelected}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm leading-tight font-semibold">
                                                {candidate.name}
                                            </p>
                                            {candidate.department && (
                                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                    {candidate.department}
                                                </p>
                                            )}
                                            {candidate.manifesto && (
                                                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                                                    {candidate.manifesto}
                                                </p>
                                            )}
                                        </div>
                                        <div
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}
                                        >
                                            {isSelected && (
                                                <HugeiconsIcon
                                                    icon={CheckmarkCircle01Icon}
                                                    size={10}
                                                />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="shrink-0 border-t border-border/40 bg-muted/60 px-6 py-4 dark:bg-card">
                            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    {positionsCompleted} of {positions.length}{' '}
                                    selected
                                </span>
                                <span>
                                    {selectedForCurrent.length > 0
                                        ? `${selectedForCurrent.length} selected`
                                        : 'None selected'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {currentStep > 0 ? (
                                    <Button
                                        variant="outline"
                                        className="h-11 shrink-0 px-4"
                                        onClick={goPrev}
                                    >
                                        <HugeiconsIcon
                                            icon={ArrowLeft02Icon}
                                            size={16}
                                        />
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="h-11 shrink-0 px-4"
                                        onClick={onClose}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M1 1l12 12M13 1L1 13" />
                                        </svg>
                                    </Button>
                                )}
                                {isLastStep ? (
                                    <Button
                                        className="h-11 flex-1 gap-2 text-base"
                                        disabled={!canProceed || submitting}
                                        onClick={submit}
                                    >
                                        {submitting ? (
                                            'Submitting…'
                                        ) : (
                                            <>
                                                Submit Ballot
                                                <HugeiconsIcon
                                                    icon={CheckmarkCircle01Icon}
                                                    size={16}
                                                />
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        className="h-11 flex-1 gap-2 text-base"
                                        disabled={!canProceed}
                                        onClick={goNext}
                                    >
                                        Continue
                                        <HugeiconsIcon
                                            icon={ArrowRight02Icon}
                                            size={16}
                                        />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
