// import React from 'react';
import type { TreeNode } from '@/types/tree';
import { useTree } from '@/context/TreeContext';
import { formatRelativeDate } from '@/utils/date';

interface TreeRowProps {
  node: TreeNode;
  level: number;
  onAddChild?: (parentId: string) => void;
}

export function TreeRow({ node, level, onAddChild }: TreeRowProps) {
  const { selectedId, expanded, selectNode, toggleExpand } = useTree();

  const isSelected = selectedId === node.id;
  const isExpanded = expanded[node.id] ?? false;
  // Topics cannot have children - they are leaf nodes
  const hasChildren = node.type !== 'topic' && node.children && node.children.length > 0;

  const handleClick = () => {
    // Если уже выбрана - не перевыбираем
    if (isSelected) return;
    selectNode(node.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpand(node.id);
  };

  // Get node type class
  const getTypeClass = () => {
    switch (node.type) {
      case 'theme': return 'tree-row--theme';
      case 'subtopic': return 'tree-row--subtopic';
      case 'topic': return 'tree-row--topic';
      default: return '';
    }
  };

  return (
    <>
      <div
        className={`tree-row ${getTypeClass()} ${isSelected ? 'tree-row--selected' : ''}`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={handleClick}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button className={`tree-arrow ${isExpanded ? 'tree-arrow--expanded' : ''}`} onClick={handleToggle}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="tree-arrow-placeholder" />
        )}

        {/* Icon */}
        <span className="tree-icon">{node.icon}</span>

        {/* Label */}
        <span className="tree-label">{node.label}</span>

        {/* Date badge */}
        {node.dateModified && (
          <span className="tree-date">{formatRelativeDate(node.dateModified)}</span>
        )}

        {/* Actions - show + button on hover for themes and subtopics */}
        {(node.type === 'theme' || node.type === 'subtopic') && onAddChild && (
          <div className="tree-actions">
            <button
              className="tree-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              title="Добавить"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="tree-children">
          {node.children!.map((child) => (
            <TreeRow key={child.id} node={child} level={level + 1} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </>
  );
}
