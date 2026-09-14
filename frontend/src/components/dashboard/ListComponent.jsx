import React from 'react';
import { Search, Plus } from 'lucide-react';

const ListComponent = ({
    title,
    description,
    onSearch,
    onAdd,
    addButtonText = "Add New",
    children,
    searchTerm = ""
}) => {
    return (
        <div className="space-y-4 mb-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    {description && <p className="text-slate-500 mt-1">{description}</p>}
                </div>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        {addButtonText}
                    </button>
                )}
            </div>

            {/* Sub-header / Search Section */}
            <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                </div>
                {children && <div className="flex items-center gap-3">{children}</div>}
            </div>
        </div>
    );
};

export default ListComponent;
