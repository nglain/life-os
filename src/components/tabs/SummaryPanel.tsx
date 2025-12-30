import { useState } from 'react';
import type { TreeNode } from '@/types/tree';
import { useTree } from '@/context/TreeContext';

interface SummaryPanelProps {
  node: TreeNode;
}

export function SummaryPanel({ node }: SummaryPanelProps) {
  const { updateNode } = useTree();
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(node.summary || '');

  const handleSave = async () => {
    await updateNode(node.id, { summary });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSummary(node.summary || '');
    setIsEditing(false);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Итоги</h3>

        {!isEditing ? (
          <button className="panel-action" onClick={() => setIsEditing(true)}>
            Редактировать
          </button>
        ) : (
          <div className="panel-actions">
            <button className="panel-action panel-action--secondary" onClick={handleCancel}>
              Отмена
            </button>
            <button className="panel-action panel-action--primary" onClick={handleSave}>
              Сохранить
            </button>
          </div>
        )}
      </div>

      <div className="panel-content">
        {isEditing ? (
          <textarea
            className="panel-textarea"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Добавьте краткое описание или итоги обсуждения..."
          />
        ) : (
          <>
            {node.summary ? (
              <p className="panel-text">{node.summary}</p>
            ) : (
              <div className="panel-empty">
                <span className="panel-empty-icon">📝</span>
                <p className="panel-empty-text">Нет итогов</p>
                <p className="panel-empty-hint">Нажмите "Редактировать" чтобы добавить</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
