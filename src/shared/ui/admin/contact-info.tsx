import React, { useState } from 'react';
import { CheckIcon, CopyIcon, MailIcon, PhoneIcon } from 'lucide-react';

interface ContactInfoBlockProps {
    name: string;
    phone: string;
    email?: string | null;
    /** Optional: show a type badge (GUEST / REGISTERED). */
    customerType?: 'GUEST' | 'REGISTERED';
    className?: string;
}

function telHref(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export const ContactInfoBlock: React.FC<ContactInfoBlockProps> = ({
    name, phone, email, customerType, className,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard?.writeText(phone).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className ?? ''}`}>
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
                    {name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                        {customerType && (
                            <span
                                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                                    customerType === 'REGISTERED'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {customerType === 'REGISTERED' ? 'Клиент' : 'Гость'}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-sm">
                        <a
                            href={telHref(phone)}
                            className="inline-flex items-center gap-1 text-amber-600 hover:underline"
                        >
                            <PhoneIcon className="w-4 h-4" />
                            {phone}
                        </a>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-amber-600 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className="w-3.5 h-3.5" /> Скопировано
                                </>
                            ) : (
                                <>
                                    <CopyIcon className="w-3.5 h-3.5" /> Копировать
                                </>
                            )}
                        </button>
                    </div>
                    {email && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                            <MailIcon className="w-4 h-4" />
                            <a href={`mailto:${email}`} className="hover:text-amber-600">
                                {email}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
