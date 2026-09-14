import LoadingPlaceholder from '../../components/ui/LoadingPlaceholder';
import React from 'react';

const DataTable = ({
    columns,
    data,
    isLoading,
    emptyMessage = "No records found.",
    onRowClick
}) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-teal-100">
                <LoadingPlaceholder className="h-12 w-12" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-teal-50">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((row, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    onClick={(e) => {
                                        // Skip row click if clicking on an interactive element
                                        if (e.target.closest('button, a, input, select, textarea')) {
                                            return;
                                        }
                                        onRowClick && onRowClick(row);
                                    }}
                                    className={`transition-colors group border-b border-slate-50 last:border-b-0 ${onRowClick
                                        ? 'cursor-pointer hover:bg-teal-50'
                                        : 'hover:bg-slate-50/50'
                                        }`}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4 text-sm text-slate-600">
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-slate-500 font-medium"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
