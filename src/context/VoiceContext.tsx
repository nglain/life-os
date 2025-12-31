import { createContext, useContext, useCallback, useState, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { supabase } from '@/utils/supabase';

interface VoiceContextType {
  isConnected: boolean;
  isConnecting: boolean;
  startVoice: (initialContext?: string) => Promise<void>;
  stopVoice: () => Promise<void>;
  sendUpdate: (update: string) => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

interface VoiceProviderProps {
  children: React.ReactNode;
  onMessage?: (message: string) => void;
}

const AGENT_ID = 'agent_6801kasm1g5gf32akf1tgqst2736';
const API_URL = import.meta.env.VITE_LAPP_API_URL || 'http://localhost:3010';

export function VoiceProvider({ children, onMessage }: VoiceProviderProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const conversation = useConversation({
    clientTools: {
      sendMessage: async (parameters: { message?: string }) => {
        console.log('[Voice] ElevenLabs calls sendMessage:', parameters);

        const message = parameters.message;
        if (!message) {
          return 'error (message parameter required)';
        }

        if (onMessageRef.current) {
          onMessageRef.current(message);
        }

        return 'sent';
      },
    },
    onConnect: () => {
      console.log('[Voice] Connected');
      setIsConnecting(false);
    },
    onDisconnect: () => {
      console.log('[Voice] Disconnected');
      setIsConnecting(false);
    },
    onError: (error) => {
      console.error('[Voice] Error:', error);
      setIsConnecting(false);
    },
  });

  const startVoice = useCallback(
    async (initialContext?: string) => {
      try {
        setIsConnecting(true);
        console.log('[Voice] Starting session...');

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('Not authenticated');
        }

        // Get voice token from backend
        const response = await fetch(`${API_URL}/v1/voice/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ agentId: AGENT_ID }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get voice token');
        }

        const data = await response.json();
        console.log('[Voice] Got token, connecting...');

        // Connect to ElevenLabs
        await conversation.startSession({
          agentId: AGENT_ID,
          connectionType: 'webrtc',
        });

        // Send initial context if provided
        if (initialContext) {
          conversation.sendContextualUpdate(initialContext);
        }

        console.log('[Voice] Session started');
      } catch (error) {
        console.error('[Voice] Failed to start:', error);
        setIsConnecting(false);
        throw error;
      }
    },
    [conversation]
  );

  const stopVoice = useCallback(async () => {
    try {
      console.log('[Voice] Stopping session...');
      await conversation.endSession();
      console.log('[Voice] Session stopped');
    } catch (error) {
      console.error('[Voice] Failed to stop:', error);
    }
  }, [conversation]);

  const sendUpdate = useCallback(
    (update: string) => {
      if (conversation.status === 'connected') {
        conversation.sendContextualUpdate(update);
      }
    },
    [conversation]
  );

  return (
    <VoiceContext.Provider
      value={{
        isConnected: conversation.status === 'connected',
        isConnecting,
        startVoice,
        stopVoice,
        sendUpdate,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}
