import { create } from 'zustand';

type StreamStore = {
    controllerMap: Record<string, AbortController>;
    loadingMap: Record<string, boolean>;

    start: (cid: string) => AbortController;
    stop: (cid: string) => void;
    isStreaming: (cid: string) => boolean;
};

export const useStreamStore = create<StreamStore>((set, get) => ({
    controllerMap: {},
    loadingMap: {},
    start(cid) {
        const controller = new AbortController();

        set((state) => ({
            controllerMap: {
                ...state.controllerMap,
                [cid]: controller,
            },
            loadingMap: {
                ...state.loadingMap,
                [cid]: true,
            },
        }));

        return controller;
    },
    stop(cid) {
        const controller = get().controllerMap[cid];
        controller?.abort();
        set((state) => ({
            loadingMap: {
                ...state.loadingMap,
                [cid]: false,
            },
        }));
    },
    isStreaming(cid) {
        return get().loadingMap[cid] || false;
    },
}));
