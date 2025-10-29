
import React from 'react';

const TextControls = ({ text, setText, fontSize, setFontSize, fontColor, setFontColor, boxColor, setBoxColor, boxBorder, setBoxBorder, position, setPosition, onApply, processing }) => {
    return (
        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800">
            <h2 className="text-xl font-semibold text-blue-300 mb-4">Text Overlay Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="text-input" className="block text-gray-300 font-medium mb-2">Text:</label>
                    <input id="text-input" type="text" value={text} onChange={(e) => setText(e.target.value)} disabled={processing} className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60" />
                </div>
                <div>
                    <label htmlFor="font-size" className="block text-gray-300 font-medium mb-2">Font Size:</label>
                    <input id="font-size" type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} disabled={processing} className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60" />
                </div>
                <div>
                    <label htmlFor="font-color" className="block text-gray-300 font-medium mb-2">Font Color:</label>
                    <input id="font-color" type="text" value={fontColor} onChange={(e) => setFontColor(e.target.value)} disabled={processing} className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60" />
                </div>
                <div>
                    <label htmlFor="box-color" className="block text-gray-300 font-medium mb-2">Box Color (e.g., black@0.5):</label>
                    <input id="box-color" type="text" value={boxColor} onChange={(e) => setBoxColor(e.target.value)} disabled={processing} className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60" />
                </div>
                <div>
                    <label htmlFor="box-border" className="block text-gray-300 font-medium mb-2">Box Border (px):</label>
                    <input id="box-border" type="number" value={boxBorder} onChange={(e) => setBoxBorder(e.target.value)} disabled={processing} className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60" />
                </div>
                <div>
                    <label htmlFor="position" className="block text-gray-300 font-medium mb-2">Position:</label>
                    <select id="position" value={position} onChange={(e) => setPosition(e.target.value)} disabled={processing} className="block w-full text-sm text-gray-200 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60">
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                        <option value="bottom">Bottom</option>
                    </select>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button onClick={onApply} disabled={processing} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition disabled:opacity-60">
                    {processing ? "Applying..." : "Apply Text"}
                </button>
            </div>
        </div>
    );
};

export default TextControls;
