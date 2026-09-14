import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronRight, X } from 'lucide-react';

const TimePicker = ({
    value,
    onChange,
    label,
    icon: Icon = Clock,
    disabled = false,
    className = "",
    inputClassName = "px-4 py-3 bg-slate-50 rounded-xl"
}) => {
    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    {Icon && <Icon className="w-4 h-4 text-teal-600" />}
                    {label}
                </label>
            )}

            <div className={`relative w-full border flex items-center transition-all focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 ${inputClassName} ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-teal-300 border-slate-200'}`}>
                {Icon && (
                    <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                )}
                
                <input
                    type="time"
                    disabled={disabled}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full bg-transparent focus:outline-none font-medium text-sm text-slate-800 ${Icon ? 'pl-10 md:pl-12' : 'pl-3'} pr-3 cursor-text h-full py-0`}
                />
            </div>
        </div>
    );
};

export default TimePicker;
