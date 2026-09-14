import React from 'react';
import { Link } from 'react-router-dom';
import LoadingPlaceholder from '../ui/LoadingPlaceholder';

const iconMap = {
    'Stethoscope': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    'Heart': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
    'Baby': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    'Flask': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
    ),
};

const FallbackIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ServiceGrid = ({ services, isLoading, error }) => {
    const [expandedId, setExpandedId] = React.useState(null);

    return (
        <section className="py-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-1 bg-teal-500 rounded-full"></div>
                        <span className="text-xs font-bold text-teal-600 tracking-widest uppercase">Departmental Hub</span>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900">Specialized Care Units</h2>
                    <p className="text-slate-500 max-w-xl text-lg">Access world-class diagnostics and treatment across our specialized medical departments.</p>
                </div>
            </div>

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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {services.map((service, index) => {
                        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';
                        const apiRoot = baseUrl.replace('/api', '');
                        const imageUrl = service.image ? (service.image.startsWith('http') ? service.image : `${apiRoot}${service.image}`) : null;
                        const isExpanded = expandedId === service.id;

                        return (
                            <div key={service.id || index} className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 transition-all duration-500 group overflow-hidden flex flex-col h-full">
                                {imageUrl && (
                                    <div className="relative h-56 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={imageUrl} 
                                            alt={service.imageAlt || service.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="absolute bottom-4 left-4">
                                            <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-teal-600 shadow-lg">
                                                {iconMap[service.icon] || <FallbackIcon />}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-8 flex-1 flex flex-col">
                                    {!imageUrl && (
                                        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                            {iconMap[service.icon] || <FallbackIcon />}
                                        </div>
                                    )}
                                    
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{service.category || 'General Care'}</span>
                                        {service.rating && (
                                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                                <span>★</span>
                                                <span>{service.rating}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">{service.name}</h3>
                                    
                                    <div className={`text-slate-500 text-sm leading-relaxed mb-8 transition-all duration-500 ${isExpanded ? '' : 'line-clamp-3'}`}>
                                        {isExpanded ? (service.description || service.shortDescription) : (service.shortDescription || service.description)}
                                        
                                        {isExpanded && service.features && service.features.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                                <p className="font-bold text-slate-800 text-[10px] uppercase tracking-widest">Available Features:</p>
                                                <ul className="grid grid-cols-1 gap-3">
                                                    {service.features.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-slate-600">
                                                            <div className="mt-1 w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0"></div>
                                                            <span className="text-xs">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <button 
                                            onClick={() => setExpandedId(isExpanded ? null : service.id)}
                                            className="inline-flex items-center gap-2 text-teal-600 font-bold text-sm hover:gap-3 transition-all cursor-pointer"
                                        >
                                            {isExpanded ? 'Show Less' : 'Learn More'}
                                            <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M17 8l4 4m0 0l-4 4m4-4H3"} />
                                            </svg>
                                        </button>
                                        {service.baseCost && (
                                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">From Rs.{service.baseCost}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default ServiceGrid;
