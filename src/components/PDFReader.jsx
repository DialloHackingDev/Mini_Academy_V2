import { useState, useRef } from 'react';
import { FaDownload, FaExpand, FaCompress, FaChevronLeft, FaChevronRight, FaSearch, FaPlus, FaMinus } from 'react-icons/fa';

export default function PDFReader({ src, title, downloadUrl, className = "" }) {
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showToolbar, setShowToolbar] = useState(true);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  return (
    <div className={`relative bg-white rounded-lg overflow-hidden shadow-lg ${className}`}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Zoom arrière"
              >
                <FaMinus className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Zoom avant"
              >
                <FaPlus className="w-4 h-4" />
              </button>
              <button
                onClick={resetZoom}
                className="px-3 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Zoom normal"
              >
                Reset
              </button>
            </div>

            {/* Title */}
            {title && (
              <div className="text-sm font-medium text-gray-700 truncate max-w-xs">
                {title}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Download */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Télécharger le PDF"
              >
                <FaDownload className="w-4 h-4" />
              </a>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
            </button>

            {/* Hide Toolbar */}
            <button
              onClick={() => setShowToolbar(false)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
              title="Masquer la barre d'outils"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Show Toolbar Button (when hidden) */}
      {!showToolbar && (
        <button
          onClick={() => setShowToolbar(true)}
          className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded shadow-lg transition-all duration-200"
          title="Afficher la barre d'outils"
        >
          <FaChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* PDF Viewer */}
      <div className="relative">
        <iframe
          ref={iframeRef}
          src={src}
          className="w-full h-[600px] border-0"
          title={title || "PDF Document"}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${100 / (zoom / 100)}%`,
            height: `${600 / (zoom / 100)}px`
          }}
        />
      </div>

      {/* Loading State */}
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Chargement du PDF...</p>
        </div>
      </div>
    </div>
  );
}
