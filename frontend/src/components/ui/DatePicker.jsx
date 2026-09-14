import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DatePicker = ({
    value,
    onChange,
    min,
    placeholder = "Select date",
    label,
    icon: Icon = CalendarIcon,
    disabled = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Visible month/year inside the calendar popover
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    // When value changes, update currentMonth and currentYear to match
    useEffect(() => {
        if (value) {
            const parts = value.split('-');
            if (parts.length === 3) {
                const y = parseInt(parts[0]);
                const m = parseInt(parts[1]);
                if (!isNaN(y) && !isNaN(m)) {
                    setCurrentYear(y);
                    setCurrentMonth(m - 1);
                }
            }
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectDay = (y, m, d) => {
        const monthStr = String(m + 1).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const dateStr = `${y}-${monthStr}-${dayStr}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    // Calculate days grid
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const generateDays = () => {
        const totalDays = getDaysInMonth(currentYear, currentMonth);
        const startDay = getFirstDayOfMonth(currentYear, currentMonth);
        const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

        const days = [];

        // Prev month
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                month: currentMonth === 0 ? 11 : currentMonth - 1,
                year: currentMonth === 0 ? currentYear - 1 : currentYear,
                isCurrentMonth: false
            });
        }

        // Current month
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                day: i,
                month: currentMonth,
                year: currentYear,
                isCurrentMonth: true
            });
        }

        // Next month
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                month: currentMonth === 11 ? 0 : currentMonth + 1,
                year: currentMonth === 11 ? currentYear + 1 : currentYear,
                isCurrentMonth: false
            });
        }

        return days;
    };

    const isDateBeforeMin = (y, m, d) => {
        if (!min) return false;
        const dateObj = new Date(y, m, d).setHours(0, 0, 0, 0);

        const minParts = min.split('-');
        if (minParts.length !== 3) return false;
        const minY = parseInt(minParts[0]);
        const minM = parseInt(minParts[1]);
        const minD = parseInt(minParts[2]);

        const minObj = new Date(minY, minM - 1, minD).setHours(0, 0, 0, 0);
        return dateObj < minObj;
    };

    const isSelected = (y, m, d) => {
        if (!value) return false;
        const parts = value.split('-');
        if (parts.length !== 3) return false;
        const valY = parseInt(parts[0]);
        const valM = parseInt(parts[1]);
        const valD = parseInt(parts[2]);
        return valY === y && valM === (m + 1) && valD === d;
    };

    const isToday = (y, m, d) => {
        const todayDate = new Date();
        return todayDate.getFullYear() === y && todayDate.getMonth() === m && todayDate.getDate() === d;
    };

    // Format selected date for displaying inside input
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [y, m, d] = parts;
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    };

    const currentYearNum = new Date().getFullYear();
    const yearsRange = [];
    // Jumps of 100 years back and 20 years forward
    for (let y = currentYearNum - 100; y <= currentYearNum + 20; y++) {
        yearsRange.push(y);
    }

    const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const daysGrid = generateDays();

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    {Icon && <Icon className="w-4 h-4 text-teal-600" />}
                    {label}
                </label>
            )}

            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl flex items-center justify-between transition-all select-none ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-teal-300'
                    } ${isOpen && !disabled ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200'
                    }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && <Icon className="w-5 h-5 text-slate-400 group-focus-within:text-teal-600" />}
                    <span className={`truncate font-medium text-sm ${value ? 'text-slate-800' : 'text-slate-400'}`}>
                        {value ? formatDateForInput(value) : placeholder}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                            }}
                            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 rotate-90`} />
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-[300px] left-0 md:left-auto">
                    {/* Header: Month & Year Select */}
                    <div className="flex items-center justify-between p-3 border-b border-slate-50 bg-slate-50/50">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-teal-600 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex gap-1 items-center">
                            <select
                                value={currentMonth}
                                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                                className="bg-transparent font-bold text-slate-800 text-sm focus:outline-none cursor-pointer hover:text-teal-600 rounded p-1 border-none appearance-none"
                            >
                                {MONTH_NAMES.map((name, index) => (
                                    <option key={index} value={index}>{name}</option>
                                ))}
                            </select>
                            <span className="text-slate-400 text-xs">/</span>
                            <select
                                value={currentYear}
                                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                                className="bg-transparent font-bold text-slate-800 text-sm focus:outline-none cursor-pointer hover:text-teal-600 rounded p-1 border-none appearance-none"
                            >
                                {yearsRange.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-teal-600 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Calendar grid */}
                    <div className="p-3">
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-1">
                            {weekdayLabels.map((label, idx) => (
                                <span key={idx} className="text-[11px] font-bold text-slate-400 uppercase">
                                    {label}
                                </span>
                            ))}
                        </div>

                        {/* Days grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {daysGrid.map((cell, idx) => {
                                const disabledDay = isDateBeforeMin(cell.year, cell.month, cell.day);
                                const selected = isSelected(cell.year, cell.month, cell.day);
                                const todayCell = isToday(cell.year, cell.month, cell.day);

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={disabledDay}
                                        onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                                        className={`h-8 w-8 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${!cell.isCurrentMonth ? 'text-slate-300' : ''
                                            } ${disabledDay
                                                ? 'text-slate-200 cursor-not-allowed line-through bg-slate-50/50'
                                                : 'cursor-pointer'
                                            } ${selected
                                                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                                                : !disabledDay && cell.isCurrentMonth
                                                    ? todayCell
                                                        ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                    : !disabledDay
                                                        ? 'hover:bg-slate-50'
                                                        : ''
                                            }`}
                                    >
                                        {cell.day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick helper buttons */}
                    <div className="flex justify-between items-center px-4 py-2 border-t border-slate-50 bg-slate-50/30 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => {
                                const yearStr = today.getFullYear();
                                const monthStr = String(today.getMonth() + 1).padStart(2, '0');
                                const dayStr = String(today.getDate()).padStart(2, '0');
                                const todayStr = `${yearStr}-${monthStr}-${dayStr}`;
                                if (!isDateBeforeMin(today.getFullYear(), today.getMonth(), today.getDate())) {
                                    onChange(todayStr);
                                    setIsOpen(false);
                                } else {
                                    toast.error("Today is before minimum allowed date");
                                }
                            }}
                            className="text-teal-600 hover:text-teal-700 transition-colors p-1"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onChange("");
                                setIsOpen(false);
                            }}
                            className="text-slate-400 hover:text-slate-500 transition-colors p-1"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
