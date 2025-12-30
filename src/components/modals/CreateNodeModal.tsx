import React, { useState } from 'react';
import type { NodeType, TreeNode } from '@/types/tree';
import { useTree } from '@/context/TreeContext';

interface CreateNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
  defaultType?: NodeType;
}

const ICONS = ['💡', '📚', '💰', '❤️', '🎯', '🏠', '✈️', '🎨', '🔧', '🌟', '🧠', '📊', '🎓', '💪', '🌱'];

export function CreateNodeModal({ isOpen, onClose, parentId = null, defaultType }: CreateNodeModalProps) {
  const { createNode, findNode } = useTree();

  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('💡');
  const [showIcons, setShowIcons] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Determine node type based on parent or defaultType
  const getNodeType = (): NodeType => {
    if (defaultType) return defaultType;
    if (!parentId) return 'theme';
    const parent = findNode(parentId);
    if (!parent) return 'theme';
    if (parent.type === 'theme') return 'subtopic';
    return 'topic';
  };

  const nodeType = getNodeType();

  const handleCreate = async () => {
    if (!label.trim() || isCreating) return;

    setIsCreating(true);

    const now = new Date().toISOString();
    const nodeId = `node-${Date.now()}`;

    // Backend expects: type, label, parentId, dateCreated, dateModified (required)
    // ID comes from URL, not body
    const newNode: Partial<TreeNode> = {
      id: nodeId, // Used for URL and local state
      type: nodeType,
      label: label.trim(),
      icon,
      parentId: parentId ?? null, // Must be null for root, not undefined
      dateCreated: now,
      dateModified: now,
    };

    try {
      await createNode(newNode);
      setLabel('');
      setIcon('💡');
      onClose();
    } catch (error) {
      console.error('Failed to create node:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const typeLabels: Record<NodeType, string> = {
    theme: 'тему',
    subtopic: 'подтему',
    topic: 'топик',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Создать {typeLabels[nodeType]}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Icon selector */}
          <div className="modal-field">
            <label className="modal-label">Иконка</label>
            <div className="icon-selector">
              <button className="icon-current" onClick={() => setShowIcons(!showIcons)}>
                {icon}
              </button>
              {showIcons && (
                <div className="icon-picker">
                  {ICONS.map((i) => (
                    <button
                      key={i}
                      className={`icon-option ${icon === i ? 'icon-option--selected' : ''}`}
                      onClick={() => {
                        setIcon(i);
                        setShowIcons(false);
                      }}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Label input */}
          <div className="modal-field">
            <label className="modal-label">Название</label>
            <input
              type="text"
              className="modal-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Название ${typeLabels[nodeType]}...`}
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-btn modal-btn--secondary" onClick={onClose}>
            Отмена
          </button>
          <button
            className="modal-btn modal-btn--primary"
            onClick={handleCreate}
            disabled={!label.trim() || isCreating}
          >
            {isCreating ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
