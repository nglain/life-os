import { useState } from 'react';
import type { TreeNode } from '@/types/tree';

interface SettingsModalProps {
  node: TreeNode;
  onClose: () => void;
}

export function SettingsModal({ node, onClose }: SettingsModalProps) {
  const [globalPrompt, setGlobalPrompt] = useState(
    'Ты — персональный ИИ-помощник. Отвечай кратко и по делу. Помни контекст предыдущих разговоров.'
  );
  const [nodePrompt, setNodePrompt] = useState(node.hasPrompt ? '' : '');

  const handleSave = async () => {
    // TODO: Save prompts to backend
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚙️ Настройки инструкций</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="settings-section">
            <div className="settings-title">Общая инструкция</div>
            <textarea
              className="settings-textarea"
              value={globalPrompt}
              onChange={e => setGlobalPrompt(e.target.value)}
              placeholder="Опиши как ИИ должен себя вести..."
            />
          </div>

          <div className="settings-section">
            <div className="settings-title">
              {node.icon} {node.label}
            </div>
            <textarea
              className="settings-textarea"
              value={nodePrompt}
              onChange={e => setNodePrompt(e.target.value)}
              placeholder={`Инструкция для "${node.label}"...`}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--primary" onClick={handleSave}>
            💾 Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
