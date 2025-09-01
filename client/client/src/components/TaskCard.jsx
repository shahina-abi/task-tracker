import React, { useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaCheck, FaClock } from 'react-icons/fa';
import gsap from 'gsap';

const TaskCard = ({ task, onEdit, onDelete, onToggleStatus, index }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, delay: index * 0.1, ease: 'power2.out' }
        );
    }, [index]);

    const priorityColors = {
        High: 'text-red-400 bg-red-400/10',
        Medium: 'text-yellow-400 bg-yellow-400/10',
        Low: 'text-green-400 bg-green-400/10'
    };

    return (
        <div ref={cardRef} className={`card group relative overflow-hidden ${task.completed ? 'opacity-75' : ''}`}>
            {/* Status Indicator Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.completed ? 'bg-green-500' : 'bg-primary'}`}></div>

            <div className="flex justify-between items-start mb-3 pl-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priorityColors[task.priority] || 'text-slate-400 bg-slate-800'}`}>
                    {task.priority}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => onEdit(task)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                        <FaEdit />
                    </button>
                    <button onClick={() => onDelete(task._id)} className="p-2 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-400 transition-colors">
                        <FaTrash />
                    </button>
                </div>
            </div>

            <h3 className={`text-lg font-bold mb-2 pl-2 ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                {task.title}
            </h3>

            <div className="mb-4 space-y-2 pl-2">
                <p className="line-clamp-2 text-sm text-slate-400">
                    {task.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">
                        {task.category || 'Work'}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">
                        {task.duration ?? 1}h
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center pl-2 pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FaClock />
                    <span>{task.deadlineLabel || task.date}</span>
                </div>

                <button
                    onClick={() => onToggleStatus(task)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${task.completed
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-slate-700 text-slate-300 hover:bg-primary/20 hover:text-primary'
                        }`}
                >
                    {task.completed ? (
                        <><FaCheck /> Completed</>
                    ) : (
                        <>Mark Complete</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TaskCard;
