import React from 'react';
import { Link } from 'react-router-dom';

const Journey = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="bg-[#0f172a] rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            Your journey to better health <br /> begins here.
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                            Explore our digital facilities and specialized medical services.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/doctors"
                                className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/20"
                            >
                                Find a Doctor
                            </Link>
                            <Link
                                to="/locations"
                                className="px-8 py-4 bg-transparent border border-slate-600 text-white rounded-xl font-bold hover:bg-slate-800 hover:border-slate-500 transition-all"
                            >
                                Our Locations
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Journey;
