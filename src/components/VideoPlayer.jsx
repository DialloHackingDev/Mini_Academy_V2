import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaDownload } from 'react-icons/fa';

export default function VideoPlayer({ src, title, downloadUrl, poster, className = "" }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        className="w-full h-full"
        style={{ objectFit: 'cover' }}
        onClick={togglePlay}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      />

      {/* Video Overlay */}
      <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 ${showControls ? 'bg-opacity-20' : ''}`}>
        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-300 transform hover:scale-110"
            >
              <FaPlay className="w-8 h-8 text-gray-800 ml-1" />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              className="w-full h-1 bg-gray-600 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isMuted ? <FaVolumeMute className="w-5 h-5" /> : <FaVolumeUp className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Download */}
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Télécharger la vidéo"
                >
                  <FaDownload className="w-5 h-5" />
                </a>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isFullscreen ? <FaCompress className="w-5 h-5" /> : <FaExpand className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Video Title */}
        {title && (
          <div className="absolute top-4 left-4 right-4">
            <h3 className="text-white text-lg font-semibold bg-black bg-opacity-50 px-3 py-1 rounded">
              {title}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
