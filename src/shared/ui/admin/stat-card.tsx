import React from 'react';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    gradient: string;
    hint?: string;
    onClick?: () => void;
}

/**
 * The StatCard visual is shared by the bookings admin page (where it was
 * first introduced) and the new customers / orders / dashboard pages. Any
 * visual tweak lands on every admin surface from here.
 */
export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, gradient, hint, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`group p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 text-left w-full ${
            onClick ? 'cursor-pointer' : 'cursor-default'
        }`}
    >
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
            <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
            >
                <div className="w-4 h-4 text-white">{icon}</div>
            </div>
        </div>
        <div className="text-2xl font-bold text-gray-800 mt-2">{value}</div>
        {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </button>
);
