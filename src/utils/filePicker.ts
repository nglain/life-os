export interface PickedFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

/**
 * Pick a file - always uses web approach for now
 * (Capacitor file picker requires native plugin)
 */
export async function pickFile(): Promise<PickedFile | null> {
  return pickFileWeb();
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
