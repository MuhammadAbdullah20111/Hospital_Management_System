import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import LoadingPlaceholder from '../ui/LoadingPlaceholder';

const DoctorGrid = ({ doctors, isLoading, error }) => {
    const [activeCategory, setActiveCategory] = useState('All');

    // Extract unique specialties from doctors list for filter tabs with checking if doc.specialty exists
    const specialties = ['All', ...new Set(doctors.map(doc => doc.specialty).filter(Boolean))];

    const filteredDoctors = activeCategory === 'All'
        ? doctors
        : doctors.filter(doc => doc.specialty === activeCategory);

    return (
        <div className="min-h-screen font-sans">
            {/* Filter Tabs */}
            <div className="container mx-auto px-6 mb-12 overflow-x-auto">
                <div className="flex justify-center min-w-max gap-2">
                    {specialties.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === cat
                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Doctors Grid */}
            <section className="container mx-auto px-6 pb-24">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingPlaceholder className="h-16 w-16" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-600">
                        <p>Error: {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredDoctors.map((doc) => (
                            <div key={doc.id} className="group bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300">
                                {/* Image */}
                                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-6 relative bg-slate-100">
                                    {doc.image ? (
                                        <img
                                            src={doc.image.startsWith('http') ? doc.image : `${import.meta.env.VITE_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${doc.image}`}
                                            alt={doc.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300">
                                            <User className="w-24 h-24" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-teal-700 shadow-sm">
                                        {doc.experience || 'Experienced'}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="text-center space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                                        <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mt-1">{doc.role}</p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-xs font-medium text-slate-500">
                                        <span>{doc.specialty}</span>
                                        <span className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            {doc.availability || 'Available'}
                                        </span>
                                    </div>

                                    <Link to="/contact" className="block w-full py-3 mt-2 bg-slate-50 text-slate-900 rounded-xl font-bold text-sm hover:bg-teal-600 hover:text-white transition-all text-center">
                                        Inquire Now
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default DoctorGrid;
