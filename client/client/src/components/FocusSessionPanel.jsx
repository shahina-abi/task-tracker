import React from 'react';
import { FaPause, FaPlay, FaRotateLeft } from 'react-icons/fa6';

const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
};

const FocusSessionPanel = ({
    urgentTask,
    timerMode,
    timeLeft,
    isRunning,
    completedFocusSessions,
    selectedMinutes,
    onMinutesChange,
    onStartPause,
    onReset,
    onMarkComplete,
}) => {
    const modeLabel = timerMode === 'focus' ? 'Focus Session' : 'Break Time';

    return (
        <section className="mb-10 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-slate-700/60 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.9))] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Today&apos;s Focus</p>
                <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold text-white">Start one clear session and build momentum</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            Use the timer to move from planning into action. The panel below highlights the task that deserves your attention first.
                        </p>

                        <div className="mt-6 rounded-[1.5rem] border border-slate-700/60 bg-slate-900/70 p-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
                                    {urgentTask ? urgentTask.category : 'No urgent task'}
                                </span>
                                {urgentTask?.priority && (
                                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                                        {urgentTask.priority} priority
                                    </span>
                                )}
                                {urgentTask?.dueLabel && (
                                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
                                        {urgentTask.dueLabel}
                                    </span>
                                )}
                            </div>

                            <h3 className="mt-4 text-2xl font-semibold text-white">
                                {urgentTask?.title || 'No urgent task waiting right now'}
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                {urgentTask?.message || 'Add or update tasks to see a guided focus recommendation.'}
                            </p>

                            {urgentTask && (
                                <button
                                    onClick={() => onMarkComplete(urgentTask.taskId)}
                                    className="mt-5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-500/20"
                                >
                                    Mark This Task Complete
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="w-full max-w-sm rounded-[1.75rem] border border-slate-700/60 bg-slate-950/70 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{modeLabel}</p>
                            <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs font-medium text-fuchsia-200">
                                {completedFocusSessions} session{completedFocusSessions === 1 ? '' : 's'} done
                            </span>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-6xl font-bold tracking-tight text-white">{formatTime(timeLeft)}</p>
                            <p className="mt-2 text-sm text-slate-400">
                                {timerMode === 'focus'
                                    ? 'Deep work countdown for your next study block'
                                    : 'Take a short reset before the next task'}
                            </p>
                        </div>

                        <label className="mt-6 block text-sm text-slate-400">
                            Focus length
                            <select
                                value={selectedMinutes}
                                onChange={(event) => onMinutesChange(Number(event.target.value))}
                                disabled={isRunning}
                                className="input-field mt-2 appearance-none"
                            >
                                <option value={15}>15 minutes</option>
                                <option value={25}>25 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                            </select>
                        </label>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={onStartPause}
                                className="flex-1 rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                            >
                                <span className="inline-flex items-center justify-center gap-2">
                                    {isRunning ? <FaPause /> : <FaPlay />}
                                    {isRunning ? 'Pause' : 'Start Focus Session'}
                                </span>
                            </button>
                            <button
                                onClick={onReset}
                                className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                            >
                                <span className="inline-flex items-center justify-center gap-2">
                                    <FaRotateLeft />
                                    Reset
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Execution Loop</p>
                <h2 className="mt-2 text-2xl font-bold text-white">How to use this dashboard</h2>
                <div className="mt-6 space-y-4">
                    {[
                        ['1', 'Open today’s focus recommendation and start a timer.'],
                        ['2', 'Work until the timer ends, then take the short break.'],
                        ['3', 'Mark the task complete or jump into the next urgent item.'],
                    ].map(([step, text]) => (
                        <div
                            key={step}
                            className="flex items-start gap-4 rounded-[1.5rem] border border-slate-700/60 bg-slate-950/60 p-4"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-sm font-bold text-emerald-200">
                                {step}
                            </div>
                            <p className="pt-1 text-sm leading-6 text-slate-300">{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FocusSessionPanel;
