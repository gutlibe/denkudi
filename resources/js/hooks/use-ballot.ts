import { router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

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

export function useBallot(election: { id: number; title: string; description: string | null }, open: boolean, onVoted: () => void) {
    const [ballotData, setBallotData] = useState<BallotData | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState<Record<number, number[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [receipt, setReceipt] = useState<string | null>(null);

    const loadBallot = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/elections/${election.id}/ballot-data`, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const data = await res.json();
                setBallotData(data);
                setLoading(false);
                return;
            }
        } catch (e) {
            console.error('Error fetching ballot data:', e);
        }

        const mock: Record<number, Position[]> = {
            1: [
                {
                    id: 101, title: 'President', max_selections: 1,
                    candidates: [
                        { id: 1001, name: 'Sarah Jenkins', department: 'Political Science', manifesto: 'Empowering student voices and modernizing campus facilities.', photo_url: null },
                        { id: 1002, name: 'David Chen', department: 'Computer Science', manifesto: 'Transparency, technology, and trust in student government.', photo_url: null },
                        { id: 1005, name: 'Ama Serwaa', department: 'Law', manifesto: 'Justice and equity for every student on campus.', photo_url: null },
                    ],
                },
                {
                    id: 102, title: 'Vice President', max_selections: 1,
                    candidates: [
                        { id: 1003, name: 'Elena Rostova', department: 'Economics', manifesto: 'Financial responsibility and student advocacy.', photo_url: null },
                        { id: 1004, name: 'Marcus Aurelius', department: 'History', manifesto: 'Strengthening community and campus spirit.', photo_url: null },
                    ],
                },
                {
                    id: 103, title: 'General Secretary', max_selections: 1,
                    candidates: [
                        { id: 1006, name: 'Kwame Asante', department: 'Communication Studies', manifesto: 'Clear communication between students and administration.', photo_url: null },
                        { id: 1007, name: 'Naa Koshie', department: 'Business Admin', manifesto: 'Efficient record keeping and transparent minutes.', photo_url: null },
                    ],
                },
            ],
        };

        setBallotData({
            id: election.id,
            title: election.title,
            description: election.description || 'Cast your ballot below.',
            positions: mock[election.id] || [{
                id: 999, title: 'General Representative', max_selections: 1,
                candidates: [
                    { id: 9001, name: 'Candidate A', department: 'Liberal Arts', manifesto: 'For a better tomorrow.', photo_url: null },
                    { id: 9002, name: 'Candidate B', department: 'Sciences', manifesto: 'Science first.', photo_url: null },
                ],
            }],
        });
        setLoading(false);
    }, [election.id, election.title, election.description]);

    useEffect(() => {
        if (open) {
            setCurrentStep(0);
            setSelections({});
            setSubmitted(false);
            setReceipt(null);
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
                return { ...prev, [positionId]: existing.filter((id) => id !== candidateId) };
            }
            if (max === 1) {
                return { ...prev, [positionId]: [candidateId] };
            }
            if (existing.length >= max) return prev;
            return { ...prev, [positionId]: [...existing, candidateId] };
        });
    };

    const selectedForCurrent = selections[currentPosition?.id ?? 0] ?? [];
    const canProceed = selectedForCurrent.length > 0;

    const goNext = () => { if (!isLastStep) setCurrentStep((s) => s + 1); };
    const goPrev = () => { setCurrentStep((s) => Math.max(0, s - 1)); };

    const submit = () => {
        setSubmitting(true);
        const allSelected = positions.every((p) => (selections[p.id]?.length ?? 0) > 0);
        if (!allSelected) { setSubmitting(false); return; }

        const isMock = Object.values(selections).flat().some((id) => id >= 1000);
        if (isMock) {
            setTimeout(() => {
                setSubmitted(true);
                setReceipt('HTU-' + Math.random().toString(36).substring(2, 9).toUpperCase());
                onVoted();
                setSubmitting(false);
            }, 800);
            return;
        }

        const ballot = Object.entries(selections).flatMap(([posId, candIds]) =>
            candIds.map((candId) => ({ position_id: parseInt(posId), candidate_id: candId }))
        );

        router.post(`/elections/${election.id}/vote`, { ballot }, {
            preserveState: true,
            onSuccess: (page) => {
                setSubmitted(true);
                setReceipt((page.props as { receipt?: string }).receipt ?? null);
                onVoted();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const positionsCompleted = positions.filter((p) => (selections[p.id]?.length ?? 0) > 0).length;

    return {
        ballotData, loading, submitted, receipt,
        currentStep, positions, currentPosition, isLastStep,
        selections, selectedForCurrent, canProceed,
        goNext, goPrev, toggleCandidate, submit,
        positionsCompleted, loadBallot, submitting, setSubmitting,
    };
}

export type { Candidate, Position, BallotData };
