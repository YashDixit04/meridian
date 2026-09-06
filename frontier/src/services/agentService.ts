/**
 * Agent Service
 * Handles agent details storage using IndexedDB
 * Follows the pattern of authService
 */

export interface AgentDetails {
  agentName: string;
  agentEmail: string;
  agentPhone: string;
}

const DB_NAME = 'b2b_agent_db';
const STORE_NAME = 'agents';

class AgentService {
  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveAgentDetails(details: AgentDetails): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // We just keep one current agent for now with id='current'
        const request = store.put({ id: 'current', ...details });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving agent details to IndexedDB:', error);
    }
  }

  async getAgentDetails(): Promise<AgentDetails | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('current');
        
        request.onsuccess = () => {
          if (request.result) {
            const { id, ...details } = request.result;
            resolve(details as AgentDetails);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error retrieving agent details from IndexedDB:', error);
      return null;
    }
  }
}

export const agentService = new AgentService();
export default agentService;
