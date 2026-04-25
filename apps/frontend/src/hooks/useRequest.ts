import { request } from '@/http';
import { useState } from 'react';

export function useRequest(url: RequestInfo | URL, options?: RequestInit) {
    const opts = options || {};
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await request({ url, ...opts });
            setData(res.data as any[]);
            return res.data;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        data,
        fetchData,
    };
}
