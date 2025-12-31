import { Capacitor } from '@capacitor/core';

export interface PickedFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

/**
 * Pick a file using native picker on iOS/Android or HTML input on web
 */
export async function pickFile(): Promise<PickedFile | null> {
  if (Capacitor.isNativePlatform()) {
    return pickFileNative();
  } else {
    return pickFileWeb();
  }
}

/**
 * Native file picker using Capacitor plugin
 */
async function pickFileNative(): Promise<PickedFile | null> {
  try {
    // Dynamic import to avoid issues on web
    const { FilePicker } = await import('@capawesome/capacitor-file-picker');

    const result = await FilePicker.pickFiles({
      multiple: false,
      readData: true,
    });

    if (!result.files || result.files.length === 0) {
      return null;
    }

    const file = result.files[0];
    console.log('[FilePicker] Native file picked:', file.name);

    return {
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
      size: file.size || 0,
      data: file.data || '',
    };
  } catch (error) {
    console.error('[FilePicker] Native picker error:', error);
    // Fall back to web picker if native fails
    return pickFileWeb();
  }
}

/**
 * Web file picker using HTML input
 */
function pickFileWeb(): Promise<PickedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      console.log('[FilePicker] Web file picked:', file.name);

      // Read as base64
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remove data:...;base64, prefix

        resolve({
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          data: base64,
        });
      };
      reader.onerror = () => {
        console.error('[FilePicker] Error reading file');
        resolve(null);
      };
      reader.readAsDataURL(file);
    };

    input.oncancel = () => {
      resolve(null);
    };

    // Trigger file picker
    input.click();
  });
}
