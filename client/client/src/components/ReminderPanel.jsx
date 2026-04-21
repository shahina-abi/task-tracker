import React from 'react';
import { FaBell, FaClock } from 'react-icons/fa';

const urgencyStyles = {
    overdue: 'border-red-500/30 bg-red-500/10 text-red-200',
    today: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    tomorrow: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
    upcoming: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
};

const ReminderPanel = ({
    reminders,
    loading,
    error,
    notificationsEnabled,
    onEnableNotifications,
}) => (
    <section className="mb-10 rounded-[2rem] border border-slate-700/60 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(15,23,42,0.82))] p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">AI Reminders</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Tasks that need your attention first</h2>
                <p className="mt-2 text-sm text-slate-400">Rule-based urgency plus OpenRouter-written reminder text.</p>
            </div>
            {!notificationsEnabled && (
                <button
                    onClick={onEnableNotifications}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-300 hover:bg-sky-500/20"
                >
                    <FaBell /> Enable Notifications
                </button>
            )}
        </div>

        {loading ? (
            <div className="flex min-h-36 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-400/20 border-t-sky-300" />
            </div>
        ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
            </div>
        ) : reminders.length ? (
            <div className="grid gap-4 lg:grid-cols-3">
                {reminders.map((reminder) => (
                    <article
                        key={reminder.taskId || reminder.title}
                        className={`rounded-3xl border p-5 shadow-lg ${urgencyStyles[reminder.urgency] || 'border-slate-700/60 bg-slate-900/70 text-slate-100'}`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
                                    {reminder.category}
                                </p>
                                <h3 className="mt-2 text-lg font-semibold text-white">{reminder.title}</h3>
                            </div>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/90">
                                {reminder.priority}
                            </span>
                        </div>

                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-xs font-medium text-white/90">
                            <FaClock />
                            {reminder.dueLabel}
                        </div>

                        <p className="mt-4 text-sm leading-6 text-white/90">
                            {reminder.message}
                        </p>
                    </article>
                ))}
            </div>
        ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-5 text-sm text-emerald-200">
                No urgent pending tasks right now. You&apos;re in a great place.
            </div>
        )}
    </section>
);

export default ReminderPanel;
