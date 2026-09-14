import React from 'react';

const specializations = [
  {
    title: 'Cardiology',
    description: 'Comprehensive heart care, diagnostics, and surgical interventions.',
    icon: (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Neurology',
    description: 'Advanced treatment for complex brain and nervous system disorders.',
    icon: (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Pediatrics',
    description: 'Dedicated medical care for infants, children, and adolescents.',
    icon: (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Orthopedics',
    description: 'Expert care for bones, joints, and musculoskeletal system health.',
    icon: (
      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
];

const Specializations = () => {
  return (
    <section className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Our Specializations</h2>
          <p className="text-slate-500 text-sm">
            Discover our comprehensive range of medical services provided by experts in their fields.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specializations.map((spec, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 text-center flex flex-col items-center group cursor-pointer border border-transparent hover:border-teal-100"
            >
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-6 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                {spec.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{spec.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                {spec.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Specializations;
