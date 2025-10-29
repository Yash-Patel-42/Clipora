
import React from 'react';

const VideoPreview = ({ mediaFile, resultUrl, resultMediaType }) => {
    return (
        <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
            {resultUrl ? (
                resultMediaType.startsWith("video") ? (
                    <video src={resultUrl} controls className="max-h-full max-w-full" />
                ) : (
                    <img src={resultUrl} alt="Processed media" className="max-h-full max-w-full" />
                )
            ) : mediaFile ? (
                <video src={mediaFile} controls className="max-h-full max-w-full" />
            ) : (
                <div className="text-gray-500">Upload a video to see a preview</div>
            )}
        </div>
    );
};

export default VideoPreview;
