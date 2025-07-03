let ffmpeg, fetchFile;

async function loadFFmpeg() {
  if (!ffmpeg) {
    const ffmpegModule = await import('@ffmpeg/ffmpeg');
    ffmpeg = ffmpegModule.createFFmpeg({ log: true });
    fetchFile = ffmpegModule.fetchFile;
  }
  return { ffmpeg, fetchFile };
}

export async function processTimeline(timeline, clips) {
  const { ffmpeg, fetchFile } = await loadFFmpeg();
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  let concatList = '';
  for (let i = 0; i < timeline.length; i++) {
    const item = timeline[i];
    const clip = clips.find(c => c.id === item.clipId);
    if (!clip) continue;
    ffmpeg.FS('writeFile', `input${i}.mp4`, await fetchFile(clip.file));
    await ffmpeg.run(
      '-i', `input${i}.mp4`,
      '-ss', `${clip.start || 0}`,
      ...(clip.end ? ['-to', `${clip.end}`] : []),
      '-c', 'copy',
      `trimmed${i}.mp4`
    );
    concatList += `file trimmed${i}.mp4\n`;
  }
  ffmpeg.FS('writeFile', 'concat.txt', concatList);

  await ffmpeg.run(
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
    '-c', 'copy',
    'output.mp4'
  );
  const data = ffmpeg.FS('readFile', 'output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
}