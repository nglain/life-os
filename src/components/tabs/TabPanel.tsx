// import React from 'react';
import type { TreeNode } from '@/types/tree';
import type { TabId } from './TabChips';

interface TabPanelProps {
  node: TreeNode;
  activePanel: TabId;
  onSelectNode: (nodeId: string) => void;
  onCreateTopic: () => void;
  onCreateSubtopic: () => void;
}

export function TabPanel({ node, activePanel, onSelectNode, onCreateTopic, onCreateSubtopic }: TabPanelProps) {
  if (!activePanel) return null;

  // Collect data
  const artifacts: { name: string; source: string; date: string }[] = [];
  const summaries: { label: string; summary: string; date: string; id: string }[] = [];
  const subtopics = node.children?.filter(c => c.children && c.children.length > 0) || [];
  const topics = node.children?.filter(c => !c.children || c.children.length === 0) || [];

  const collect = (items: TreeNode[]) => {
    items.forEach(item => {
      if (item.hasArtifacts) {
        artifacts.push({ name: item.label, source: item.label, date: item.dateModified || '' });
      }
      if (item.summary) {
        summaries.push({
          label: item.label,
          summary: item.summary,
          date: item.dateModified || '',
          id: item.id
        });
      }
      if (item.children) collect(item.children);
    });
  };

  if (node.children) collect(node.children);

  // Sort by date
  const sortByDate = (a: { date?: string }, b: { date?: string }) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  };

  return (
    <div className="tab-panel">
      <div className="tab-panel-grid">
        {/* Artifacts */}
        {activePanel === 'artifacts' && artifacts.map((art, i) => (
          <div key={i} className="tab-panel-item">
            <span>📄</span>
            <span>{art.name}</span>
            <span className="date">{art.date}</span>
          </div>
        ))}

        {/* Subtopics */}
        {activePanel === 'subtopics' && (
          <>
            {node.type === 'theme' && (
              <div className="tab-panel-item add" onClick={onCreateSubtopic}>
                + Подтема
              </div>
            )}
            {subtopics.map(child => (
              <div
                key={child.id}
                className="tab-panel-item"
                onClick={() => onSelectNode(child.id)}
              >
                <span>{child.icon}</span>
                <span>{child.label}</span>
                {child.children && child.children.length > 0 && (
                  <span className="count">{child.children.length}</span>
                )}
              </div>
            ))}
          </>
        )}

        {/* Topics */}
        {activePanel === 'topics' && (
          <>
            {node.type !== 'topic' && (
              <div className="tab-panel-item add" onClick={onCreateTopic}>
                + Топик
              </div>
            )}
            {topics.sort((a, b) => sortByDate(
              { date: a.dateModified },
              { date: b.dateModified }
            )).map(child => (
              <div
                key={child.id}
                className="tab-panel-item"
                onClick={() => onSelectNode(child.id)}
              >
                <span>{child.icon || '📝'}</span>
                <span>{child.label}</span>
                <span className="date">{child.dateModified}</span>
              </div>
            ))}
          </>
        )}

        {/* Summaries */}
        {activePanel === 'summaries' && summaries.map((s, i) => (
          <div
            key={i}
            className="tab-panel-item summary-item"
            onClick={() => onSelectNode(s.id)}
          >
            <div className="summary-header">
              <span>📋</span>
              <span>{s.label}</span>
              <span className="date">{s.date}</span>
            </div>
            <div className="summary-text">{s.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
