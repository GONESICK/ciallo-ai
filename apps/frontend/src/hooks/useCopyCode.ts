import { useEffect } from 'react';

interface UseCopyCodeOptions {
    buttonClassName?: string;
    codeSelector?: string;
    successText?: string;
    errorText?: string;
    originalText?: string;
    feedbackDuration?: number;
}

export const useCopyCode = (options: UseCopyCodeOptions = {}) => {
    const {
        buttonClassName = 'copy-btn',
        codeSelector = 'code',
        successText = '已复制',
        errorText = '复制失败',
        originalText = '复制',
        feedbackDuration = 2000,
    } = options;

    useEffect(() => {
        const handleCopyClick = async (e: MouseEvent) => {
            const btn = (e.target as HTMLElement).closest(
                `.${buttonClassName}`
            ) as HTMLElement;
            if (!btn) return;
            const wrapper = btn.closest('.code-block');
            const code = wrapper?.querySelector(codeSelector);
            if (!code) return;

            const text = code.textContent || '';

            // 保存原始文本
            if (!btn.dataset.original) {
                btn.dataset.original = btn.textContent || originalText;
            }

            const original = btn.dataset.original;

            try {
                await navigator.clipboard.writeText(text);
                btn.textContent = successText;
            } catch (err) {
                console.error('复制失败:', err);
                btn.textContent = errorText;
            }

            // 防止多个 timer
            if (btn.dataset.timer) {
                clearTimeout(Number(btn.dataset.timer));
            }

            const timer = window.setTimeout(() => {
                btn.textContent = original;
            }, feedbackDuration);

            btn.dataset.timer = String(timer);
        };

        document.addEventListener('click', handleCopyClick);

        return () => {
            document.removeEventListener('click', handleCopyClick);
        };
    }, [
        buttonClassName,
        codeSelector,
        successText,
        errorText,
        originalText,
        feedbackDuration,
    ]);
};
