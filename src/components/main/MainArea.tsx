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
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [showCreateSubtopic, setShowCreateSubtopic] = useState(false);

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
      {/* Header with node info */}
      <header className="main-header">
        <div className="main-title">
          <h2>
            <span className="main-header-icon">{selectedNode.icon}</span>
            {selectedNode.label}
          </h2>
          {selectedNode.type && (
            <p className="breadcrumb">{selectedNode.type}</p>
          )}
        </div>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          title="Настройки"
        >
          ⚙️
        </button>
      </header>

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
        onCreateTopic={() => setShowCreateTopic(true)}
        onCreateSubtopic={() => setShowCreateSubtopic(true)}
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

      {/* Create topic modal */}
      {showCreateTopic && (
        <CreateNodeModal
          isOpen={showCreateTopic}
          onClose={() => setShowCreateTopic(false)}
          parentId={selectedNode.id}
          defaultType="topic"
        />
      )}

      {/* Create subtopic modal */}
      {showCreateSubtopic && (
        <CreateNodeModal
          isOpen={showCreateSubtopic}
          onClose={() => setShowCreateSubtopic(false)}
          parentId={selectedNode.id}
          defaultType="subtopic"
        />
      )}
    </main>
  );
}
