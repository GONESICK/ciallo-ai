import { useMessageStore, useSessionStore } from '@/store';
import type { Message } from '@repo/shared';
import type { EventSourceMessage } from '@microsoft/fetch-event-source';
import { parseEvent } from '@repo/shared';
import type { Session } from '@/store/sessionStore';

const systemMessage: Message = {
    id: crypto.randomUUID(),
    role: 'system',
    type: 'message',
    status: 'done',
    content: [
        {
            type: 'text',
            text: `你是一个可靠、理性且有条理的智能助手。

回答要求：
1. 优先给出明确结论，再补充解释
2. 信息准确，避免猜测或编造
3. 表达清晰、结构有条理，必要时分点说明
4. 根据问题复杂度控制回答长度，避免冗长或过于简略
5. 对不确定的信息要说明不确定性
6. 提供实用、可执行的建议，而不是空泛描述

风格要求：
- 语气自然、友好，但不过度热情
- 不重复用户问题
- 不使用空洞或模板化语言
- 避免不必要的专业术语，必要时做简要解释`,
        },
    ],
};
const MAX_MESSAGE_CONTEXT = 10;
export function buildInputBlock(
    blocks: Message[],
    previous_response_id: string | null
): Message[] {
    const merges: Message[] = [...blocks];
    if (!previous_response_id) {
        merges.unshift(systemMessage);
    }
    let result: Message[] = [];
    const pickKeys = {
        role: (m: Message) => m['role'],
        content: (m: Message) => m['content'],
    };
    const messages = merges
        .filter((f) => f.status === 'done')
        .map((block) => {
            const item: Record<string, unknown> = {};
            (Object.keys(pickKeys) as (keyof typeof pickKeys)[]).forEach(
                (f) => {
                    item[f] = pickKeys[f]?.(block);
                }
            );
            return item as Message;
        });

    result = messages;
    if (messages.length > MAX_MESSAGE_CONTEXT) {
        result = messages.slice(-MAX_MESSAGE_CONTEXT);
    }
    return result;
}

let scheduled = false;

// ✅ 所有事件统一进队列（按顺序）
const eventQueue: any[] = [];

export function handleEvent(ev: EventSourceMessage, cid: string, mid: string) {
    const result = parseEvent(ev);
    if (!result) return;

    // ✅ 不再区分，统一入队（保持顺序）
    eventQueue.push(result);
    if (scheduled) return;
    scheduled = true;

    const run = () => {
        const { updateMessage } = useMessageStore.getState();
        const { updateSession } = useSessionStore.getState();

        updateMessage(cid, mid, (msg) => {
            // ✅ 按顺序消费所有事件
            while (eventQueue.length) {
                const item: Record<string, string> = eventQueue.shift();

                if (!Array.isArray(item)) {
                    // status 事件
                    if (item.status) {
                        msg.status = item.status as
                            | 'done'
                            | 'streaming'
                            | 'thinking'
                            | 'aborted';
                    }
                    if (item.previous_response_id || item.title) {
                        updateSession(cid, item as unknown as Session);
                    }
                } else {
                    // content 更新
                    msg.content = item;
                }
            }
        });

        scheduled = false;
    };

    if (document.hidden) {
        setTimeout(run, 16);
    } else {
        requestAnimationFrame(run);
    }
}
