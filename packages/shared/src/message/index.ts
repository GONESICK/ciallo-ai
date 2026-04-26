import type {
    Message,
    ContentBlock,
    MessageOutputItem,
} from '../types/index.js';

export function buildMessages(
    allMessages: Record<string, Message[]>,
    cid: string
) {
    const list = allMessages[cid] || [];
    return (
        list
            // 只要完成的
            .filter((m) => m.status === 'done')

            // 只要对话消息
            .filter(
                (m) =>
                    m.role === 'user' ||
                    m.role === 'assistant' ||
                    m.role === 'system'
            )

            // 3️⃣ 只取最近 N 条
            .slice(-10)
    );
}

export function buildInput(messages: Message[], presetMessage?: Message) {
    const mergeMessage = presetMessage
        ? [presetMessage, ...messages]
        : [...messages];
    const list = mergeMessage.map((m) => ({
        role: m.role,
        type: m.type,
        status: m.status,
        content: m.content.map((block) => {
            if (block.type === 'text') {
                return { type: 'input_text', text: block.text };
            }

            if (block.type === 'image') {
                return {
                    type: 'input_image',
                    image_url: block.url,
                };
            }
        }),
    }));
    return list;
}

export function createBlockAssembler() {
    const blockMap = new Map<string, ContentBlock>();
    let key = '';
    function getKey(itemId: string, index: number) {
        return `${itemId}_${index}`;
    }

    function applyDelta(data: MessageOutputItem): ContentBlock[] {
        key = getKey(data.item_id, data.content_index);
        let block = blockMap.get(key);

        // ---------- 文本流 ----------
        if (data.delta) {
            if (!block) {
                block = { type: 'text', text: '' };
                blockMap.set(key, block);
            }

            if (block.type === 'text') {
                block.text += data.delta;
            }
        }

        // ---------- 图片（一次性） ----------
        if (data.type === 'image') {
            block = {
                type: 'image',
                url: data.url!,
            };
            blockMap.set(key, block);
        }

        // ---------- 输出有序数组 ----------
        return Array.from(blockMap.entries())
            .sort((a, b) => {
                const ai = Number(a[0].split('_')[1]);
                const bi = Number(b[0].split('_')[1]);
                return ai - bi;
            })
            .filter(([k]) => k === key)
            .map(([, block]) => block);
    }

    function getResult() {
        return Array.from(blockMap.values());
    }

    function reset() {
        blockMap.clear();
    }

    return {
        applyDelta,
        getResult,
        reset,
    };
}

const assembler = createBlockAssembler();
export function parseEvent(ev: {
    event: string;
    data: string;
}):
    | ContentBlock[]
    | { status?: string; title?: string; previous_response_id?: string }
    | null {
    const data = JSON.parse(ev.data);
    switch (ev.event) {
        case 'response.created':
            return { previous_response_id: data.response.id };
        case 'response.output_text.delta': {
            const content = assembler.applyDelta({
                item_id: data.item_id,
                content_index: data.content_index,
                delta: data.delta,
            });
            return content;
        }
        case 'response.output_image': {
            const content = assembler.applyDelta({
                item_id: data.item_id,
                content_index: data.content_index,
                type: 'image',
                url: data.url,
            });
            return content;
        }
        case 'response.output_video': {
            const content = assembler.applyDelta({
                item_id: data.item_id,
                content_index: data.content_index,
                type: 'video',
                url: data.url,
            });
            return content;
        }
        case 'response.output_item.added': {
            return { status: 'streaming' };
        }
        // case 'response.reasoning_summary_part.done': {
        //     return { status: 'streaming' };
        // }
        case 'title': {
            return { title: data.title };
        }
        case 'response.completed': {
            assembler.reset();
            return { status: 'done' };
        }
        case 'error': {
            assembler.reset();
            alert(data.message || '未知错误');
            return { status: 'done' };
        }
        default:
            return null;
    }
}
