import React from 'react';
import Modal from './Modal';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORY_CONFIG = {
    Study: { color: '#3b82f6' },
    Work: { color: '#22c55e' },
    Personal: { color: '#facc15' },
};

const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (!percent) {
        return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
        <text
            x={x}
            y={y}
            fill="#f8fafc"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={12}
            fontWeight={600}
        >
            {`${name} ${Math.round(percent * 100)}%`}
        </text>
    );
};

const WeeklyReportModal = ({ isOpen, onClose, report, loading, error }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Weekly Productivity Dashboard"
        maxWidthClass="max-w-5xl"
    >
        {loading ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <div>
                    <p className="text-lg font-semibold text-white">Building your weekly report...</p>
                    <p className="text-sm text-slate-400">Analyzing categories, time spent, and completed tasks.</p>
                </div>
            </div>
        ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
                {error}
            </div>
        ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-semibold text-white">Time Spent by Category</h3>
                            <p className="text-sm text-slate-400">This week&apos;s focus split across Study, Work, and Personal.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={report?.chartData || []}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        labelLine={false}
                                        label={renderSliceLabel}
                                    >
                                        {(report?.chartData || []).map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={CATEGORY_CONFIG[entry.name]?.color || '#94a3b8'}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '16px',
                                            color: '#fff',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-3">
                            {(report?.chartData || []).map((item, index) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-800/60 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    CATEGORY_CONFIG[item.name]?.color || '#94a3b8',
                                            }}
                                        />
                                        <span className="text-slate-200">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-white">
                                        {item.value}h
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="rounded-3xl border border-slate-700/60 bg-gradient-to-br from-primary/20 to-slate-900 p-6">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Productivity</p>
                        <div className="mt-3 flex items-end gap-3">
                            <span className="text-5xl font-bold text-white">{report?.productivity ?? 0}%</span>
                            <span className="pb-2 text-slate-400">completed this week</span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-emerald-300">
                            {report?.comparison || 'No comparison available yet'}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-6">
                        <h3 className="text-xl font-semibold text-white">AI Weekly Summary</h3>
                        <p className="mt-4 leading-7 text-slate-300">
                            {report?.report || 'No report available yet.'}
                        </p>
                    </div>
                </section>
            </div>
        )}
    </Modal>
);

export default WeeklyReportModal;
