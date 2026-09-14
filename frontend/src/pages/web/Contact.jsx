import React, { useState, useEffect } from 'react';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { submitContactAPI } from '../../api/web/webApi';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formError, setFormError] = useState('');

    const [location, setLocation] = useState({
        lat: 24.9380352, // Mehmood Medical Centre Latitude
        lng: 66.9580436, // Mehmood Medical Centre Longitude
        loading: false,
        error: null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            setFormError('Please fill out all required fields.');
            return;
        }

        setIsSubmitting(true);

        try {
            await submitContactAPI(formData);
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setFormData({
                name: '',
                email: '',
                subject: 'General Inquiry',
                message: ''
            });
        } catch (error) {
            setIsSubmitting(false);
            setFormError(error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="py-12 bg-white min-h-screen font-sans">
            <div className="container mx-auto px-6">

                {/* Title Section */}
                <div className="text-center max-w-2xl mx-auto mb-16 pt-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Get in Touch</h1>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Have questions or need medical assistance? Our dedicated team is here to help you 24/7.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Left: Contact Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 min-h-[500px] flex flex-col justify-center">
                            {submitSuccess ? (
                                <div className="text-center space-y-6 animate-fade-in py-8">
                                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto shadow-inner">
                                        <svg className="w-10 h-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
                                        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                                            Thank you for reaching out to Mehmood khan Medical Centre. Your message has been received successfully, and our team will get back to you shortly.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSubmitSuccess(false)}
                                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-8">
                                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <h2 className="text-2xl font-bold text-slate-900">Send us a Message</h2>
                                    </div>

                                    {formError && (
                                        <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium">
                                            {formError}
                                        </div>
                                    )}

                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Full Name *</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter your name"
                                                    disabled={isSubmitting}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 disabled:opacity-60"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">Email Address *</label>
                                                <input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    disabled={isSubmitting}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 disabled:opacity-60"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <SearchableSelect
                                                label="Subject"
                                                value={formData.subject}
                                                onChange={(val) => setFormData({ ...formData, subject: val })}
                                                options={[
                                                    { value: 'General Inquiry', label: 'General Inquiry' },
                                                    { value: 'Feedback', label: 'Feedback' },
                                                    { value: 'Other', label: 'Other' }
                                                ]}
                                                placeholder="Select Subject"
                                                searchable={false}
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Message *</label>
                                            <textarea
                                                rows="5"
                                                placeholder="How can we help you?"
                                                disabled={isSubmitting}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 resize-none disabled:opacity-60"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </div>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Info & Map */}
                    <div className="lg:col-span-5 space-y-10">

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h5 className="font-bold text-teal-600 text-xs uppercase tracking-widest mb-6">Contact Information</h5>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Our Location</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed mt-1">Mehmood Khan Medical Centre<br />Karachi, Sindh, Pakistan</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Phone Support</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed mt-1">
                                        Emergency: (555) 123-4567<br />
                                        General: (555) 987-6543
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Working Hours</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed mt-1">
                                        Mon - Sat: 08:00 AM - 10:00 PM<br />
                                        Sunday: Emergency Services Only
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="space-y-6">
                            <h5 className="font-bold text-teal-600 text-xs uppercase tracking-widest">Follow Us</h5>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all cursor-pointer">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all cursor-pointer">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" /></svg>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all cursor-pointer">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .593 0 1.325v21.351C0 23.407.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-200 relative border border-slate-200 shadow-inner group animate-fade-in">
                            <iframe
                                title="Location Map"
                                src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                                className="w-full h-full border-0 filter grayscale hover:grayscale-0 transition-all duration-700"
                                allowFullScreen=""
                                loading="lazy"
                            ></iframe>
                            <a
                                href="https://maps.app.goo.gl/esbReU3BN7FAiYVr6"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-4 right-4 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl shadow-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 pointer-events-auto"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                MKMC Hospital
                            </a>
                        </div>

                    </div>
                </div>

            </div>
        </div>  
    );
};

export default Contact;
