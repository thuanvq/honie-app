import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    on: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  },
  getApiRoot: async () => {
    try {
      const env = await ipcRenderer.invoke('get-api-root');
      return env;
    } catch (error) {
      console.error('Failed to get api root variables:', error);
    }
  },
});
