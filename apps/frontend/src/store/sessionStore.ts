import { create } from 'zustand';
import { createConversation } from '@/pages/chat/api';

export type Session = {
    id: string;
    title: string;
    createdAt: number;
    isAutoTitle: boolean;
    previous_response_id: string | null;
};

type SessionStore = {
    sessions: Record<string, Session>;
    activeId: string | null;
    createSession: () => Promise<string>;
    updateSession: (id: string, session: Session) => void;
    setActive: (id: string) => void;
    deleteSession: (id: string) => void;
    addSession: (newSession: Record<string, Session>) => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
    sessions: {},
    activeId: null,
    async createSession() {
        const {
            data: { id },
        } = await createConversation();
        set((state) => ({
            sessions: {
                ...state.sessions,
                [id]: {
                    id,
                    title: 'New Chat',
                    createdAt: Date.now(),
                    isAutoTitle: true,
                    previous_response_id: null,
                },
            },
            activeId: id,
        }));
        return id;
    },
    updateSession(id: string, session: Session) {
        set((state) => ({
            sessions: {
                ...state.sessions,
                [id]: {
                    ...state.sessions[id],
                    ...session,
                },
            },
        }));
    },
    setActive(id: string) {
        set({
            activeId: id,
        });
    },
    deleteSession(id: string) {
        set((state) => {
            const { [id]: _, ...rest } = state.sessions;
            return { sessions: rest };
        });
    },
    addSession(newSession: Record<string, Session>) {
        set((state) => ({
            sessions: {
                ...state.sessions,
                ...newSession,
            },
        }));
    },
}));
