import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTasks, FaBars, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        gsap.fromTo('.nav-item',
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out' }
        );
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        ...(user ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dark/90 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white hover:text-primary transition-colors">
                    <FaTasks className="text-primary" />
                    <span>Task<span className="text-primary">Tracker</span></span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`nav-item text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-slate-300'}`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-slate-300 text-sm flex items-center gap-2">
                                <FaUser className="text-primary" /> {user.name}
                            </span>
                            <button onClick={handleLogout} className="nav-item btn-primary py-2 px-4 text-sm flex items-center gap-2 bg-red-500 hover:bg-red-600 !from-red-500 !to-red-600">
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="nav-item text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="nav-item btn-primary py-2 px-4 text-sm">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button onClick={toggleMenu} className="md:hidden text-white text-2xl focus:outline-none">
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-dark/95 backdrop-blur-xl border-t border-slate-800 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col p-6 gap-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={`text-lg font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-slate-300'}`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {user ? (
                        <>
                            <div className="text-slate-400 text-sm flex items-center gap-2 py-2 border-t border-slate-700">
                                <FaUser /> {user.name}
                            </div>
                            <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 font-medium flex items-center gap-2">
                                <FaSignOutAlt /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-slate-300 hover:text-white">
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary py-2 px-4 text-center">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
