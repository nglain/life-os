import { useState } from 'react';
import { TreeView } from './TreeView';
import { useTree } from '@/context/TreeContext';
import { useAuthContext } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { CreateNodeModal } from '@/components/modals/CreateNodeModal';

interface SidebarProps {
  onCreateNode?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onCreateNode, isOpen, onClose: _onClose }: SidebarProps) {
  const { loadTree } = useTree();
  const { user, signOut } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);

  const handleRefresh = async () => {
    await loadTree();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Logo size={28} />
          <span className="sidebar-logo-text">
            <span className="logo-life">Life</span>
            <span className="logo-os">OS</span>
          </span>
        </div>
        <div className="sidebar-actions">
          <button className="sidebar-action" onClick={handleRefresh} title="Обновить">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>

      {/* Tree */}
      <div className="sidebar-tree">
        <TreeView
          searchQuery={searchQuery}
          onAddChild={(parentId) => setAddChildParentId(parentId)}
        />
      </div>

      {/* Add theme button */}
      <div className="sidebar-footer">
        <button className="add-theme-btn" onClick={onCreateNode}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          <span>Новая тема</span>
        </button>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-avatar">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="user-email">{user?.email || 'User'}</span>
        </div>
        <button className="logout-btn" onClick={signOut} title="Выйти">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Create child node modal */}
      {addChildParentId && (
        <CreateNodeModal
          isOpen={true}
          onClose={() => setAddChildParentId(null)}
          parentId={addChildParentId}
        />
      )}
    </aside>
  );
}
