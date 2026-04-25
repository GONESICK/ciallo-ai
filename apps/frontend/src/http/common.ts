import { request } from '@/http';
import type { Session } from '@/store/sessionStore';

export function getConversation() {
    return request<Session[]>({
        url: '/api/message',
        method: 'GET',
    });
}

export function deleteConversation(id: string) {
    return request({
        url: `/api/message/delete/${id}`,
        method: 'POST',
    });
}
