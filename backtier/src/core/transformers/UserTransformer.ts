export interface UserBackendDTO {
  id: string | number;
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastActiveAt?: string;
}

export class UserTransformer {
  /**
   * Transforms raw frontend shape (usersdata.tsx / users.json) into backend standard DTO
   */
  static toDTO(rawFrontendData: any): UserBackendDTO {
    return {
      id: rawFrontendData.id || rawFrontendData.userId,
      fullName: rawFrontendData.name || rawFrontendData.fullName || '',
      email: rawFrontendData.email || '',
      role: rawFrontendData.role || rawFrontendData.userType || 'User',
      department: rawFrontendData.department || 'General',
      status: rawFrontendData.status || 'Active',
      lastActiveAt:
        rawFrontendData.lastLogin || rawFrontendData.lastActiveDate || null,
    };
  }

  static toDTOList(rawList: any[]): UserBackendDTO[] {
    return rawList.map((item) => this.toDTO(item));
  }
}
