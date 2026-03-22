/**
 * Parses technical API errors into user-friendly Arabic messages.
 * @param {Error|string} error - The error object or message string.
 * @returns {string} - A clean, user-friendly Arabic error message.
 */
export function parseApiError(error) {
    const message = (typeof error === 'string' ? error : error?.message || '').toLowerCase();

    // 1. Quota / Rate Limit (429)
    if (message.includes('429') || message.includes('quota') || message.includes('exceeded')) {
        return "عذراً، لقد استنفدت الحد المسموح به من الطلبات في الوقت الحالي. يرجى الانتظار قليلاً أو المحاولة لاحقاً.";
    }

    // 2. Network / Fetch Errors
    if (message.includes('fetch failed') || message.includes('network') || message.includes('failed to fetch')) {
        return "يوجد مشكلة في الاتصال بالإنترنت، يرجى التحقق من الشبكة والمحاولة مجدداً.";
    }

    // 3. Safety/Policy Refusals (Common keywords for Gemini refusals)
    if (message.includes('safety') || message.includes('candidate') || message.includes('blocked') || message.includes('content policy')) {
        return "اعتذر الذكاء الاصطناعي عن معالجة هذا الطلب بسبب سياسات المحتوى. يرجى محاولة وصف المنتج بكلمات عامة أو تغيير الصورة.";
    }

    // 4. API Key Issues
    if (message.includes('api key') || message.includes('unauthorized') || message.includes('401')) {
        return "يوجد مشكلة في مفتاح الوصول (API Key). يرجى التحقق من الإعدادات.";
    }

    // 5. Fallback (Generic Error)
    return "حدث خطأ غير متوقع أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.";
}
