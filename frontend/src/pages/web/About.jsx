import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  // Leadership Team Data
  const team = [
    {
      name: 'Dr. Mehmood Khan',
      role: 'FOUNDER & CEO',
      image: '/images/doctor_innovation.png'
    },
    {
      name: 'Sarah Al-Faraj',
      role: 'CHIEF OPERATING OFFICER',
      image: '/images/nurse_portrait.png' // Changed to use reliable existing image
    },
    {
      name: 'James Chen',
      role: 'HEAD OF DIGITAL',
      image: 'https://i.pravatar.cc/300?img=11'
    },
    {
      name: 'Dr. Elena Rodriguez',
      role: 'CHIEF MEDICAL OFFICER',
      image: 'https://i.pravatar.cc/300?img=5'
    },
  ];

  // Stats Data
  const stats = [
    { label: 'PATIENTS SERVED', value: '50,000+', icon: 'ppl' },
    { label: 'YEARS OF EXCELLENCE', value: '15+', icon: 'shield' },
    { label: 'DIGITAL ADOPTION', value: '100%', icon: 'doc' },
  ];

  return (
    <div className="bg-white min-h-screen font-sans">

      {/* Hero Section */}
      <section className="pt-16 pb-24 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            OUR MISSION
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
            Digitizing <br />
            Healthcare for a <br />
            <span className="text-teal-500">Healthier Tomorrow</span>
          </h1>

          <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
            Mehmood Khan Medical Center (MKMC) is dedicated to integrating cutting-edge technology with compassionate care. We are redefining the patient journey through seamless digital integration and precision medicine.
          </p>

          <div className="flex gap-4 pt-2">
            <button className="px-8 py-3.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 text-sm">
              Our Vision
            </button>
            <button className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:border-teal-500 hover:text-teal-600 transition-all text-sm">
              Contact Us
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[40px] overflow-hidden shadow-2xl relative z-10">
            <img src="/images/hero_corridor.png" alt="Hospital Interior" className="w-full h-[400px] object-cover" />
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="pb-24 container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl flex items-center gap-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-slate-50">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                {stat.icon === 'ppl' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>}
                {stat.icon === 'shield' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                {stat.icon === 'doc' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Pillars */}
      <section className="pb-24 container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Core Pillars</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-16">
          At MKMC, we believe in a future where healthcare is accessible, precise, and patient-centric through these three foundational principles.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Precision Medicine', desc: 'Leveraging genetic insights and data analytics to provide personalized treatment plans tailored to your unique biology.', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
            { title: 'Digital Accessibility', desc: 'Breaking barriers with telemedicine and 24/7 digital record access, putting your health data in the palm of your hand.', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
            { title: 'Patient-Centricity', desc: 'Technology is our tool, but human empathy is our engine. We prioritize the patient experience in every digital touchpoint.', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
          ].map((item, i) => (
            <div key={i} className="bg-teal-50/30 p-10 rounded-[30px] border border-transparent hover:border-teal-100 transition-all">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-teal-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Team */}
      <section className="pb-24 container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Leadership Team</h2>
            <p className="text-slate-500 text-sm">The visionaries behind our digital transformation.</p>
          </div>
          <Link to="/doctors" className="text-teal-600 font-bold text-sm hover:gap-3 transition-all flex items-center gap-2">
            View Full Directory
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <div key={i} className="group text-center">
              <div className="aspect-square rounded-[30px] overflow-hidden mb-6 relative">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/20 transition-all"></div>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{member.name}</h4>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-teal-600 rounded-[2.5rem] mx-6 p-16 text-center relative overflow-hidden mb-24 shadow-2xl shadow-teal-900/20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Ready to experience the future of care?
          </h2>
          <p className="text-teal-50 text-lg leading-relaxed max-w-xl mx-auto">
            Join over 50,000 patients who have transitioned to a smarter, faster, and more personal healthcare experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/services" className="px-8 py-3.5 bg-emerald-500/20 border border-white/20 text-white rounded-lg font-bold hover:bg-emerald-500/30 transition-all text-sm min-w-[140px]">
              View All Services
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
