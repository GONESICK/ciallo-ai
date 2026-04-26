import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSessionStore } from '@/store/sessionStore';
import { useStreamStore } from '@/store';
import { getConversation, deleteConversation } from '@/http/common';

export default function Sider() {
    const sessions = useSessionStore((s) => s.sessions);
    const loadingMap = useStreamStore((s) => s.loadingMap);
    const stop = useStreamStore((s) => s.stop);
    const { setActive, deleteSession, addSession } = useSessionStore.getState();
    const sessionsList = useMemo(() => {
        const sessionsArray = Object.entries(sessions).map((m) => ({
            ...m[1],
        }));
        return [...sessionsArray];
    }, [sessions]);
    const params = useParams();
    const activeId = params.id;
    const navigate = useNavigate();

    const handleCreate = async () => {
        navigate('/');
    };

    const handleSelect = (id: string) => {
        setActive(id);
        navigate(`/chat/${id}`);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await deleteConversation(id);
        stop(id);
        deleteSession(id);

        if (activeId === id) {
            navigate('/');
        }
    };

    const getMessages = async () => {
        const { data } = await getConversation();
        const temp = data.map((item) => [item.id, { ...item }]);
        const session = Object.fromEntries(temp);
        addSession(session);
    };

    useEffect(() => {
        getMessages();
    }, []);

    return (
        <div className="w-62 bg-gray-50 flex flex-col flex-shrink-0 border-r border-gray-200">
            <div className="p-3">
                <button
                    className="w-full bg-white hover:bg-gray-100 text-gray-800 text-sm rounded-lg px-4 py-2.5 flex items-center gap-3 transition-colors border border-gray-200 shadow-sm cursor-pointer"
                    onClick={handleCreate}
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    New chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {sessionsList.map((session) => (
                    <div
                        key={session.id}
                        className={`group rounded-lg px-3 py-2.5 cursor-pointer flex items-center justify-between ${
                            activeId === session.id
                                ? 'bg-gray-200'
                                : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                            handleSelect(session.id);
                        }}
                    >
                        <p className="text-gray-800 text-sm truncate flex-1">
                            {session.title}
                        </p>
                        {loadingMap[session.id] && (
                            <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        <button
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded transition-opacity"
                            onClick={(e) => handleDelete(e, session.id)}
                        >
                            <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                        U
                    </div>
                    <span className="text-gray-800 text-sm">User</span>
                </div>
            </div>
        </div>
    );
}
