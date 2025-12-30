import { useState, useEffect } from 'react';
import type { TreeNode } from '@/types/tree';
import { useTree } from '@/context/TreeContext';
import { formatDateTime } from '@/utils/date';

interface SettingsPanelProps {
  node: TreeNode;
}

const ICONS = ['💡', '📚', '💰', '❤️', '🎯', '🏠', '✈️', '🎨', '🔧', '🌟', '🧠', '📊', '🎓', '💪', '🌱'];

export function SettingsPanel({ node }: SettingsPanelProps) {
  const { updateNode, deleteNode } = useTree();

  const [label, setLabel] = useState(node.label);
  const [icon, setIcon] = useState(node.icon);
  const [prompt, setPrompt] = useState(node.prompt || '');
  const [showIcons, setShowIcons] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when node changes
  useEffect(() => {
    setLabel(node.label);
    setIcon(node.icon);
    setPrompt(node.prompt || '');
  }, [node.id]);

  const handleSave = async () => {
    await updateNode(node.id, { label, icon, prompt });
  };

  const handleDelete = async () => {
    await deleteNode(node.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Настройки</h3>
      </div>

      <div className="panel-content settings-content">
        {/* Icon selector */}
        <div className="settings-field">
          <label className="settings-label">Иконка</label>
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

        {/* Label */}
        <div className="settings-field">
          <label className="settings-label">Название</label>
          <input
            type="text"
            className="settings-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        {/* System prompt */}
        <div className="settings-field">
          <label className="settings-label">Системный промпт (для AI)</label>
          <textarea
            className="settings-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Опишите контекст для AI ассистента..."
            rows={4}
          />
        </div>

        {/* Node info */}
        <div className="settings-info">
          <h4 className="settings-info-title">Информация</h4>
          <div className="settings-info-list">
            <p>ID: {node.id}</p>
            <p>Тип: {node.type || 'topic'}</p>
            {node.dateCreated && <p>Создано: {formatDateTime(node.dateCreated)}</p>}
            {node.dateModified && <p>Изменено: {formatDateTime(node.dateModified)}</p>}
            <p>Сообщений: {node.messages?.length || 0}</p>
            <p>Файлов: {node.artifacts?.length || 0}</p>
          </div>
        </div>

        {/* Save button */}
        <button className="settings-save-btn" onClick={handleSave}>
          Сохранить изменения
        </button>

        {/* Delete section */}
        <div className="settings-danger">
          <h4 className="settings-danger-title">Опасная зона</h4>

          {showDeleteConfirm ? (
            <div className="delete-confirm">
              <p className="delete-confirm-text">
                Удалить "{node.label}" и все вложенные элементы?
              </p>
              <div className="delete-confirm-actions">
                <button className="delete-cancel" onClick={() => setShowDeleteConfirm(false)}>
                  Отмена
                </button>
                <button className="delete-confirm-btn" onClick={handleDelete}>
                  Удалить
                </button>
              </div>
            </div>
          ) : (
            <button className="delete-trigger" onClick={() => setShowDeleteConfirm(true)}>
              Удалить этот узел
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
