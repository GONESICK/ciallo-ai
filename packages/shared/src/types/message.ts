export type TextContent = {
    type: 'input_text';
    text: string;
    translation_options: {
        source_language: string;
        target_language: string;
    };
};

export type ImageContent = {
    type: 'input_image';
    file_id: string;
    image_url: string;
    detail: string;
    image_pixel_limit: null | { max_pixels: number; min_pixels: number };
};

export type VideoContent = {
    type: 'input_video';
    file_id: string;
    video_url: string;
    fps: number;
};

export type FileContent = {
    type: 'input_file';
    file_id: string;
    file_data: string;
    filename: string;
    file_url: string;
};

export type InputContent =
    | TextContent
    | ImageContent
    | VideoContent
    | FileContent;

export interface MessageOutput {
    role: 'user' | 'system' | 'assistant' | 'developer';
    type: 'message';
    content: string | InputContent[];
    status?: 'streaming' | 'done' | 'thinking' | 'aborted';
}

export type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image'; url: string }
    | { type: 'video'; url: string };

export type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    type: 'message';
    content: ContentBlock[];
    status: 'streaming' | 'done' | 'thinking' | 'aborted';
};

export type MessageOutputItem = {
    item_id: string;
    content_index: number;
    delta?: string;
    type?: string;
    url?: string;
};
export interface MessageResponseIdInput {
    previous_response_id: string;
}
