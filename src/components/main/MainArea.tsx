import { useState } from 'react';
import { useTree } from '@/context/TreeContext';
import { TabChips, type TabId } from '@/components/tabs/TabChips';
import { TabPanel } from '@/components/tabs/TabPanel';
import { ChatArea } from '@/components/chat/ChatArea';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { CreateNodeModal } from '@/components/modals/CreateNodeModal';

export function MainArea() {
  const { getSelectedNode, selectNode } = useTree();
  const [activePanel, setActivePanel] = useState<TabId>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateChild, setShowCreateChild] = useState(false);

  const selectedNode = getSelectedNode();

  if (!selectedNode) {
    return (
      <main className="main-area">
        <div className="main-empty">
          <span className="main-empty-icon">🧠</span>
          <h2 className="main-empty-title">Life OS</h2>
          <p className="main-empty-text">Выберите тему в боковой панели</p>
          <p className="main-empty-hint">или создайте новую</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-area">
      {/* Contextual tabs */}
      <TabChips
        node={selectedNode}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />

      {/* Tab panel content (when tab is active) */}
      <TabPanel
        node={selectedNode}
        activePanel={activePanel}
        onSelectNode={selectNode}
        onCreateChild={() => setShowCreateChild(true)}
      />

      {/* Chat area - always visible */}
      <div className="main-content">
        <ChatArea node={selectedNode} />
      </div>

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          node={selectedNode}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Create child node modal */}
      {showCreateChild && (
        <CreateNodeModal
          isOpen={showCreateChild}
          onClose={() => setShowCreateChild(false)}
          parentId={selectedNode.id}
          parentType={selectedNode.type || 'theme'}
        />
      )}
    </main>
  );
}
