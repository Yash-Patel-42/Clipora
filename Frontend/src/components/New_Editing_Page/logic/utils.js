// Utility function to extract thumbnails from a video file
export const extractThumbnails = (file, duration, count = 20) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.src = URL.createObjectURL(file);
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.currentTime = 0;
    const canvas = document.createElement('canvas');
    const thumbnails = [];
    let loaded = false;
    video.addEventListener('loadeddata', async () => {
      if (loaded) return;
      loaded = true;
      const interval = duration / count;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      for (let i = 0; i < count; i++) {
        video.currentTime = Math.min(duration, i * interval);
        await new Promise(res => {
          video.onseeked = () => {
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            thumbnails.push(canvas.toDataURL('image/jpeg', 0.6));
            res();
          };
        });
      }
      resolve(thumbnails);
    });
  });
}; 