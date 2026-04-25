import { request } from '@/http';
import type { Message } from '@repo/shared';
export const createConversation = () => {
    return request<{ id: string }>({
        url: '/api/message/create',
        method: 'POST',
        body: JSON.stringify({
            title: 'New Chat',
        }),
    });
};

export function updateConversation(id: string, { title }: { title: string }) {
    return request({
        url: `/api/message/update/${id}`,
        method: 'PUT',
        body: JSON.stringify({
            title,
        }),
    });
}

export function messageDetail(id: string) {
    return request<Message[]>({
        url: `/api/chat/message/getDetail`,
        method: 'GET',
        params: { id },
    });
}

// export function createDetail(data: ChatSendMessage) {
//     return request<ChatSendMessage>({
//         url: '/api/chat/message/create',
//         method: 'Post',
//         data,
//     });
// }
