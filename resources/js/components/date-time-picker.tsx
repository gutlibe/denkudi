import { Calendar02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { format } from 'date-fns';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type Props = {
    id: string;
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
};

export function DateTimePicker({ id, label, value, onChange }: Props) {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined,
    );
    const [time, setTime] = React.useState(
        value ? format(new Date(value), 'HH:mm') : '09:00',
    );

    const emit = (d: Date | undefined, t: string) => {
        if (!d || !onChange) {
return;
}

        const [h, m] = t.split(':');
        const dt = new Date(d);
        dt.setHours(parseInt(h), parseInt(m));
        onChange(format(dt, "yyyy-MM-dd'T'HH:mm"));
    };

    return (
        <div className="grid gap-1.5">
            {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
            <div className="flex gap-1.5">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id={`${id}-date`}
                            className="w-auto min-w-0 justify-between gap-1 px-2.5 text-sm font-normal"
                        >
                            <span className="truncate">
                                {date ? format(date, 'MMM d, yyyy') : 'Date'}
                            </span>
                            <HugeiconsIcon icon={Calendar02Icon} size={14} className="shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            defaultMonth={date}
                            onSelect={(d) => {
                                setDate(d);
                                emit(d, time);
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
                <Input
                    type="time"
                    id={`${id}-time`}
                    value={time}
                    onChange={(e) => {
                        setTime(e.target.value);
                        emit(date, e.target.value);
                    }}
                    className="w-[8.5rem] shrink-0"
                />
            </div>
        </div>
    );
}
