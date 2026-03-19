import React from 'react';

interface AIResponseProps {
    markdown: string;
    className?: string;
}

export const AIResponse: React.FC<AIResponseProps> = ({ markdown, className }) => {
    const lines = markdown.split('\n');

    const renderLine = (line: string, index: number) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('###')) {
            return (
                <h3 key={index} className="text-zinc-900 dark:text-white text-base font-bold mt-5 mb-2 first:mt-0">
                    {trimmed.replace(/^###\s*/, '')}
                </h3>
            );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const content = trimmed.replace(/^[\*\-]\s*/, '');
            return (
                <div key={index} className="flex gap-2.5 mb-1.5 ml-1">
                    <span className="text-zinc-300 dark:text-zinc-600 mt-1.5 text-[8px]">●</span>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                        {renderBold(content)}
                    </p>
                </div>
            );
        }

        if (trimmed === '') {
            return <div key={index} className="h-2" />;
        }

        return (
            <p key={index} className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-3">
                {renderBold(line)}
            </p>
        );
    };

    const renderBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    return (
        <div className={`page-enter ${className}`}>
            {lines.map((line, i) => renderLine(line, i))}
        </div>
    );
};
