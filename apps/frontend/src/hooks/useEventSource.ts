import {
    fetchEventSource,
    type EventSourceMessage,
} from '@microsoft/fetch-event-source';
import { useRef } from 'react';

type UseEventSourceOptions = Omit<
    Parameters<typeof fetchEventSource>[1],
    'signal'
> & {
    url: string;
    onmessage?: (message: EventSourceMessage) => void;
    onopen?: (response: Response) => void;
    onerror?: (error: any) => void;
};

export function useEventSource(options: UseEventSourceOptions) {
    const controller = useRef<AbortController | null>(null);
    let runningPromise: Promise<void> | null = null;
    const { url, ...opts } = options;

    const isRunning = () => !!controller.current;

    const start = (option?: Partial<UseEventSourceOptions>) => {
        if (isRunning()) return runningPromise;
        controller.current = new AbortController();
        runningPromise = fetchEventSource(url, {
            ...{ ...opts, ...option },
            signal: controller.current.signal,
            onmessage: (e) => {
                options.onmessage?.(e);
            },
            onopen: async (res) => {
                options.onopen?.(res);
            },
            onerror: (err) => {
                options.onerror?.(err);
                throw err;
            },
            onclose: () => {
                options.onclose?.();
                controller.current = null;
                runningPromise = null;
            },
        });
        return runningPromise;
    };

    const stop = () => {
        if (!controller.current) return;
        controller.current.abort();
        controller.current = null;
        runningPromise = null;
    };

    return { start, stop, isRunning } as const;
}
