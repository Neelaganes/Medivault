import { useState } from 'react';
import { FiX, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const FileViewer = ({ attachments, onClose }) => {
  const [current, setCurrent] = useState(0);
  const file = attachments[current];
  const isImage = file?.contentType?.startsWith('image/');
  
  // Backward compatibility: If the filename is an external URL (Cloudinary), use it directly.
  const isExternalUrl = file?.filename?.startsWith('http');
  const fileUrl = isExternalUrl 
    ? file.filename 
    : `http://localhost:5000/api/upload/${file?.filename}?token=${localStorage.getItem('token')}`;

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(attachments.length - 1, c + 1));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.originalName || file.filename;
    link.click();
  };

  return (
    <div className="file-viewer-overlay" onClick={onClose}>
      <div className="file-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="file-viewer-header">
          <div>
            <div className="file-viewer-title">{file?.originalName}</div>
            <div className="file-viewer-meta">
              {current + 1} of {attachments.length} •{' '}
              {(file?.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <div className="file-viewer-actions">
            <button className="icon-btn" onClick={handleDownload} title="Download">
              <FiDownload />
            </button>
            <button className="icon-btn" onClick={onClose} title="Close">
              <FiX />
            </button>
          </div>
        </div>

        <div className="file-viewer-body">
          {isImage ? (
            <img
              src={fileUrl}
              alt={file.originalName}
              className="file-viewer-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <iframe
              src={fileUrl}
              title={file?.originalName}
              className="file-viewer-iframe"
            />
          )}
        </div>

        {/* Navigation */}
        {attachments.length > 1 && (
          <div className="file-viewer-nav">
            <button className="nav-btn" onClick={prev} disabled={current === 0}>
              <FiChevronLeft /> Prev
            </button>
            <div className="file-viewer-dots">
              {attachments.map((_, i) => (
                <span
                  key={i}
                  className={`dot ${i === current ? 'active' : ''}`}
                  onClick={() => setCurrent(i)}
                />
              ))}
            </div>
            <button className="nav-btn" onClick={next} disabled={current === attachments.length - 1}>
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
