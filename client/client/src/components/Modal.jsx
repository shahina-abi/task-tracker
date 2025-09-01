import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import gsap from 'gsap';

const Modal = ({ isOpen, onClose, title, children, maxWidthClass = 'max-w-md' }) => {
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (!overlayRef.current || !modalRef.current) {
            return;
        }

        if (isOpen) {
            gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'flex' });
            gsap.fromTo(modalRef.current,
                { scale: 0.9, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
            );
        } else {
            gsap.to(overlayRef.current, {
                opacity: 0, duration: 0.3, onComplete: () => {
                    if (overlayRef.current) overlayRef.current.style.display = 'none';
                }
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div ref={overlayRef} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden justify-center items-center p-4">
            <div ref={modalRef} className={`bg-card-bg border border-slate-700 w-full ${maxWidthClass} rounded-2xl shadow-2xl overflow-hidden`}>
                <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <FaTimes />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
