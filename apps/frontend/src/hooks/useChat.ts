import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useSessionStore } from '@/store';
import { useMessageStore } from '@/store';
import { useStreamStore } from '@/store';
import type { ContentBlock } from '@repo/shared';
import { useShallow } from 'zustand/shallow';
import { handleEvent, buildInputBlock } from '@/utils/adapter';

export function useChat() {
    const { addMessage } = useMessageStore.getState();
    const { activeId } = useSessionStore.getState();
    const { start, stop } = useStreamStore(
        useShallow((s) => {
            return {
                start: s.start,
                stop: s.stop,
            };
        })
    );

    async function sendMessage(content: ContentBlock[]) {
        const cid = activeId as string;
        const mid = crypto.randomUUID();

        // 用户消息
        addMessage(cid, {
            id: crypto.randomUUID(),
            role: 'user',
            type: 'message',
            content,
            status: 'done',
        });

        // AI占位
        addMessage(cid, {
            id: mid,
            role: 'assistant',
            type: 'message',
            content: [],
            status: 'thinking',
        });

        const controller = start(cid);

        const lastMessages = useMessageStore.getState().messages;
        const previous_response_id =
            useSessionStore.getState().sessions[cid].previous_response_id;
        const currentMessages = lastMessages[cid];
        const currentReply = currentMessages[currentMessages.length - 2];
        const input = buildInputBlock([currentReply], previous_response_id);
        fetchEventSource('/api/chat/sse', {
            method: 'POST',
            signal: controller.signal,
            openWhenHidden: true,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: cid,
                input: input,
                previous_response_id,
            }),
            onmessage(ev) {
                handleEvent(ev, cid, mid);
            },
            onclose() {
                stop(cid);
            },

            onerror() {
                stop(cid);
            },
        });
    }

    return { sendMessage };
}
