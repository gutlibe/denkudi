import { useState, useEffect, useCallback } from 'react';

const xsrfToken = () =>
    decodeURIComponent(
        document.cookie.replace(
            /(?:(?:^|.*;\s*)XSRF-TOKEN\s*=\s*([^;]*).*$)|^.*$/,
            '$1',
        ),
    );

type Candidate = {
    id: number;
    name: string;
    department: string | null;
    manifesto: string | null;
    photo_url: string | null;
};

type Position = {
    id: number;
    title: string;
    max_selections: number;
    candidates: Candidate[];
};

type BallotData = {
    id: number;
    title: string;
    description: string | null;
    positions: Position[];
};

export function useBallot(
    election: { id: number; title: string; description: string | null },
    open: boolean,
    onVoted: () => void,
) {
    const [ballotData, setBallotData] = useState<BallotData | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState<Record<number, number[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [receipt, setReceipt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const loadBallot = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/elections/${election.id}/ballot-data`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                credentials: 'include',
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);

                throw new Error(body?.message ?? 'Failed to load ballot data.');
            }

            const data = await res.json();

            if (data.alreadyVoted) {
                setError('You have already voted in this election.');
                setLoading(false);

                return;
            }

            setBallotData(data);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : 'Failed to load ballot data.',
            );
        }

        setLoading(false);
    }, [election.id]);

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentStep(0);
            setSelections({});
            setSubmitted(false);
            setReceipt(null);
            setSubmitError(null);
            loadBallot();
        } else {
            setBallotData(null);
        }
    }, [open, loadBallot]);

    const positions = ballotData?.positions ?? [];
    const currentPosition = positions[currentStep];
    const isLastStep = currentStep === positions.length - 1;

    const toggleCandidate = (positionId: number, candidateId: number) => {
        setSelections((prev) => {
            const existing = prev[positionId] ?? [];
            const max = currentPosition?.max_selections ?? 1;

            if (existing.includes(candidateId)) {
                return {
                    ...prev,
                    [positionId]: existing.filter((id) => id !== candidateId),
                };
            }

            if (max === 1) {
                return { ...prev, [positionId]: [candidateId] };
            }

            if (existing.length >= max) {
                return prev;
            }

            return { ...prev, [positionId]: [...existing, candidateId] };
        });
    };

    const selectedForCurrent = selections[currentPosition?.id ?? 0] ?? [];
    const canProceed = selectedForCurrent.length > 0;

    const goNext = () => {
        if (!isLastStep) {
            setCurrentStep((s) => s + 1);
        }
    };
    const goPrev = () => {
        setCurrentStep((s) => Math.max(0, s - 1));
    };

    const submit = async () => {
        const allSelected = positions.every(
            (p) => (selections[p.id]?.length ?? 0) > 0,
        );

        if (!allSelected) {
            setSubmitError('Please make a selection for every position.');

            return;
        }

        setSubmitError(null);
        setSubmitting(true);

        const ballot = Object.entries(selections).flatMap(([posId, candIds]) =>
            candIds.map((candId) => ({
                position_id: parseInt(posId),
                candidate_id: candId,
            })),
        );

        // A plain fetch (not Inertia's router) so a successful or failed
        // submission never triggers a full Inertia page navigation away
        // from the dashboard — the sheet stays in place either way.
        try {
            const res = await fetch(`/elections/${election.id}/vote`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                credentials: 'include',
                body: JSON.stringify({ ballot }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSubmitError(data.message ?? 'Failed to submit ballot.');

                return;
            }

            setSubmitted(true);
            setReceipt(data.receipt ?? null);
            onVoted();
        } catch {
            setSubmitError(
                'Failed to submit ballot. Check your connection and try again.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const positionsCompleted = positions.filter(
        (p) => (selections[p.id]?.length ?? 0) > 0,
    ).length;

    return {
        ballotData,
        loading,
        submitted,
        receipt,
        error,
        setError,
        submitError,
        currentStep,
        positions,
        currentPosition,
        isLastStep,
        selections,
        selectedForCurrent,
        canProceed,
        goNext,
        goPrev,
        toggleCandidate,
        submit,
        positionsCompleted,
        loadBallot,
        submitting,
    };
}

export type { Candidate, Position, BallotData };
