import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const WebFooter = () => {
    const location = useLocation();
    const isLightFooter = ['/services', '/about', '/doctors'].includes(location.pathname);

    return isLightFooter ? (
        // Services Page Footer (Light)
        <footer className="bg-white text-slate-600 pt-20 pb-8 mt-20 border-t border-slate-100">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-4 gap-12 pb-16">
                    {/* Col 1: Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-slate-900">MKMC</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Excellence in healthcare through innovation, compassion, and standardized medical practices for over 15 years.
                        </p>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all cursor-pointer">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" /></svg>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all cursor-pointer">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05a4.28 4.28 0 0 0-7.29 3.9 12.14 12.14 0 0 1-8.81-4.47 4.27 4.27 0 0 0 1.32 5.71 4.29 4.29 0 0 1-1.93-.53v.05c0 2.07 1.48 3.8 3.44 4.2a4.22 4.22 0 0 1-1.92.07 4.28 4.28 0 0 0 4 2.98 8.57 8.57 0 0 1-5.3 1.83c-.34 0-.68-.02-1.02-.06a12.12 12.12 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2v-.55c.84-.61 1.56-1.37 2.14-2.26z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Col 2 */}
                    <div>
                        <h5 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                            Quick Links
                        </h5>
                        <ul className="space-y-4 text-sm font-medium">
                            <li className="hover:text-teal-600 cursor-pointer">Our Doctors</li>
                            <li className="hover:text-teal-600 cursor-pointer">Health Packages</li>
                            <li className="hover:text-teal-600 cursor-pointer">Latest News</li>
                        </ul>
                    </div>

                    {/* Col 3: Operating Hours */}
                    <div>
                        <h5 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                            Operating Hours
                        </h5>
                        <ul className="space-y-4 text-sm font-medium">
                            <li className="flex justify-between">
                                <span>Mon - Fri:</span>
                                <span className="text-slate-900">08:00 - 20:00</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Saturday:</span>
                                <span className="text-slate-900">09:00 - 17:00</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-teal-600 font-bold">Emergency:</span>
                                <span className="text-teal-600 font-bold">24/7 Available</span>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Contact */}
                    <div>
                        <h5 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                            Contact Info
                        </h5>
                        <ul className="space-y-5 text-sm font-medium">
                            <li className="flex gap-3">
                                <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-slate-500">Medical Center Plaza, Suite 400<br />Central Business District</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="text-slate-500">info@mkmc-health.org</span>
                            </li>
                            <li className="flex gap-3 items-center">
                                <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="text-slate-500">+1 (555) 000-1234</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-medium text-slate-400">
                    <p>© 2026 Mehmood Khan Medical Center (MKMC). All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link to="#" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-teal-600 transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-teal-600 transition-colors">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    ) : (
        // Home Page Footer (Dark)
        <footer className="bg-[#0f172a] text-slate-300 pt-20 pb-8 mt-20 border-t border-slate-800">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-4 gap-12 pb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-9 h-9 bg-teal-500 rounded flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold tracking-tight">MKMC</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Leading the way in digital healthcare excellence. Providing compassionate care and modern medical solutions since 2005.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Healthcare</h5>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="hover:text-teal-400 cursor-pointer">Department List</li>
                            <li className="hover:text-teal-400 cursor-pointer">Our Medical Team</li>
                            <li className="hover:text-teal-400 cursor-pointer">Technology & Labs</li>
                            <li className="hover:text-teal-400 cursor-pointer">International Patients</li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Get in Touch</h5>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li>123 Health Ave, Medical City</li>
                            <li>+1 (800) 000-0000</li>
                            <li>contact@mkmc.com</li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                    <p>© 2026 MK Medical Center. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default WebFooter;
