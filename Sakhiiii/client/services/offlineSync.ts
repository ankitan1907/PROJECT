// Offline Sync Service for SafeGuard App
interface OfflineData {
  reports: any[];
  lastSync: Date;
  pendingActions: any[];
}

class OfflineSync {
  private dbName = 'safeguard-offline';
  private version = 1;
  
  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('actions')) {
          db.createObjectStore('actions', { keyPath: 'id' });
        }
      };
    });
  }
  
  async saveOfflineReport(report: any): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['reports'], 'readwrite');
    const store = transaction.objectStore('reports');
    
    const offlineReport = {
      ...report,
      id: `offline_${Date.now()}`,
      offline: true,
      createdAt: new Date(),
    };
    
    store.add(offlineReport);
  }
  
  async getOfflineReports(): Promise<any[]> {
    const db = await this.initDB();
    const transaction = db.transaction(['reports'], 'readonly');
    const store = transaction.objectStore('reports');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async syncToServer(): Promise<void> {
    if (!navigator.onLine) return;
    
    const offlineReports = await this.getOfflineReports();
    
    for (const report of offlineReports) {
      try {
        // Simulate API call
        console.log('Syncing report to server:', report);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove from offline storage after successful sync
        await this.removeOfflineReport(report.id);
      } catch (error) {
        console.error('Failed to sync report:', error);
      }
    }
  }
  
  private async removeOfflineReport(id: string): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['reports'], 'readwrite');
    const store = transaction.objectStore('reports');
    store.delete(id);
  }
  
  // Auto-sync when online
  startAutoSync(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored, syncing data...');
      this.syncToServer();
    });
    
    // Periodic sync every 5 minutes when online
    setInterval(() => {
      if (navigator.onLine) {
        this.syncToServer();
      }
    }, 5 * 60 * 1000);
  }
}

export const offlineSync = new OfflineSync();

// Initialize offline sync
offlineSync.startAutoSync();
