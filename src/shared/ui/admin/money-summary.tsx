import React from 'react';

interface Row {
    label: string;
    value: number | string;
    emphasized?: boolean;
    muted?: boolean;
    negative?: boolean;
}

interface MoneySummaryProps {
    rows: Row[];
    currency?: string;
    className?: string;
    title?: string;
}

function fmt(value: number | string, currency: string): string {
    if (typeof value === 'string') return value;
    return `${value.toLocaleString('ru-RU')} ${currency}`;
}

export const MoneySummaryBlock: React.FC<MoneySummaryProps> = ({
    rows,
    currency = 'KGS',
    className,
    title,
}) => (
    <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2 ${className ?? ''}`}
    >
        {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
        {rows.map((row, i) => (
            <div
                key={i}
                className={`flex items-center justify-between ${
                    row.emphasized
                        ? 'pt-3 border-t border-gray-100 text-lg font-bold'
                        : 'text-sm'
                }`}
            >
                <span className={row.muted ? 'text-gray-400' : 'text-gray-600'}>
                    {row.label}
                </span>
                <span
                    className={
                        row.emphasized
                            ? 'text-amber-600'
                            : row.negative
                            ? 'text-red-500'
                            : 'font-medium text-gray-900'
                    }
                >
                    {row.negative && typeof row.value === 'number' ? '−' : ''}
                    {fmt(row.value, currency)}
                </span>
            </div>
        ))}
    </div>
);
