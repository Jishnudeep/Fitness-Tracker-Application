import React from 'react';

interface AIResponseProps {
    markdown: string;
    className?: string;
}

export const AIResponse: React.FC<AIResponseProps> = ({ markdown, className }) => {
    // A simple internal "markdown" renderer to avoid external dependencies
    // It handles: ### Headers, **Bold**, * Bullets, and Newlines

    const lines = markdown.split('\n');

    const renderLine = (line: string, index: number) => {
        const trimmed = line.trim();

        // Headers ###
        if (trimmed.startsWith('###')) {
            return (
                <h3 key={index} className="text-zinc-900 dark:text-white text-lg font-black uppercase tracking-tight mt-6 mb-3 first:mt-0">
                    {trimmed.replace(/^###\s*/, '')}
                </h3>
            );
        }

        // Bullet points * or -
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const content = trimmed.replace(/^[\*\-]\s*/, '');
            return (
                <div key={index} className="flex gap-3 mb-2 ml-1">
                    <span className="text-zinc-400 dark:text-zinc-600 font-bold">•</span>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                        {renderBold(content)}
                    </p>
                </div>
            );
        }

        // Empty lines
        if (trimmed === '') {
            return <div key={index} className="h-2" />;
        }

        // Standard text
        return (
            <p key={index} className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                {renderBold(line)}
            </p>
        );
    };

    const renderBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="font-black text-zinc-900 dark:text-zinc-100">{part.slice(2, -2)}</span>;
            }
            return part;
        });
    };

    return (
        <div className={`animate-in fade-in slide-in-from-bottom-2 duration-700 ${className}`}>
            {lines.map((line, i) => renderLine(line, i))}
        </div>
    );
};
