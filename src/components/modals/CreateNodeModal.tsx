import React, { useState, useEffect } from 'react';
import type { NodeType, TreeNode } from '@/types/tree';
import { useTree } from '@/context/TreeContext';

interface CreateNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
  parentType?: string;
  defaultType?: NodeType;
}

const ICONS = ['💡', '📂', '📝', '📚', '💰', '❤️', '🎯', '🏠', '✈️', '🎨', '🔧', '🌟', '🧠', '📊', '🎓', '💪', '🌱'];

export function CreateNodeModal({ isOpen, onClose, parentId = null, parentType, defaultType }: CreateNodeModalProps) {
  const { createNode, selectNode } = useTree();

  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('💡');
  const [showIcons, setShowIcons] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<NodeType>('theme');

  // Check if we should show type selector
  const isRootLevel = parentType === 'root' || parentId === null;
  const isParentTheme = parentType === 'theme' || (!parentType && parentId !== null);

  // Show type selector: at root (theme/topic), or in theme (subtopic/topic)
  const showRootTypeSelector = isRootLevel && !defaultType;
  const showThemeTypeSelector = isParentTheme && !defaultType && parentId !== null;

  // Determine initial node type
  useEffect(() => {
    if (defaultType) {
      setSelectedType(defaultType);
      setIcon(defaultType === 'subtopic' ? '📂' : defaultType === 'topic' ? '📝' : '💡');
    } else if (isRootLevel) {
      // Root level - default to theme
      setSelectedType('theme');
      setIcon('💡');
    } else if (isParentTheme) {
      // Parent is theme - default to subtopic but user can choose
      setSelectedType('subtopic');
      setIcon('📂');
    } else {
      // Parent is subtopic - only topic allowed
      setSelectedType('topic');
      setIcon('📝');
    }
  }, [parentId, parentType, defaultType, isRootLevel, isParentTheme]);

  // Update icon when type changes
  const handleTypeChange = (type: NodeType) => {
    setSelectedType(type);
    if (type === 'subtopic') setIcon('📂');
    else if (type === 'topic') setIcon('📝');
    else setIcon('💡');
  };

  const handleCreate = async () => {
    if (!label.trim() || isCreating) return;

    setIsCreating(true);

    const now = new Date().toISOString();
    const nodeId = `node-${Date.now()}`;

    const newNode: Partial<TreeNode> = {
      id: nodeId,
      type: selectedType,
      label: label.trim(),
      icon,
      parentId: parentId ?? null,
      dateCreated: now,
      dateModified: now,
    };

    try {
      await createNode(newNode);
      selectNode(nodeId);
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
          <h3 className="modal-title">Создать {typeLabels[selectedType]}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Type selector for root level - theme or topic */}
          {showRootTypeSelector && (
            <div className="modal-field">
              <label className="modal-label">Тип</label>
              <div className="type-selector">
                <button
                  className={`type-option ${selectedType === 'theme' ? 'type-option--selected' : ''}`}
                  onClick={() => handleTypeChange('theme')}
                >
                  💡 Тема
                </button>
                <button
                  className={`type-option ${selectedType === 'topic' ? 'type-option--selected' : ''}`}
                  onClick={() => handleTypeChange('topic')}
                >
                  📝 Топик
                </button>
              </div>
            </div>
          )}

          {/* Type selector for theme - subtopic or topic */}
          {showThemeTypeSelector && (
            <div className="modal-field">
              <label className="modal-label">Тип</label>
              <div className="type-selector">
                <button
                  className={`type-option ${selectedType === 'subtopic' ? 'type-option--selected' : ''}`}
                  onClick={() => handleTypeChange('subtopic')}
                >
                  📂 Подтема
                </button>
                <button
                  className={`type-option ${selectedType === 'topic' ? 'type-option--selected' : ''}`}
                  onClick={() => handleTypeChange('topic')}
                >
                  📝 Топик
                </button>
              </div>
            </div>
          )}

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
              placeholder={`Название ${typeLabels[selectedType]}...`}
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
