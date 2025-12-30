import { io, Socket } from 'socket.io-client';
import type { TreeNode, Message } from '@/types/tree';

const SOCKET_URL = import.meta.env.VITE_LIFEOS_API_URL || 'http://94.241.141.177:3011';

let socket: Socket | null = null;

// Initialize socket connection
export function initSocket(): Socket {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: false,
  });

  return socket;
}

// Get socket instance
export function getSocket(): Socket | null {
  return socket;
}

// Connect with auth token
export function connectSocket(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!socket) {
      socket = initSocket();
    }

    socket.connect();

    socket.once('connect', () => {
      console.log('Socket connected, authenticating...');
      socket!.emit('auth', { token });
    });

    socket.once('auth:success', () => {
      console.log('Socket authenticated');
      resolve();
    });

    socket.once('auth:error', (error: { message: string }) => {
      console.error('Socket auth error:', error.message);
      reject(new Error(error.message));
    });

    socket.once('connect_error', (error) => {
      console.error('Socket connect error:', error);
      reject(error);
    });
  });
}

// Disconnect socket
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Socket event emitters
export const socketEmit = {
  // Tree operations
  loadTree: () => socket?.emit('tree:load'),

  createNode: (node: Partial<TreeNode>) => socket?.emit('node:create', { node }),

  updateNode: (nodeId: string, updates: Partial<TreeNode>) =>
    socket?.emit('node:update', { nodeId, updates }),

  deleteNode: (nodeId: string) => socket?.emit('node:delete', { nodeId }),

  selectNode: (nodeId: string) => socket?.emit('node:select', { nodeId }),

  // Messages
  saveMessages: (nodeId: string, messages: Message[]) =>
    socket?.emit('messages:save', { nodeId, messages }),

  // Artifacts
  uploadArtifact: (nodeId: string, fileName: string, fileData: string) =>
    socket?.emit('artifact:upload', { nodeId, fileName, fileData }),
};

// Socket event listeners
export const socketOn = {
  treeLoaded: (callback: (data: { tree: TreeNode[] }) => void) =>
    socket?.on('tree:loaded', callback),

  nodeCreated: (callback: (data: { node: TreeNode }) => void) =>
    socket?.on('node:created', callback),

  nodeUpdated: (callback: (data: { node: TreeNode }) => void) =>
    socket?.on('node:updated', callback),

  nodeDeleted: (callback: (data: { nodeId: string }) => void) =>
    socket?.on('node:deleted', callback),

  nodeSelected: (callback: (data: { node: TreeNode }) => void) =>
    socket?.on('node:selected', callback),

  messagesSaved: (callback: (data: { nodeId: string }) => void) =>
    socket?.on('messages:saved', callback),

  artifactUploaded: (callback: (data: { url: string }) => void) =>
    socket?.on('artifact:uploaded', callback),

  error: (callback: (data: { message: string }) => void) =>
    socket?.on('error', callback),
};

// Remove listeners
export const socketOff = {
  treeLoaded: (callback?: () => void) => socket?.off('tree:loaded', callback),
  nodeCreated: (callback?: () => void) => socket?.off('node:created', callback),
  nodeUpdated: (callback?: () => void) => socket?.off('node:updated', callback),
  nodeDeleted: (callback?: () => void) => socket?.off('node:deleted', callback),
  nodeSelected: (callback?: () => void) => socket?.off('node:selected', callback),
  messagesSaved: (callback?: () => void) => socket?.off('messages:saved', callback),
  error: (callback?: () => void) => socket?.off('error', callback),
};
