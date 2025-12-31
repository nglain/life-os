import React, { useState, useRef, useEffect } from 'react';
import { pickFile, PickedFile } from '@/utils/filePicker';

interface ChatInputProps {
  onSend: (text: string) => void;
  onVoice?: () => void;
  onFileSelect?: (file: PickedFile) => void;
  disabled?: boolean;
  placeholder?: string;
  isVoiceActive?: boolean;
  isVoiceConnecting?: boolean;
}

export function ChatInput({
  onSend,
  onVoice,
  onFileSelect,
  disabled = false,
  placeholder = 'Напишите сообщение...',
  isVoiceActive = false,
  isVoiceConnecting = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [isPickingFile, setIsPickingFile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFilePick = async () => {
    if (isPickingFile) return;

    console.log('[File] Opening file picker...');
    setIsPickingFile(true);

    try {
      const file = await pickFile();
      if (file) {
        console.log('[File] File picked:', file.name, file.type, file.size);
        if (onFileSelect) {
          onFileSelect(file);
        }
      } else {
        console.log('[File] No file selected');
      }
    } catch (error) {
      console.error('[File] Error picking file:', error);
    } finally {
      setIsPickingFile(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        {/* File picker button */}
        <button
          type="button"
          className={`chat-input-btn ${isPickingFile ? 'opacity-50' : ''}`}
          onClick={handleFilePick}
          disabled={isPickingFile || disabled}
          title="Прикрепить файл"
        >
          {isPickingFile ? (
            <div className="voice-spinner" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </button>

        {/* Input area */}
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />

        {/* Voice button */}
        {onVoice && (
          <button
            type="button"
            className={`chat-input-btn ${isVoiceActive ? 'voice-active' : ''} ${isVoiceConnecting ? 'voice-connecting' : ''}`}
            onClick={onVoice}
            title={isVoiceActive ? 'Остановить голос' : 'Голосовой режим'}
            disabled={isVoiceConnecting}
          >
            {isVoiceConnecting ? (
              <div className="voice-spinner" />
            ) : isVoiceActive ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        )}

        {/* Send button */}
        <button
          type="button"
          className="chat-send-btn"
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
