import React from 'react';

const Innovation = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Left Side: Content */}
                    <div className="lg:w-5/12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6 leading-tight">
                            Redefining Healthcare <br />
                            <span className="text-teal-500">Through Innovation</span>
                        </h2>
                        <p className="text-slate-500 mb-10 text-sm leading-relaxed">
                            We leverage the latest digital transformation trends in medicine to provide you with faster, safer, and more accurate healthcare services.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4 group">
                                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">Smart Patient Records</h4>
                                    <p className="text-slate-400 text-xs text-justify max-w-xs">Encrypted digital medical history accessible across all departments.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 group">
                                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">Swift Emergency Response</h4>
                                    <p className="text-slate-400 text-xs text-justify max-w-xs">Integrated emergency protocols with real-time specialist availability.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 group">
                                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">Tele-Health Support</h4>
                                    <p className="text-slate-400 text-xs text-justify max-w-xs">Virtual consultations for follow-ups and routine checkups from home.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Grid Layout */}
                    <div className="lg:w-7/12">
                        <div className="grid grid-cols-2 gap-4">
                            {/* 1. Male Doctor Image */}
                            <div className="rounded-2xl overflow-hidden h-64 bg-teal-50">
                                <img
                                    src="/images/doctor_innovation.png"
                                    alt="Specialist"
                                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* 2. Top Right Dark Card */}
                            <div className="bg-[#1e293b] rounded-2xl p-6 flex flex-col justify-center h-64 text-white hover:bg-slate-800 transition-colors">
                                <h3 className="text-4xl font-bold mb-2">50+</h3>
                                <p className="text-sm text-slate-400 font-medium">Top Specialists</p>
                                <p className="text-xs text-slate-500 mt-2">World-class doctors across 15+ disciplines.</p>
                            </div>

                            {/* 3. Bottom Left Teal Card */}
                            <div className="bg-teal-600 rounded-2xl p-6 flex flex-col justify-center h-64 text-white hover:bg-teal-500 transition-colors">
                                <h3 className="text-4xl font-bold mb-2">15+</h3>
                                <p className="text-sm text-teal-100 font-medium">Years Experience</p>
                                <p className="text-xs text-teal-200 mt-2">Serving the community with excellence since 2010.</p>
                            </div>

                            {/* 4. Female Doctor Image */}
                            <div className="rounded-2xl overflow-hidden h-64 bg-slate-100">
                                <img
                                    src="/images/nurse_portrait.png"
                                    alt="Nurse"
                                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Innovation;
