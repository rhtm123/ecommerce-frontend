export function convertToIST(isoString) {
    const date = new Date(isoString);
        return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
        timeZone: 'Asia/Kolkata',
        hour12: true
    }) + ' IST';
}