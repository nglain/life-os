import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { MainArea } from '@/components/main/MainArea';
import { CreateNodeModal } from '@/components/modals/CreateNodeModal';
import { useTree } from '@/context/TreeContext';
import { Logo } from '@/components/Logo';

export function HomePage() {
  const { loadTree, selectedId } = useTree();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
        <div className="mobile-header-logo">
          <Logo size={24} />
          <span className="mobile-header-title">
            <span className="logo-life">Life</span>
            <span className="logo-os">OS</span>
          </span>
        </div>
        <button className="mobile-add-btn" onClick={() => setShowCreateModal(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </header>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar
        onCreateNode={() => setShowCreateModal(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <MainArea />

      <CreateNodeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
