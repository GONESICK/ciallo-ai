export type ChatRole = 'system' | 'user' | 'assistant';

type BaseContent<T extends string, K extends string, V> = {
    type: T;
} & {
    [P in K]: V;
};

export type TextContent = BaseContent<'text', 'text', string>;

export type ImageContent = BaseContent<
    'image_url',
    'image_url',
    {
        url: string;
    }
>;

export type VideoContent = BaseContent<
    'video_url',
    'video_url',
    {
        url: string;
    }
>;

export type AudioContent = BaseContent<
    'audio_url',
    'audio_url',
    {
        url: string;
    }
>;

export type ContentItem =
    | TextContent
    | ImageContent
    | VideoContent
    | AudioContent;

export interface ChatMessage {
    id: string | null;
    role: ChatRole;
    status: 'streaming' | 'done' | 'loading';
    content: string | ContentItem[];
}

export type ChatSendMessage = ChatMessage & {
    sessionId: string | null;
};

export type Message = ChatSendMessage;

export type Session = {
    messages: Message[];
    // 流状态
    isStreaming: boolean;
    // 当前流控制
    controller?: AbortController;
    // 是否已经加载过历史
    loaded?: boolean;
    // 可选：错误状态
    error?: string | null;
};

export type ChatMessages = ChatMessage[];
