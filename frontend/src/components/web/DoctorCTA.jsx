import React from 'react';
import { Link } from 'react-router-dom';

const DoctorCTA = () => {
    return (
        <section className="container mx-auto px-6 pb-24">
            <div className="bg-[#eff6f6] rounded-[2.5rem] p-16 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        Can't find what you're looking for?
                    </h2>
                    <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
                        Contact our support team for assistance or to schedule a consultation with a specialist not listed here.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link to="/contact" className="px-8 py-3.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DoctorCTA;
