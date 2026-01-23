import React from 'react';

interface TableProps {
    headers: string[];
    data: (string | number | React.ReactNode)[][];
    className?: string;
}

const Table: React.FC<TableProps> = ({ headers, data, className = '' }) => {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full border-collapse border border-gray-300 dark:border-zinc-800">
                <thead>
                    <tr className="bg-gray-100 dark:bg-zinc-900">
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="border border-gray-300 dark:border-zinc-800 px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="border border-gray-300 dark:border-zinc-800 px-4 py-2 text-gray-600 dark:text-gray-400"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
