import Send from '@/components/layout/Send';
import { useNavigate } from 'react-router';
import { useMessageStore } from '@/store';
import type { ContentBlock } from '@repo/shared';
import { useSessionStore } from '@/store';

export default function Home() {
    const navigate = useNavigate();
    const { createSession } = useSessionStore.getState();
    const { setTempMessage } = useMessageStore.getState();
    const onCancel = () => {};
    const onSend = async (content: ContentBlock[]) => {
        const id = await createSession();
        setTempMessage(content);
        navigate(`/chat/${id}`);
    };
    return (
        <>
            <Greet />
            <Send onCancel={onCancel} onSend={onSend} />;
        </>
    );
}

function Greet() {
    return (
        <div className="flex  justify-center p-8">
            <div className="text-gray-800 text-base leading-relaxed text-left">
                {'~ Ciallo～(∠・ω< )⌒★ 今天有什么事要需要帮忙呢~'}
            </div>
        </div>
    );
}
