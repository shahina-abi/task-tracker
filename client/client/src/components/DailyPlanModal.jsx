import React from 'react';
import Modal from './Modal';

const sections = [
    { key: 'morning', title: 'Morning 🌅' },
    { key: 'afternoon', title: 'Afternoon ☀️' },
    { key: 'evening', title: 'Evening 🌙' },
];

const DailyPlanModal = ({ isOpen, onClose, plan, loading, error }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="AI Daily Planner"
        maxWidthClass="max-w-3xl"
    >
        {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <div>
                    <p className="text-lg font-semibold text-white">Planning your day...</p>
                    <p className="text-sm text-slate-400">Reviewing priorities and deadlines.</p>
                </div>
            </div>
        ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
                {error}
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-3">
                {sections.map((section) => (
                    <section
                        key={section.key}
                        className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4"
                    >
                        <h3 className="mb-4 text-lg font-semibold text-white">{section.title}</h3>
                        <div className="space-y-3">
                            {plan?.[section.key]?.length ? (
                                plan[section.key].map((task, index) => (
                                    <article
                                        key={`${section.key}-${task.title}-${index}`}
                                        className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-3"
                                    >
                                        <p className="font-medium text-white">{task.title}</p>
                                        <p className="mt-1 text-sm text-primary">{task.time}</p>
                                        <p className="mt-2 text-sm text-slate-400">{task.reason}</p>
                                    </article>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">No tasks planned here.</p>
                            )}
                        </div>
                    </section>
                ))}
            </div>
        )}
    </Modal>
);

export default DailyPlanModal;
