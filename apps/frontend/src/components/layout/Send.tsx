import { useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import MediaSelector from './MediaSelector';
import type { ContentBlock } from '@repo/shared';

export default function Send({
    onSend,
    onCancel,
    isStreaming,
}: {
    onSend: (message: ContentBlock[]) => void;
    onCancel: () => void;
    isStreaming?: boolean;
}) {
    const inputRef = useRef<HTMLDivElement>(null);
    const [message, setMessage] = useState('');
    const [media, setMedia] = useState<
        Extract<ContentBlock, { type: 'image' }>[]
    >([]);
    const isEmpty = useMemo(() => {
        return !message.trim() && (!media || media.length === 0);
    }, [message, media]);
    const send = () => {
        if (!message.trim() && (!media || media.length === 0)) return;
        const messages: ContentBlock[] = [
            {
                type: 'text',
                text: message,
            },
            ...(media as []),
        ];
        onSend(messages);
        setMessage('');
        inputRef.current!.textContent = '';
        setMedia([]);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isStreaming) {
                send();
            }
        }
    };

    return (
        <div className="p-2 sticky bottom-0 bg-white">
            <div className="max-w-3xl mx-auto flex flex-col items-center">
                <div className="w-full bg-white border border-gray-200 rounded-2xl p-2 flex flex-col items-start shadow-sm">
                    <div className="w-full">
                        <div className="flex items-center gap-x-2">
                            {media?.map((item, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={item.url}
                                        alt="media"
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <button
                                        onClick={() => {
                                            setMedia(
                                                (prev) =>
                                                    prev?.filter(
                                                        (_, i) => i !== index
                                                    ) || null
                                            );
                                        }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 bg-opacity-60 rounded-full flex items-center justify-center text-white hover:bg-opacity-80 transition-colors"
                                    >
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div
                            className="flex-1 self-stretch bg-transparent text-gray-800 text-base placeholder-gray-400 outline-none text-left break-all py-1.5 max-h-32"
                            contentEditable={true}
                            ref={inputRef}
                            onInput={(e) => {
                                setMessage(e.currentTarget.textContent || '');
                            }}
                            onKeyDown={handleKeyDown}
                        ></div>
                    </div>
                    <div className="flex w-full pt-2 border-t-1 border-gray-200">
                        <MediaSelector
                            onSelect={(newMedia) => {
                                setMedia((prev) => [
                                    ...(prev || []),
                                    ...newMedia,
                                ]);
                            }}
                        />
                        <button
                            className={`p-2 rounded-lg transition-colors flex-shrink-0 ml-auto cursor-pointer ${
                                isStreaming
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } ${
                                isEmpty && !isStreaming
                                    ? '!opacity-50 !cursor-not-allowed'
                                    : ''
                            }`}
                            onClick={() => {
                                if (isStreaming) {
                                    onCancel();
                                } else {
                                    send();
                                }
                            }}
                        >
                            {isStreaming ? (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-400 text-center !mt-2">
                    AI can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
}
