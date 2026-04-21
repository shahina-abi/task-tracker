import React, { useEffect, useState } from 'react';
import { FaEnvelopeOpenText, FaPaperPlane, FaSave } from 'react-icons/fa';

const ReminderSettingsCard = ({
    settings,
    loading,
    saving,
    testing,
    error,
    testResult,
    onSave,
    onSendTest,
}) => {
    const [formData, setFormData] = useState(settings);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave(formData);
    };

    return (
        <section className="mb-10 rounded-[2rem] border border-slate-700/60 bg-slate-900/70 p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Email Reminders</p>
                    <h2 className="mt-2 text-2xl font-bold text-white">Reminder delivery settings</h2>
                    <p className="mt-2 text-sm text-slate-400">Choose whether reminders should be emailed and test the current template before adding a cron job.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                    <FaEnvelopeOpenText />
                    {settings.email || 'No email loaded'}
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {testResult && (
                <div className="mb-4 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
                    {testResult}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-800/60 px-4 py-4">
                    <input
                        type="checkbox"
                        name="emailRemindersEnabled"
                        checked={Boolean(formData.emailRemindersEnabled)}
                        onChange={handleChange}
                        disabled={loading}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary"
                    />
                    <span className="text-sm text-slate-200">Email reminders enabled</span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm text-slate-400">Reminder Time</label>
                        <input
                            type="time"
                            name="reminderTime"
                            value={formData.reminderTime || '09:00'}
                            onChange={handleChange}
                            disabled={loading}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm text-slate-400">Days Before</label>
                        <input
                            type="number"
                            min="0"
                            max="7"
                            name="remindBeforeDays"
                            value={formData.remindBeforeDays ?? 1}
                            onChange={handleChange}
                            disabled={loading}
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <button
                        type="submit"
                        disabled={saving || loading}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-60"
                    >
                        <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button
                        type="button"
                        onClick={() => onSendTest(formData)}
                        disabled={testing || loading}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-300 hover:bg-sky-500/20 disabled:opacity-60"
                    >
                        <FaPaperPlane /> {testing ? 'Sending...' : 'Send Test Email'}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default ReminderSettingsCard;
