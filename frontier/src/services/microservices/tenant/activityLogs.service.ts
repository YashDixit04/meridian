import { apiClient } from '../../../lib/apiClient';
import { ActivityLog } from './types';

class ActivityLogsService {
  async getActivityLogs(tenantId: string): Promise<ActivityLog[]> {
    return apiClient.get<ActivityLog[]>(`/tenants/${tenantId}/activity-logs`);
  }
}

export const activityLogsService = new ActivityLogsService();
export default activityLogsService;
