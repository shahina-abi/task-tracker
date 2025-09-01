import React from 'react';
import { FaHeart, FaGithub, FaTwitter } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-dark border-t border-slate-800 py-8 mt-auto">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-slate-400 text-sm flex items-center gap-1">
                    <span>Made with</span>
                    <FaHeart className="text-accent animate-pulse" />
                    <span>by TaskTracker Team</span>
                </div>

                <div className="flex gap-6">
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-xl"><FaGithub /></a>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-xl"><FaTwitter /></a>
                </div>

                <div className="text-slate-500 text-xs">
                    &copy; {new Date().getFullYear()} TaskTracker. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
