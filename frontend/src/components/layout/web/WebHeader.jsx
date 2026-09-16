import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const WebHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    // Theme Logic
    const isLightHeader = ['/services', '/about', '/contact', '/doctors'].includes(location.pathname);

    // Header Classes
    const headerClass = isLightHeader ? 'bg-white text-slate-800 border-b border-slate-100' : 'bg-teal-600 text-white';
    const navLinkClass = isLightHeader
        ? 'hover:text-teal-600 transition-colors py-1 font-medium text-slate-600'
        : 'hover:text-white transition-colors border-b-2 border-transparent hover:border-white py-1 font-medium text-white/90';
    const activeLinkClass = isLightHeader ? 'text-teal-600 border-b-2 border-teal-600' : 'text-white border-white';

    const logoBoxClass = isLightHeader ? 'bg-teal-50 text-teal-600' : 'bg-white text-teal-600';
    const logoTextClass = isLightHeader ? 'text-slate-900' : 'text-white';
    const logoSubClass = isLightHeader ? 'text-teal-600' : 'text-teal-100';

    // Mobile menu classes (adapt to theme)
    const mobileMenuBgClass = isLightHeader ? 'bg-white border-t border-slate-100' : 'bg-teal-700';
    const mobileNavLinkClass = isLightHeader
        ? 'text-slate-600 hover:text-teal-600 hover:bg-teal-50'
        : 'text-white/90 hover:text-white hover:bg-teal-600';
    const mobileActiveLinkClass = isLightHeader
        ? 'text-teal-600 bg-teal-50 font-semibold'
        : 'text-white bg-teal-600 font-semibold';
    const hamburgerClass = isLightHeader
        ? 'text-slate-600 hover:bg-slate-100 hover:text-teal-600'
        : 'text-white/90 hover:bg-teal-500 hover:text-white';

    const navItems = [
        { to: '/', label: 'Home' },
        { to: '/services', label: 'Services' },
        { to: '/doctors', label: 'Doctors' },
        { to: '/about', label: 'About Us' },
        { to: '/contact', label: 'Contact' },
    ];

    return (
        <nav className={`${headerClass} w-full z-50 transition-colors duration-300 relative`}>
            <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group" onClick={closeMobileMenu}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm transition-colors ${logoBoxClass}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-xl font-bold tracking-tight leading-none ${logoTextClass}`}>MKMC</span>
                        <span className={`text-[10px] uppercase font-bold tracking-widest leading-none mt-0.5 ${logoSubClass}`}>Medical Center</span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8 text-sm">
                    {navItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`${navLinkClass} ${location.pathname === item.to ? activeLinkClass : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Login Button - always visible */}
                    <button
                        onClick={() => navigate('/login')}
                        className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer shadow-sm hover:shadow-md ${isLightHeader ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-white text-teal-700 hover:bg-teal-50'}`}
                    >
                        Login
                    </button>

                    {/* Hamburger button - visible only on mobile */}
                    <button
                        onClick={toggleMobileMenu}
                        className={`inline-flex items-center rounded-lg p-2 md:hidden transition-colors duration-200 ${hamburgerClass}`}
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                } ${mobileMenuBgClass}`}
            >
                <div className="container mx-auto px-6 py-3 flex flex-col gap-1">
                    {navItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={closeMobileMenu}
                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                location.pathname === item.to ? mobileActiveLinkClass : mobileNavLinkClass
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default WebHeader;

