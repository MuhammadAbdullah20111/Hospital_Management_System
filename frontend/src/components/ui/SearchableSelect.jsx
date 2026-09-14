import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const SearchableSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select an option...", 
    noOptionsMessage = "No results found",
    icon: Icon,
    label,
    disabled = false,
    searchable = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    {Icon && <Icon className="w-4 h-4 text-teal-600" />}
                    {label}
                </label>
            )}
            
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl flex items-center justify-between transition-all ${
                    disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-teal-300'
                } ${
                    isOpen && !disabled ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200'
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && <Icon className="w-5 h-5 text-slate-400 group-focus-within:text-teal-600" />}
                    <span className={`truncate font-medium ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {value && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                            }}
                            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {searchable && (
                        <div className="p-3 border-b border-slate-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 transition-all text-sm font-medium"
                                    placeholder="Search..."
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className="max-h-60 overflow-y-auto py-2">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                                        String(value) === String(option.value)
                                            ? 'bg-teal-50 text-teal-700 font-bold'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm">{option.label}</span>
                                        {option.subLabel && <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{option.subLabel}</span>}
                                    </div>
                                    {String(value) === String(option.value) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-600 shadow-sm shadow-teal-600/50" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-slate-400">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm font-medium">{noOptionsMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
