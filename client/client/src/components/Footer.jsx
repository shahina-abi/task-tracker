import React from 'react';
import { FaBrain, FaGithub, FaTwitter } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-dark border-t border-slate-800 py-8 mt-auto">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-slate-400 text-sm flex items-center gap-1">
                    <FaBrain className="text-sky-300" />
                    <span>Built for focused study and personal productivity.</span>
                </div>

                <div className="flex gap-6">
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-xl"><FaGithub /></a>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-xl"><FaTwitter /></a>
                </div>

                <div className="text-slate-500 text-xs">
                    &copy; {new Date().getFullYear()} TaskTracker. Plan smarter every week.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
