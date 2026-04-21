import React, { useState, useEffect } from 'react';
import { FaChartPie, FaPlus, FaSearch } from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import FocusSessionPanel from '../components/FocusSessionPanel';
import StatsCard from '../components/StatsCard';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import DailyPlanModal from '../components/DailyPlanModal';
import CalendarView from '../components/CalendarView';
import ReminderPanel from '../components/ReminderPanel';
import ReminderSettingsCard from '../components/ReminderSettingsCard';
import StreakPanel from '../components/StreakPanel';
import WeeklyReportModal from '../components/WeeklyReportModal';
import gsap from 'gsap';
import {
    createTask,
    deleteTask,
    fetchReminders,
    fetchReminderSettings,
    fetchWeeklyReport,
    fetchTasks,
    planDay,
    sendTestReminderEmail,
    updateTask,
    updateReminderSettings,
} from '../services/api';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [tasksError, setTasksError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [dailyPlan, setDailyPlan] = useState({ morning: [], afternoon: [], evening: [] });
    const [isPlanning, setIsPlanning] = useState(false);
    const [plannerError, setPlannerError] = useState('');
    const [weeklyReport, setWeeklyReport] = useState({
        chartData: [],
        productivity: 0,
        previousWeekProductivity: 0,
        comparison: '',
        report: '',
    });
    const [isWeeklyReportLoading, setIsWeeklyReportLoading] = useState(false);
    const [weeklyReportError, setWeeklyReportError] = useState('');
    const [reminders, setReminders] = useState([]);
    const [remindersLoading, setRemindersLoading] = useState(true);
    const [remindersError, setRemindersError] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(
        typeof window !== 'undefined' && 'Notification' in window
            ? window.Notification.permission === 'granted'
            : false
    );
    const [reminderSettings, setReminderSettings] = useState({
        emailRemindersEnabled: true,
        reminderTime: '09:00',
        remindBeforeDays: 1,
        email: '',
    });
    const [reminderSettingsLoading, setReminderSettingsLoading] = useState(true);
    const [reminderSettingsSaving, setReminderSettingsSaving] = useState(false);
    const [testEmailSending, setTestEmailSending] = useState(false);
    const [reminderSettingsError, setReminderSettingsError] = useState('');
    const [testEmailResult, setTestEmailResult] = useState('');
    const [selectedFocusMinutes, setSelectedFocusMinutes] = useState(25);
    const [timerMode, setTimerMode] = useState('focus');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

    useEffect(() => {
        gsap.fromTo('.dashboard-header',
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );

        loadTasks();
        loadReminders();
        loadReminderSettings();
    }, []);

    useEffect(() => {
        if (timerMode === 'focus' && !isTimerRunning) {
            setTimeLeft(selectedFocusMinutes * 60);
        }
    }, [selectedFocusMinutes, timerMode, isTimerRunning]);

    useEffect(() => {
        if (!isTimerRunning) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            setTimeLeft((previous) => {
                if (previous <= 1) {
                    window.clearInterval(interval);
                    setIsTimerRunning(false);

                    if (timerMode === 'focus') {
                        setCompletedFocusSessions((count) => count + 1);
                        setTimerMode('break');
                        return 5 * 60;
                    }

                    setTimerMode('focus');
                    return selectedFocusMinutes * 60;
                }

                return previous - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [isTimerRunning, selectedFocusMinutes, timerMode]);

    useEffect(() => {
        if (
            typeof window === 'undefined' ||
            !('Notification' in window) ||
            Notification.permission !== 'granted' ||
            !reminders.length
        ) {
            return;
        }

        const notifiedKey = 'notified_reminders';
        const notifiedTitles = JSON.parse(localStorage.getItem(notifiedKey) || '[]');
        const newReminders = reminders.filter(
            (reminder) => !notifiedTitles.includes(reminder.title)
        );

        newReminders.forEach((reminder) => {
            new Notification(reminder.title, {
                body: reminder.message,
            });
        });

        if (newReminders.length) {
            localStorage.setItem(
                notifiedKey,
                JSON.stringify([...new Set([...notifiedTitles, ...newReminders.map((item) => item.title)])])
            );
        }
    }, [reminders]);

    const formatTask = (task) => ({
        ...task,
        completed: task.status === 'completed',
        deadlineLabel: task.deadline
            ? new Date(task.deadline).toLocaleDateString()
            : 'No deadline',
        duration: Number(task.duration ?? 1),
        completedAt: task.completedAt || null,
    });

    const getCompletionStats = (allTasks) => {
        const completedTasks = allTasks.filter((task) => task.completed && task.completedAt);

        if (!completedTasks.length) {
            const recentDays = Array.from({ length: 14 }, (_, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (13 - index));

                return {
                    date: date.toISOString().slice(0, 10),
                    weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
                    shortDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    label: date.toLocaleDateString(),
                    count: 0,
                };
            });

            return { currentStreak: 0, longestStreak: 0, completionDays: 0, recentDays };
        }

        const countsByDay = completedTasks.reduce((accumulator, task) => {
            const key = new Date(task.completedAt).toISOString().slice(0, 10);
            accumulator[key] = (accumulator[key] || 0) + 1;
            return accumulator;
        }, {});

        const completedDates = Object.keys(countsByDay).sort();
        let longestStreak = 0;
        let runningStreak = 0;
        let previousDate = null;

        completedDates.forEach((dateString) => {
            const currentDate = new Date(`${dateString}T00:00:00`);

            if (!previousDate) {
                runningStreak = 1;
            } else {
                const diffDays = Math.round(
                    (currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000)
                );
                runningStreak = diffDays === 1 ? runningStreak + 1 : 1;
            }

            longestStreak = Math.max(longestStreak, runningStreak);
            previousDate = currentDate;
        });

        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(today);

        while (countsByDay[checkDate.toISOString().slice(0, 10)]) {
            currentStreak += 1;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (!currentStreak && countsByDay[yesterday.toISOString().slice(0, 10)]) {
            let dateCursor = new Date(yesterday);

            while (countsByDay[dateCursor.toISOString().slice(0, 10)]) {
                currentStreak += 1;
                dateCursor.setDate(dateCursor.getDate() - 1);
            }
        }

        const recentDays = Array.from({ length: 14 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (13 - index));
            const key = date.toISOString().slice(0, 10);

            return {
                date: key,
                weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
                shortDate: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                label: date.toLocaleDateString(),
                count: countsByDay[key] || 0,
            };
        });

        return {
            currentStreak,
            longestStreak,
            completionDays: completedDates.length,
            recentDays,
        };
    };

    const loadTasks = async () => {
        try {
            setTasksLoading(true);
            setTasksError('');
            const data = await fetchTasks();
            setTasks(data.map(formatTask));
        } catch (error) {
            setTasksError(error.response?.data?.message || 'Unable to load your tasks right now.');
        } finally {
            setTasksLoading(false);
        }
    };

    const loadReminders = async () => {
        try {
            setRemindersLoading(true);
            setRemindersError('');
            const data = await fetchReminders();
            setReminders(data.reminders || []);
        } catch (error) {
            setRemindersError(
                error.response?.data?.message || 'Unable to load AI reminders right now.'
            );
        } finally {
            setRemindersLoading(false);
        }
    };

    const loadReminderSettings = async () => {
        try {
            setReminderSettingsLoading(true);
            setReminderSettingsError('');
            const data = await fetchReminderSettings();
            setReminderSettings(data);
        } catch (error) {
            setReminderSettingsError(
                error.response?.data?.message || 'Unable to load reminder settings right now.'
            );
        } finally {
            setReminderSettingsLoading(false);
        }
    };

    const handleAddTask = async (newTask) => {
        try {
            const createdTask = await createTask(newTask);
            setTasks((previousTasks) => [formatTask(createdTask), ...previousTasks]);
            loadReminders();
            setIsModalOpen(false);
        } catch (error) {
            setTasksError(error.response?.data?.message || 'Could not create the task.');
        }
    };

    const handleEditTask = async (updatedTask) => {
        try {
            const savedTask = await updateTask(currentTask._id, updatedTask);
            setTasks((previousTasks) =>
                previousTasks.map((task) =>
                    task._id === currentTask._id ? formatTask(savedTask) : task
                )
            );
            loadReminders();
            setIsModalOpen(false);
            setCurrentTask(null);
        } catch (error) {
            setTasksError(error.response?.data?.message || 'Could not update the task.');
        }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(id);
                setTasks((previousTasks) => previousTasks.filter((task) => task._id !== id));
                loadReminders();
            } catch (error) {
                setTasksError(error.response?.data?.message || 'Could not delete the task.');
            }
        }
    };

    const handleToggleStatus = async (task) => {
        try {
            const savedTask = await updateTask(task._id, {
                ...task,
                status: task.completed ? 'pending' : 'completed',
            });
            setTasks((previousTasks) =>
                previousTasks.map((item) => (item._id === task._id ? formatTask(savedTask) : item))
            );
            loadReminders();
        } catch (error) {
            setTasksError(error.response?.data?.message || 'Could not update task status.');
        }
    };

    const openAddModal = () => {
        setCurrentTask(null);
        setIsModalOpen(true);
    };

    const openEditModal = (task) => {
        setCurrentTask(task);
        setIsModalOpen(true);
    };

    const handlePlanMyDay = async () => {
        setIsPlanModalOpen(true);
        setIsPlanning(true);
        setPlannerError('');

        try {
            const result = await planDay();
            setDailyPlan(result);
        } catch (error) {
            setPlannerError(
                error.response?.data?.message || 'Failed to generate your daily plan.'
            );
        } finally {
            setIsPlanning(false);
        }
    };

    const handleWeeklyReport = async () => {
        setIsWeeklyReportOpen(true);
        setIsWeeklyReportLoading(true);
        setWeeklyReportError('');

        try {
            const result = await fetchWeeklyReport();
            setWeeklyReport(result);
        } catch (error) {
            setWeeklyReportError(
                error.response?.data?.message || 'Failed to generate your weekly report.'
            );
        } finally {
            setIsWeeklyReportLoading(false);
        }
    };

    const handleEnableNotifications = async () => {
        if (!('Notification' in window)) {
            setRemindersError('Browser notifications are not supported on this device.');
            return;
        }

        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
    };

    const handleStartPauseTimer = () => {
        setIsTimerRunning((running) => !running);
    };

    const handleResetTimer = () => {
        setIsTimerRunning(false);
        setTimerMode('focus');
        setTimeLeft(selectedFocusMinutes * 60);
    };

    const handleSaveReminderSettings = async (nextSettings) => {
        try {
            setReminderSettingsSaving(true);
            setReminderSettingsError('');
            setTestEmailResult('');
            const savedSettings = await updateReminderSettings(nextSettings);
            setReminderSettings(savedSettings);
        } catch (error) {
            setReminderSettingsError(
                error.response?.data?.message || 'Unable to save reminder settings.'
            );
        } finally {
            setReminderSettingsSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        try {
            setTestEmailSending(true);
            setReminderSettingsError('');
            const result = await sendTestReminderEmail();

            if (result.delivered) {
                setTestEmailResult('Test reminder email sent successfully.');
            } else if (result.provider === 'preview') {
                setTestEmailResult(
                    'Preview mode: add RESEND_API_KEY and EMAIL_FROM on the backend to send real emails.'
                );
            } else {
                setTestEmailResult(result.message || 'No reminder email was sent.');
            }
        } catch (error) {
            setReminderSettingsError(
                error.response?.data?.message || 'Unable to send test reminder email.'
            );
        } finally {
            setTestEmailSending(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === 'All' ||
            (filter === 'Completed' && task.completed) ||
            (filter === 'Pending' && !task.completed);
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const pendingTasksCount = tasks.filter((task) => !task.completed).length;
    const completedTasksCount = tasks.filter((task) => task.completed).length;
    const totalPlannedHours = tasks.reduce((sum, task) => sum + (Number(task.duration) || 0), 0);
    const completionRate = tasks.length ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
    const completionStats = getCompletionStats(tasks);
    const urgentTask = reminders[0] || tasks.find((task) => !task.completed) || null;

    const handleMarkUrgentTaskComplete = async (taskId) => {
        const targetTask = tasks.find((task) => task._id === taskId);

        if (!targetTask) {
            return;
        }

        await handleToggleStatus(targetTask);
    };

    return (
        <div className="container mx-auto px-6 py-10 min-h-screen">
            <div className="dashboard-header flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Student + Productivity Mode</p>
                    <h1 className="mt-2 text-3xl font-bold text-white mb-2">My Dashboard</h1>
                    <p className="text-slate-400">Turn deadlines, study sessions, and personal goals into a clear weekly system.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={handleWeeklyReport}
                        className="flex items-center justify-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-6 py-3 font-semibold text-white transition hover:border-sky-400/50 hover:bg-sky-500/20"
                    >
                        <FaChartPie /> Weekly Report 📊
                    </button>
                    <button
                        onClick={handlePlanMyDay}
                        className="flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-slate-900 px-6 py-3 font-semibold text-white transition hover:border-primary hover:bg-slate-800"
                    >
                        <FaWandMagicSparkles /> Plan My Day ✨
                    </button>
                    <button onClick={openAddModal} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full shadow-lg hover:shadow-primary/50">
                        <FaPlus /> Add New Task
                    </button>
                </div>
            </div>

            {tasksError && (
                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {tasksError}
                </div>
            )}

            <FocusSessionPanel
                urgentTask={urgentTask}
                timerMode={timerMode}
                timeLeft={timeLeft}
                isRunning={isTimerRunning}
                completedFocusSessions={completedFocusSessions}
                selectedMinutes={selectedFocusMinutes}
                onMinutesChange={setSelectedFocusMinutes}
                onStartPause={handleStartPauseTimer}
                onReset={handleResetTimer}
                onMarkComplete={handleMarkUrgentTaskComplete}
            />

            <section className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard
                    eyebrow="Pending"
                    value={pendingTasksCount}
                    label="Tasks still waiting for focused work"
                    accent="from-amber-500/15 via-slate-900 to-slate-900"
                />
                <StatsCard
                    eyebrow="Completed"
                    value={completedTasksCount}
                    label="Tasks you have already finished"
                    accent="from-emerald-500/15 via-slate-900 to-slate-900"
                />
                <StatsCard
                    eyebrow="Planned Hours"
                    value={`${totalPlannedHours}h`}
                    label="Total hours currently mapped across tasks"
                    accent="from-sky-500/15 via-slate-900 to-slate-900"
                />
                <StatsCard
                    eyebrow="Completion Rate"
                    value={`${completionRate}%`}
                    label="How much of your workload is already done"
                    accent="from-fuchsia-500/15 via-slate-900 to-slate-900"
                />
            </section>

            <StreakPanel
                currentStreak={completionStats.currentStreak}
                longestStreak={completionStats.longestStreak}
                completionDays={completionStats.completionDays}
                recentDays={completionStats.recentDays}
            />

            <CalendarView tasks={tasks} />

            <ReminderPanel
                reminders={reminders}
                loading={remindersLoading}
                error={remindersError}
                notificationsEnabled={notificationsEnabled}
                onEnableNotifications={handleEnableNotifications}
            />

            <ReminderSettingsCard
                settings={reminderSettings}
                loading={reminderSettingsLoading}
                saving={reminderSettingsSaving}
                testing={testEmailSending}
                error={reminderSettingsError}
                testResult={testEmailResult}
                onSave={handleSaveReminderSettings}
                onSendTest={handleSendTestEmail}
            />

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-grow">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Pending', 'Completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === f ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task Grid */}
            {tasksLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                </div>
            ) : filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map((task, index) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            index={index}
                            onEdit={openEditModal}
                            onDelete={handleDeleteTask}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-500">
                    <p className="text-xl">No tasks found matching your criteria.</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentTask ? 'Edit Task' : 'Add New Task'}
            >
                <TaskForm
                    onSubmit={currentTask ? handleEditTask : handleAddTask}
                    initialData={currentTask}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <DailyPlanModal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                plan={dailyPlan}
                loading={isPlanning}
                error={plannerError}
            />

            <WeeklyReportModal
                isOpen={isWeeklyReportOpen}
                onClose={() => setIsWeeklyReportOpen(false)}
                report={weeklyReport}
                loading={isWeeklyReportLoading}
                error={weeklyReportError}
            />
        </div>
    );
};

export default Dashboard;
