const formatDuration = (ms: number, unitCls?: string) => {
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    if (ms < 1000) {
        const v = Math.round(ms);
        const u = unitCls ? `<span class="${unitCls}">ms</span>` : "ms";
        return `${v}${u}`;
    };
    if (seconds < 60) {
        const v = Math.round(seconds);
        const u = unitCls ? `<span class="${unitCls}">ms</span>` : "s";
        return `${v}${u}`;
    }
    const u1 = unitCls ? `<span class="${unitCls}">mn</span>` : "mn";
    const u2 = unitCls ? `<span class="${unitCls}">s</span>` : "s";
    return `${minutes.toFixed()}${u1} ${Math.round(seconds % 60)}${u2}`;
}

function formatLimitTxt(txt: string): string {
    let t = txt;
    t = t.replaceAll("\n", "\\n").slice(0, 75);
    if (txt.length > 75) {
        t += "..."
    }
    return t
}

export {
    formatDuration,
    formatLimitTxt,
}