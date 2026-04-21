import React from 'react';
import { FaBolt, FaCalendarCheck } from 'react-icons/fa';

const activityColor = (count) => {
    if (count >= 3) return 'bg-emerald-400';
    if (count === 2) return 'bg-emerald-500/80';
    if (count === 1) return 'bg-emerald-500/50';
    return 'bg-slate-800';
};

const StreakPanel = ({ currentStreak, longestStreak, completionDays, recentDays }) => {
    return (
        <section className="mb-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-slate-700/60 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.15),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.88))] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Consistency</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Study streak & momentum</h2>
                <p className="mt-2 text-sm text-slate-400">See how consistently you are completing tasks and keeping your week moving.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                        <div className="flex items-center gap-3 text-emerald-200">
                            <FaBolt />
                            <span className="text-sm font-medium">Current Streak</span>
                        </div>
                        <p className="mt-4 text-5xl font-bold text-white">{currentStreak}</p>
                        <p className="mt-2 text-sm text-emerald-100">consecutive days with completed work</p>
                    </div>

                    <div className="rounded-3xl border border-sky-500/20 bg-sky-500/10 p-5">
                        <div className="flex items-center gap-3 text-sky-200">
                            <FaCalendarCheck />
                            <span className="text-sm font-medium">Longest Streak</span>
                        </div>
                        <p className="mt-4 text-5xl font-bold text-white">{longestStreak}</p>
                        <p className="mt-2 text-sm text-sky-100">best run of productive days</p>
                    </div>
                </div>
            </div>

            <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Progress Timeline</p>
                        <h2 className="mt-2 text-2xl font-bold text-white">Last 14 days of completed work</h2>
                    </div>
                    <div className="rounded-full border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm text-slate-300">
                        {completionDays} active day{completionDays === 1 ? '' : 's'}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-7 gap-3 sm:grid-cols-14">
                    {recentDays.map((day) => (
                        <div key={day.date} className="flex flex-col items-center gap-2">
                            <div
                                className={`h-10 w-10 rounded-2xl border border-slate-700/60 ${activityColor(day.count)}`}
                                title={`${day.label}: ${day.count} completed task${day.count === 1 ? '' : 's'}`}
                            />
                            <div className="text-center">
                                <p className="text-[11px] font-medium text-slate-300">{day.weekday}</p>
                                <p className="text-[10px] text-slate-500">{day.shortDate}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StreakPanel;
