import { useEffect, useMemo } from 'react';
import '@/components/layout/chat.css';
import Chat from '@/components/layout/Chat';
import Send from '@/components/layout/Send';
import { useParams } from 'react-router';
import { messageDetail } from './api';
import { useChat } from '@/hooks/useChat';
import type { ContentBlock } from '@repo/shared';
import { useMessageStore, useStreamStore } from '@/store';
import { useSessionStore } from '@/store/sessionStore';
import { useShallow } from 'zustand/shallow';

export default function ChatPage() {
    const params = useParams();
    const id = params.id || '';

    const { tempMessage, setTempMessage } = useMessageStore(
        useShallow((s) => ({
            tempMessage: s.tempMessage,
            setTempMessage: s.setTempMessage,
            addMessage: s.addMessage,
        }))
    );
    const list = useMessageStore((s) => s.messages[id]);
    const messageList = useMemo(() => {
        return [...(list || [])];
    }, [list]);

    const sessions = useSessionStore((s) => s.sessions);
    const activeId = useSessionStore((s) => s.activeId);
    const setActive = useSessionStore((s) => s.setActive);

    const { stop } = useStreamStore.getState();
    const isStreaming = useStreamStore((s) => s.loadingMap[id] || false);

    const getDetail = async () => {
        const { data } = await messageDetail(id);
        useMessageStore.setState((state) => ({
            messages: {
                ...state.messages,
                [id]: data,
            },
        }));
    };

    useEffect(() => {
        const routeId = params.id;
        const ids = Object.entries(sessions).map(([id]) => id);
        if (routeId) {
            if (activeId !== routeId) {
                setActive(routeId);
            }
            return;
        }
        if (!activeId || !sessions[activeId]) {
            setActive(ids[ids.length - 1]);
        }
    }, [params.id, sessions, activeId, setActive]);

    const { sendMessage } = useChat();

    const handleSend = async (content: ContentBlock[]) => {
        sendMessage([...content]);
    };
    const handelCancel = () => {
        stop(id);
    };

    useEffect(() => {
        if (tempMessage) {
            sendMessage([...tempMessage]);
            setTempMessage(null);
        } else {
            if (!list?.length) {
                getDetail();
            }
        }
    }, [id]);

    return (
        <div className="flex w-full flex-1 h-full">
            <div className="flex-1 flex flex-col bg-white h-full">
                <Chat messages={messageList} />
                <Send
                    onSend={handleSend}
                    onCancel={handelCancel}
                    isStreaming={isStreaming}
                />
            </div>
        </div>
    );
}
