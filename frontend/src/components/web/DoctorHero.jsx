import React from 'react';

const DoctorHero = () => {
    return (
        <div className="container mx-auto px-6 pt-12 pb-12">
            <section className="bg-teal-600 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden text-center text-white shadow-xl shadow-teal-900/10">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase">
                        World-Class Experts
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Meet Our Specialists
                    </h1>

                    <p className="text-teal-50 text-lg leading-relaxed max-w-2xl mx-auto font-medium opacity-90">
                        Our team of board-certified doctors and specialists is dedicated to providing you with the highest standard of medical care.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default DoctorHero;
