import React from 'react';

const StatsCard = ({ eyebrow, value, label, accent = 'from-sky-500/20 to-transparent' }) => {
    return (
        <article className={`rounded-[1.75rem] border border-slate-700/60 bg-gradient-to-br ${accent} p-5 shadow-lg`}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
            <p className="mt-4 text-4xl font-bold text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-300">{label}</p>
        </article>
    );
};

export default StatsCard;
