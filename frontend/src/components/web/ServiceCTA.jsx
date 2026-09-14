import React from 'react';

const ServiceCTA = () => {
    return (
        <section className="bg-[#eff6f6] rounded-[2.5rem] p-16 text-center relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
                    Need Immediate Medical <br /> Assistance?
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
                    Our specialized medical team is on standby 24/7 for emergency consultations. We prioritize your health and quick recovery above all.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Center
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ServiceCTA;
