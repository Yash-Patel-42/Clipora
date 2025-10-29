
import React from 'react';

const Sidebar = ({ processors, onProcess, processing, selectedProcessor, mediaFile }) => {
    return (
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700">
            <h2 className="text-lg font-semibold text-blue-300 mb-4">Actions</h2>
            <div className="flex flex-col gap-3">
                {processors.map((proc) => (
                    <button
                        key={proc}
                        onClick={() => onProcess(proc)}
                        disabled={processing || !mediaFile}
                        className={`px-4 py-2 rounded-lg font-semibold shadow transition-all duration-200 text-left
                            ${
                                selectedProcessor === proc && processing
                                    ? "bg-blue-700 text-white animate-pulse"
                                    : ""
                            }
                            ${
                                selectedProcessor === proc && !processing
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-blue-300 hover:bg-gray-600"
                            }
                            ${
                                processing || !mediaFile
                                    ? "opacity-60 cursor-not-allowed"
                                    : ""
                            }`}>
                        {processing && selectedProcessor === proc
                            ? "Processing..."
                            : proc
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) =>
                                    c.toUpperCase()
                                )}
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
