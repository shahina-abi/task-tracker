import React, { useState, useEffect } from 'react';
import { FaChartPie, FaPlus, FaSearch } from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import DailyPlanModal from '../components/DailyPlanModal';
import WeeklyReportModal from '../components/WeeklyReportModal';
import gsap from 'gsap';
import {
    createTask,
    deleteTask,
    fetchWeeklyReport,
    fetchTasks,
    planDay,
    updateTask,
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

    useEffect(() => {
        gsap.fromTo('.dashboard-header',
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );

        loadTasks();
    }, []);

    const formatTask = (task) => ({
        ...task,
        completed: task.status === 'completed',
        deadlineLabel: task.deadline
            ? new Date(task.deadline).toLocaleDateString()
            : 'No deadline',
        duration: Number(task.duration ?? 1),
    });

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

    const handleAddTask = async (newTask) => {
        try {
            const createdTask = await createTask(newTask);
            setTasks((previousTasks) => [formatTask(createdTask), ...previousTasks]);
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

    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === 'All' ||
            (filter === 'Completed' && task.completed) ||
            (filter === 'Pending' && !task.completed);
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="container mx-auto px-6 py-10 min-h-screen">
            <div className="dashboard-header flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
                    <p className="text-slate-400">Manage your tasks efficiently.</p>
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
