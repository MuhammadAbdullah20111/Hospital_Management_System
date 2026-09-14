import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const WebHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();

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

    return (
        <nav className={`${headerClass} w-full z-50 transition-colors duration-300`}>
            <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
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

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8 text-sm">
                    <Link to="/" className={`${navLinkClass} ${location.pathname === '/' ? activeLinkClass : ''}`}>Home</Link>
                    <Link to="/services" className={`${navLinkClass} ${location.pathname === '/services' ? activeLinkClass : ''}`}>Services</Link>
                    <Link to="/doctors" className={`${navLinkClass} ${location.pathname === '/doctors' ? activeLinkClass : ''}`}>Doctors</Link>
                    <Link to="/about" className={`${navLinkClass} ${location.pathname === '/about' ? activeLinkClass : ''}`}>About Us</Link>
                    <Link to="/contact" className={`${navLinkClass} ${location.pathname === '/contact' ? activeLinkClass : ''}`}>Contact</Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Book Now Button */}
                    {/* <button
                        onClick={() => navigate('/')}
                        className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer shadow-sm hover:shadow-md ${isLightHeader ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-white text-teal-700 hover:bg-teal-50'}`}
                    >
                        {isLightHeader ? 'logout' : 'logout'}
                    </button> */}
                    <button
                        onClick={() => navigate('/login')}
                        className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all cursor-pointer shadow-sm hover:shadow-md ${isLightHeader ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-white text-teal-700 hover:bg-teal-50'}`}
                    >
                        {isLightHeader ? 'Login' : 'Login'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default WebHeader;
