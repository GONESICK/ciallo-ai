import { useRef, useCallback, useEffect } from 'react';

type RafCallback = (delta: number) => void;

type UseRafLoopOptions = {
    /**
     * 节流间隔（ms）
     * 0 表示每一帧都执行
     */
    interval?: number;

    /**
     * 是否自动启动（默认 false）
     */
    autoStart?: boolean;
};

type UseRafLoopReturn = {
    start: () => void;
    stop: () => void;
    isRunning: () => boolean;
};

export function useRafLoop(
    callback: RafCallback,
    options: UseRafLoopOptions = {}
): UseRafLoopReturn {
    const { interval = 0, autoStart = false } = options;

    const rafIdRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const runningRef = useRef<boolean>(false);

    // ❗避免 callback 闭包问题
    const callbackRef = useRef<RafCallback>(callback);
    callbackRef.current = callback;

    const loop = useCallback((time: number) => {
        if (!runningRef.current) return;

        if (interval === 0 || time - lastTimeRef.current >= interval) {
            callbackRef.current(time - lastTimeRef.current);
            lastTimeRef.current = time;
        }

        rafIdRef.current = requestAnimationFrame(loop);
    }, []);

    const start = useCallback(() => {
        if (runningRef.current) return;

        runningRef.current = true;
        rafIdRef.current = requestAnimationFrame(loop);
    }, [loop]);

    const stop = useCallback(() => {
        runningRef.current = false;

        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
    }, []);

    const isRunning = useCallback(() => {
        return runningRef.current;
    }, []);

    useEffect(() => {
        if (autoStart) {
            start();
        }
        return stop;
    }, [autoStart, start, stop]);

    return { start, stop, isRunning };
}
