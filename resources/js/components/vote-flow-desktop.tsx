import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight02Icon, CheckmarkCircle01Icon, ArrowLeft02Icon, UserIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useBallot, type Candidate } from '@/hooks/use-ballot';
import { verify as verifyRoute } from '@/routes';

type Props = {
    election: { id: number; title: string; description: string | null };
    open: boolean;
    onClose: () => void;
    onVoted: () => void;
};

function CandidatePhoto({ candidate, isSelected }: { candidate: Candidate; isSelected: boolean }) {
    return (
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl overflow-hidden transition-all duration-200">
            <div className="flex h-full w-full items-center justify-center bg-muted">
                {candidate.photo_url ? (
                    <img src={candidate.photo_url} alt={candidate.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        <HugeiconsIcon icon={UserIcon} size={40} />
                    </div>
                )}
            </div>
            {isSelected && (
                <div className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
            )}
        </div>
    );
}

export function VoteFlowDesktop({ election, open, onClose, onVoted }: Props) {
    const {
        ballotData, loading, submitted, receipt, error,
        currentStep, positions, currentPosition, isLastStep,
        selectedForCurrent, canProceed,
        goNext, goPrev, toggleCandidate, submit,
        positionsCompleted, loadBallot, submitting,
    } = useBallot(election, open, onVoted);

    const handleOpenChange = (isOpen: boolean) => { if (!isOpen) onClose(); };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0 border-0 bg-gradient-to-b from-background to-card" showCloseButton={false}>
                {submitted ? (
                    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/15 text-green-500">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={40} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Vote Submitted!</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Your ballot for <span className="font-medium text-foreground">{election.title}</span> has been recorded.
                            </p>
                        </div>
                        {receipt && (
                            <div className="w-full rounded-2xl border border-border/60 bg-muted/50 px-5 py-4">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Receipt Token</p>
                                <p className="text-xl font-mono font-bold tracking-widest text-primary">{receipt}</p>
                                <p className="text-[10px] text-muted-foreground mt-2">Save this to verify your vote later.</p>
                            </div>
                        )}
                        {receipt && (
                            <Button asChild className="w-full gap-2" size="lg">
                                <Link href={verifyRoute.url({ query: { token: receipt } })}>
                                    <HugeiconsIcon icon={Search01Icon} size={16} />
                                    Verify Your Vote
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" className="w-full" onClick={onClose}>Back to Dashboard</Button>
                    </div>
                ) : loading ? (
                    <div className="p-6 space-y-6 animate-pulse">
                        <div className="h-56 rounded-2xl bg-muted" />
                        <div className="space-y-3">
                            <div className="h-5 w-1/3 rounded bg-muted" />
                            <div className="h-4 w-2/3 rounded bg-muted" />
                            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-muted" />)}
                        </div>
                    </div>
                ) : !ballotData ? (
                    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-3">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${error ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                            <HugeiconsIcon icon={UserIcon} size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{error || 'Could not load ballot'}</p>
                            <p className="text-xs text-muted-foreground mt-1">Please try again or visit the election page directly.</p>
                        </div>
                        <Button size="sm" className="mt-2 gap-1.5" onClick={loadBallot}>Retry</Button>
                    </div>
                ) : (
                    <>
                        <div className="relative shrink-0 bg-gradient-to-b from-muted/20 to-transparent pt-16 pb-6">
                            {currentStep > 0 && (
                                <button onClick={goPrev} className="absolute top-4 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/40 text-muted-foreground hover:text-foreground transition-colors">
                                    <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
                                </button>
                            )}
                            <button onClick={onClose} className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border/40 text-muted-foreground hover:text-foreground transition-colors">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l12 12M13 1L1 13" /></svg>
                            </button>
                            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-8 scrollbar-none">
                                {currentPosition.candidates.map((candidate) => {
                                    const isSelected = selectedForCurrent.includes(candidate.id);
                                    return (
                                        <button key={candidate.id} onClick={() => toggleCandidate(currentPosition.id, candidate.id)} className="snap-center shrink-0 flex flex-col items-center gap-2 w-28">
                                            <CandidatePhoto candidate={candidate} isSelected={isSelected} />
                                            <span className={`text-[11px] leading-tight text-center font-medium transition-colors line-clamp-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{candidate.name.split(' ')[0]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-center gap-1.5 mt-4">
                                {positions.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-5 bg-primary' : i < currentStep ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted-foreground/20'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="relative -mt-4 flex-1 flex flex-col rounded-t-3xl bg-muted/60 dark:bg-card border-t border-x border-border/30 shadow-lg shadow-black/5 dark:shadow-none dark:border-border/10 overflow-hidden">
                            <div className="px-6 pt-6 pb-1">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-lg font-bold">{currentPosition.title}</h2>
                                    <span className="text-xs text-muted-foreground">{currentStep + 1} of {positions.length}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {currentPosition.max_selections === 1 ? 'Select one candidate' : `Select up to ${currentPosition.max_selections} candidates`}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-none">
                                {currentPosition.candidates.map((candidate) => {
                                    const isSelected = selectedForCurrent.includes(candidate.id);
                                    return (
                                        <button key={candidate.id} type="button" onClick={() => toggleCandidate(currentPosition.id, candidate.id)} className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-150 ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-sm shadow-primary/5' : 'border-border/50 hover:border-border hover:bg-muted/30'}`}>
                                            <CandidatePhoto candidate={candidate} isSelected={isSelected} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold leading-tight">{candidate.name}</p>
                                                {candidate.department && <p className="text-[11px] text-muted-foreground mt-0.5">{candidate.department}</p>}
                                                {candidate.manifesto && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">{candidate.manifesto}</p>}
                                            </div>
                                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                                                {isSelected && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="shrink-0 px-6 py-4 border-t border-border/40 bg-muted/60 dark:bg-card">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                    <span>{positionsCompleted} of {positions.length} positions selected</span>
                                    <span>{selectedForCurrent.length > 0 ? `${selectedForCurrent.length} selected` : 'None selected'}</span>
                                </div>
                                <div className="flex gap-2">
                                    {currentStep > 0 ? (
                                        <Button variant="outline" className="h-11 px-4 shrink-0" onClick={goPrev}>
                                            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="h-11 px-4 shrink-0" onClick={onClose}>
                                            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l12 12M13 1L1 13" /></svg>
                                        </Button>
                                    )}
                                    {isLastStep ? (
                                        <Button className="flex-1 gap-2 h-11 text-base" disabled={!canProceed || submitting} onClick={submit}>
                                            {submitting ? 'Submitting…' : <>Submit Ballot<HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} /></>}
                                        </Button>
                                    ) : (
                                        <Button className="flex-1 gap-2 h-11 text-base" disabled={!canProceed} onClick={goNext}>
                                            Continue<HugeiconsIcon icon={ArrowRight02Icon} size={16} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
