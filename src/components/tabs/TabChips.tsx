// import React from 'react';
import type { TreeNode } from '@/types/tree';

export type TabId = 'artifacts' | 'subtopics' | 'topics' | 'summaries' | null;

interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
  count: number;
}

interface TabChipsProps {
  node: TreeNode;
  activePanel: TabId;
  onPanelChange: (panel: TabId) => void;
}

export function TabChips({ node, activePanel, onPanelChange }: TabChipsProps) {
  // Collect data from node and its children
  const artifacts: { name: string; source: string; date: string }[] = [];
  const summaries: { label: string; summary: string; date: string; id: string }[] = [];

  // Separate children by their actual type
  const subtopics = node.children?.filter(c => c.type === 'subtopic') || [];
  const topics = node.children?.filter(c => c.type === 'topic') || [];

  // Collect artifacts and summaries recursively
  const collect = (items: TreeNode[]) => {
    items.forEach(item => {
      if (item.hasArtifacts) {
        // For now just mark that artifacts exist
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

  // Determine which tabs to show
  const tabs: TabConfig[] = [];

  if (artifacts.length > 0) {
    tabs.push({ id: 'artifacts', label: 'Артефакты', icon: '📄', count: artifacts.length });
  }

  // Show subtopics tab if node has subtopics
  if (subtopics.length > 0) {
    tabs.push({ id: 'subtopics', label: 'Подтемы', icon: '📂', count: subtopics.length });
  }

  // Show topics tab only if there are topics
  if (topics.length > 0) {
    tabs.push({ id: 'topics', label: 'Топики', icon: '💬', count: topics.length });
  }

  if (summaries.length > 0) {
    tabs.push({ id: 'summaries', label: 'Саммари', icon: '📋', count: summaries.length });
  }

  if (tabs.length === 0) return null;

  const handleClick = (tabId: TabId) => {
    onPanelChange(activePanel === tabId ? null : tabId);
  };

  return (
    <div className="tabs-row">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleClick(tab.id)}
          className={`tab-chip ${activePanel === tab.id ? 'active' : ''}`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.count > 0 && <span className="count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
