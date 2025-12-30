import type { TreeNode, Message, ApiResponse } from '@/types/tree';

const API_BASE = import.meta.env.VITE_LIFEOS_API_URL || 'http://94.241.141.177:3011';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// API methods
export const api = {
  // Get full tree
  async getTree(): Promise<ApiResponse<{ tree: TreeNode[] }>> {
    return request('/api/tree');
  },

  // Get single node with messages
  async getNode(nodeId: string): Promise<ApiResponse<{ node: TreeNode }>> {
    return request(`/api/nodes/${nodeId}`);
  },

  // Create or update node
  async createNode(node: Partial<TreeNode>): Promise<ApiResponse<{ node: TreeNode }>> {
    const { id, ...bodyWithoutId } = node;
    return request(`/api/nodes/${id}`, {
      method: 'POST',
      body: JSON.stringify(bodyWithoutId),
    });
  },

  // Delete node
  async deleteNode(nodeId: string): Promise<ApiResponse<{ deletedCount: number }>> {
    return request(`/api/nodes/${nodeId}`, {
      method: 'DELETE',
    });
  },

  // Move node
  async moveNode(
    nodeId: string,
    newParentId: string | null
  ): Promise<ApiResponse<{ node: TreeNode }>> {
    return request(`/api/nodes/${nodeId}/move`, {
      method: 'PUT',
      body: JSON.stringify({ newParentId }),
    });
  },

  // Save messages
  async saveMessages(
    nodeId: string,
    messages: Message[]
  ): Promise<ApiResponse<void>> {
    return request(`/api/nodes/${nodeId}/messages`, {
      method: 'PUT',
      body: JSON.stringify({ messages }),
    });
  },

  // Health check
  async health(): Promise<ApiResponse<{ status: string }>> {
    return request('/health');
  },
};

export default api;
