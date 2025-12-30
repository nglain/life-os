// import React from 'react';
import type { TreeNode, Artifact } from '@/types/tree';

interface ArtifactsPanelProps {
  node: TreeNode;
}

export function ArtifactsPanel({ node }: ArtifactsPanelProps) {
  const artifacts = node.artifacts || [];

  const handleUpload = () => {
    // TODO: Implement file upload
    console.log('File upload not yet implemented');
  };

  const handleDownload = (artifact: Artifact) => {
    if (artifact.url) {
      window.open(artifact.url, '_blank');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📽️';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return '🖼️';
      case 'mp3':
      case 'wav':
      case 'ogg': return '🎵';
      case 'mp4':
      case 'mov':
      case 'avi': return '🎬';
      case 'zip':
      case 'rar':
      case '7z': return '📦';
      default: return '📎';
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Файлы</h3>
        <button className="panel-action panel-action--primary" onClick={handleUpload}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          <span>Загрузить</span>
        </button>
      </div>

      <div className="panel-content">
        {artifacts.length === 0 ? (
          <div className="panel-empty">
            <span className="panel-empty-icon">📎</span>
            <p className="panel-empty-text">Нет файлов</p>
            <p className="panel-empty-hint">Загрузите файлы для этой темы</p>
          </div>
        ) : (
          <div className="artifacts-list">
            {artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="artifact-item"
                onClick={() => handleDownload(artifact)}
              >
                <span className="artifact-icon">{getFileIcon(artifact.name)}</span>
                <div className="artifact-info">
                  <p className="artifact-name">{artifact.name}</p>
                  {artifact.size && (
                    <p className="artifact-size">{formatFileSize(artifact.size)}</p>
                  )}
                </div>
                <button
                  className="artifact-download"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(artifact);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
