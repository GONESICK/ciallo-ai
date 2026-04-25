import {
    fetchEventSource,
    type FetchEventSourceInit,
} from '@microsoft/fetch-event-source';

export function fetchEvent(options: FetchEventSourceInit) {
    return fetchEventSource('/api/chat/stream-sse', options);
}

export function getSSEContent(content: string) {
    const jsonStr = content.replace(/^data: /, '');
    const data = JSON.parse(jsonStr);
    const messageContent = data.choices[0].delta.content;
    return { content: messageContent, role: data.role, data };
}
