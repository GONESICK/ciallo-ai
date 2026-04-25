import { create } from 'zustand';
import type { ContentBlock, Message } from '@repo/shared';

type MessageStore = {
    previous_response_id: string | null;
    messages: Record<string, Message[]>; // key = sessionId
    tempMessage: ContentBlock[] | null;
    setTempMessage: (message: ContentBlock[] | null) => void;
    addMessage: (cid: string, msg: Message | Message[]) => void;
    updateMessage: (
        cid: string,
        mid: string,
        updater: (msg: Message) => void
    ) => void;
};

export const useMessageStore = create<MessageStore>((set) => ({
    previous_response_id: null,
    messages: {},
    tempMessage: null,
    setTempMessage(tempMessage) {
        set({
            tempMessage,
        });
    },
    addMessage(cid, msg) {
        const added = Array.isArray(msg) ? msg : [msg];
        set((state) => ({
            messages: {
                ...state.messages,
                [cid]: [...(state.messages[cid] || []), ...added],
            },
        }));
    },
    updateMessage(cid, mid, updater) {
        set((state) => {
            const list = state.messages[cid] || [];

            const newList = list.map((msg) => {
                if (msg.id !== mid) return msg;

                const newMsg = { ...msg };
                updater(newMsg);
                return newMsg;
            });

            return {
                messages: {
                    ...state.messages,
                    [cid]: newList,
                },
            };
        });
    },
}));
