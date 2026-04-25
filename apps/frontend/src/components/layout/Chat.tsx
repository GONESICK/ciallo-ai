import { useRef, useState, useEffect, useCallback } from 'react';
import DotLoading from './Loading';
import { Render } from './Render';
import type { Message } from '@repo/shared';

export default function Chat({ messages }: { messages: Message[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const isAtBottomRef = useRef(true);
    const prevMessagesLengthRef = useRef(0);
    const checkIsAtBottom = () => {
        const el = scrollRef.current;
        if (!el) return true;

        const { scrollTop, scrollHeight, clientHeight } = el;
        return scrollHeight - scrollTop - clientHeight < 100;
    };

    const handleScroll = useCallback(() => {
        const isAtBottom = checkIsAtBottom();
        isAtBottomRef.current = isAtBottom;
        setShowScrollBtn(!isAtBottom);
    }, []);

    const rafIdRef = useRef<number | null>(null);

    const scrollToBottom = (immediate?: boolean) => {
        const el = scrollRef.current;
        if (!el) return;

        // Cancel pending RAF if any
        if (rafIdRef.current) return;

        if (immediate) {
            el.scrollTop = el.scrollHeight;
            return;
        }

        rafIdRef.current = requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
            rafIdRef.current = null;
        });
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Handle scroll behavior when messages change
    useEffect(() => {
        if (!messages || messages.length === 0) return;

        const isNewMessage = messages.length !== prevMessagesLengthRef.current;

        // If new message added (user sent message), always scroll to bottom
        if (isNewMessage) {
            scrollToBottom();
            isAtBottomRef.current = true;
        }
        // If AI is streaming and user is at bottom, follow the content
        else if (isAtBottomRef.current) {
            scrollToBottom();
        }

        prevMessagesLengthRef.current = messages.length;
    }, [messages]);

    return (
        <div
            ref={scrollRef}
            className="h-full mx-auto overflow-y-auto w-full max-w-3xl scrollbar-none relative"
        >
            <div className="flex flex-col h-full w-full">
                <div className="flex-1">
                    <div className="mx-auto py-8 space-y-6 max-w-4xl">
                        {messages.map((m, i) =>
                            m.role === 'assistant' ? (
                                <div className="flex gap-4 items-start" key={i}>
                                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">
                                            AI
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-gray-800 text-base leading-relaxed text-left">
                                            {m.status === 'thinking' && (
                                                <DotLoading />
                                            )}
                                            <Render content={m.content} />
                                        </div>
                                    </div>
                                </div>
                            ) : m.role === 'user' ? (
                                <div
                                    className="flex gap-4 justify-end items-start"
                                    key={i}
                                >
                                    <div className="max-w-xl">
                                        <div className="bg-gray-100 rounded-2xl px-4 py-1 text-gray-800 text-base leading-relaxed text-left">
                                            <Render content={m.content} />
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">
                                            U
                                        </span>
                                    </div>
                                </div>
                            ) : null
                        )}
                    </div>
                </div>
            </div>
            {showScrollBtn && (
                <button
                    onClick={() => {
                        scrollToBottom(true);
                        isAtBottomRef.current = true;
                    }}
                    className="fixed bottom-50 right-50 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                    title="Scroll to bottom"
                >
                    <svg
                        className="w-3 h-3 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}
