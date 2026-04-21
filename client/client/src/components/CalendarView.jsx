import React, { useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const startOfCalendar = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const day = firstDay.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    firstDay.setDate(firstDay.getDate() + diff);
    firstDay.setHours(0, 0, 0, 0);
    return firstDay;
};

const formatKey = (date) => date.toISOString().slice(0, 10);

const urgencyStyle = (task) => {
    if (task.completed) return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/20';

    const deadline = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) return 'bg-red-500/15 text-red-200 border-red-500/20';
    if (deadline.getTime() === today.getTime()) return 'bg-amber-500/15 text-amber-200 border-amber-500/20';
    return 'bg-sky-500/10 text-sky-200 border-sky-500/20';
};

const CalendarView = ({ tasks }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDateKey, setSelectedDateKey] = useState(formatKey(new Date()));

    const tasksByDate = useMemo(() => {
        return tasks.reduce((accumulator, task) => {
            if (!task.deadline) return accumulator;
            const key = formatKey(new Date(task.deadline));
            accumulator[key] = accumulator[key] || [];
            accumulator[key].push(task);
            return accumulator;
        }, {});
    }, [tasks]);

    const calendarDays = useMemo(() => {
        const start = startOfCalendar(currentMonth);
        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            const key = formatKey(date);
            return {
                date,
                key,
                isCurrentMonth: date.getMonth() === currentMonth.getMonth(),
                tasks: tasksByDate[key] || [],
            };
        });
    }, [currentMonth, tasksByDate]);

    const selectedTasks = tasksByDate[selectedDateKey] || [];
    const selectedDate = new Date(`${selectedDateKey}T00:00:00`);
    const monthlyTaskCount = calendarDays
        .filter((day) => day.isCurrentMonth)
        .reduce((sum, day) => sum + day.tasks.length, 0);

    return (
        <section className="mb-10 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300">Calendar View</p>
                        <h2 className="mt-2 text-2xl font-bold text-white">See your deadline pressure visually</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() =>
                                setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1))
                            }
                            className="rounded-full border border-slate-700 p-3 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                        >
                            <FaChevronLeft />
                        </button>
                        <div className="min-w-40 text-center">
                            <p className="text-sm font-semibold text-white">
                                {currentMonth.toLocaleDateString(undefined, {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">{monthlyTaskCount} scheduled task{monthlyTaskCount === 1 ? '' : 's'}</p>
                        </div>
                        <button
                            onClick={() =>
                                setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1))
                            }
                            className="rounded-full border border-slate-700 p-3 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-7 gap-3">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {day}
                        </div>
                    ))}

                    {calendarDays.map((day) => {
                        const isToday = day.key === formatKey(new Date());
                        const isSelected = day.key === selectedDateKey;

                        return (
                            <button
                                key={day.key}
                                onClick={() => setSelectedDateKey(day.key)}
                                className={`min-h-28 rounded-[1.4rem] border p-3 text-left transition ${
                                    isSelected
                                        ? 'border-fuchsia-400/40 bg-fuchsia-500/10'
                                        : 'border-slate-700/60 bg-slate-950/60 hover:border-slate-500'
                                } ${day.isCurrentMonth ? 'text-white' : 'text-slate-500'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`text-sm font-semibold ${
                                            isToday
                                                ? 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white'
                                                : ''
                                        }`}
                                    >
                                        {day.date.getDate()}
                                    </span>
                                    {day.tasks.length > 0 && (
                                        <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300">
                                            {day.tasks.length}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2">
                                    {day.tasks.slice(0, 2).map((task) => (
                                        <div
                                            key={task._id}
                                            className={`rounded-xl border px-2 py-1 text-[11px] font-medium ${urgencyStyle(task)}`}
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                    {day.tasks.length > 2 && (
                                        <div className="text-[11px] text-slate-400">
                                            +{day.tasks.length - 2} more
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-[2rem] border border-slate-700/60 bg-[radial-gradient(circle_at_top_right,rgba(192,132,252,0.14),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.9))] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300">Selected Day</p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                    {selectedDate.toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                    })}
                </h2>
                <p className="mt-2 text-sm text-slate-400">Use this agenda to understand how heavy a day looks before it sneaks up on you.</p>

                <div className="mt-6 space-y-4">
                    {selectedTasks.length ? (
                        selectedTasks.map((task) => (
                            <article
                                key={task._id}
                                className={`rounded-[1.5rem] border p-4 ${urgencyStyle(task)}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">{task.category}</p>
                                        <h3 className="mt-2 text-lg font-semibold text-white">{task.title}</h3>
                                    </div>
                                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/90">
                                        {task.priority}
                                    </span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    <span className="rounded-full bg-black/15 px-3 py-1 text-white/90">{task.duration}h planned</span>
                                    <span className="rounded-full bg-black/15 px-3 py-1 text-white/90">
                                        {task.completed ? 'Completed' : 'Pending'}
                                    </span>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-[1.5rem] border border-slate-700/60 bg-slate-950/60 p-5 text-sm text-slate-400">
                            No tasks scheduled for this day. Use lighter days for revision, reading, or recovery.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CalendarView;
