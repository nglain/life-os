import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MainArea } from '@/components/main/MainArea';
import { CreateNodeModal } from '@/components/modals/CreateNodeModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { useTree } from '@/context/TreeContext';
import { Logo } from '@/components/Logo';

export function HomePage() {
  const { loadTree, selectedId, getSelectedNode } = useTree();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedNode = getSelectedNode();

  // Load tree on mount
  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Close sidebar when node is selected on mobile
  useEffect(() => {
    if (selectedId && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [selectedId]);

  return (
    <div className="app">
      {/* Unified header */}
      <header className="app-header">
        <button className="header-logo-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Logo size={22} />
        </button>
        {selectedNode && (
          <div className="header-node-info">
            <span className="header-node-icon">{selectedNode.icon}</span>
            <span className="header-node-label">{selectedNode.label}</span>
          </div>
        )}
        <div className="header-actions">
          {/* Add button - only for themes and subtopics (not for "Общая тема" or topics) */}
          {selectedNode && selectedNode.type !== 'topic' && selectedNode.id !== 'default-theme' && (
            <button className="header-action-btn" onClick={() => setShowCreateModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          {/* Settings button */}
          {selectedNode && (
            <button className="header-action-btn" onClick={() => setShowSettings(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <MainArea />

      <CreateNodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        parentId={selectedNode?.id}
        parentType={selectedNode?.type || 'theme'}
      />

      {showSettings && selectedNode && (
        <SettingsModal
          node={selectedNode}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
