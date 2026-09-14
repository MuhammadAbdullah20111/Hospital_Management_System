import React from 'react';

const ServiceHero = () => {
    return (
        <section className="bg-teal-600 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden text-center text-white shadow-xl shadow-teal-900/10">
            {/* Dot Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase">
                    Excellence in Healthcare
                </div>

                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    Advanced Medical Services for <br /> Your Family
                </h1>

                <p className="text-teal-50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium opacity-90">
                    Committed to providing comprehensive, compassionate, and standardized healthcare excellence to our community.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button className="px-8 py-4 bg-white text-teal-700 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl cursor-pointer">
                        Our Specialties
                    </button>
                    <button className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Emergency 24/7
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ServiceHero;
