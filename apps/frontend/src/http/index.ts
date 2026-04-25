type Merge<T> = {
    [K in keyof T]: T[K];
};

type RequestOptions<T = Record<string, string>> = Merge<RequestInit> & {
    url: RequestInfo | URL;
    params?: Record<string, string>;
    data?: T;
};

type Response<T> = {
    success: boolean;
    data: T;
};

function tansformParamstoUrl(
    base: RequestOptions['url'],
    params: Record<string, string>
) {
    const p = new URLSearchParams(params);
    return `${base}?${p.toString()}`;
}

export async function request<T = unknown>(
    options: RequestOptions<T>
): Promise<Response<T>> {
    let url = options.url;
    if (options.method?.toLowerCase() === 'get' && options.params) {
        url = tansformParamstoUrl(options.url, options.params);
    }
    if (options.data) {
        options.body = JSON.stringify(options.data);
    }
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }
    return res.json();
}
