import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-16 pb-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-teal-100/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            We are now open 24/7
          </div>

          <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Excellence in <br />
            <span className="text-teal-500">Digital Health</span> <br />
            Solutions
          </h1>

          <p className="text-base text-slate-500 leading-relaxed max-w-md">
            Mehmood Khan Medical Center provides specialized healthcare through advanced technology and world-class medical professionals.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/services" className="px-8 py-3.5 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/20">
              Our Services
            </Link>
            <Link to="/about" className="px-8 py-3.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-bold hover:border-teal-500 hover:text-teal-600 transition-all">
              Learn More
            </Link>
          </div>

          <div className="pt-6 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-9 h-9 rounded-full border-2 border-white" />
              <img src="https://i.pravatar.cc/150?img=12" alt="User" className="w-9 h-9 rounded-full border-2 border-white" />
              <img src="https://i.pravatar.cc/150?img=5" alt="User" className="w-9 h-9 rounded-full border-2 border-white" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Trusted by over <strong className="text-slate-900">10,000+</strong> regular patients
            </p>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative">
          {/* Main Image Container */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[500px]">
            <img
              src="/images/hero_corridor.png"
              alt="Hospital Corridor"
              className="w-full h-full object-cover"
            />

            {/* Floating Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100/50 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">ISO Certified Center</h4>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Highest standards of medical safety</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
