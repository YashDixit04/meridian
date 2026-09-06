export interface DashboardStatDTO {
  id: string;
  label: string;
  value: string;
  trendAmount: string | null;
  isUpwardTrend: boolean | null;
}

export class SmcTransformer {
  /**
   * Extracts ONLY API numerical/data values from `dashboard_stats.tsx`
   * Ignores UI data like: icon='Crown', color='primary'
   */
  static toStatsDTO(rawFrontendData: any): DashboardStatDTO {
    return {
      id: rawFrontendData.id,
      label: rawFrontendData.label,
      value: rawFrontendData.value,
      trendAmount: rawFrontendData.trend || null,
      isUpwardTrend: rawFrontendData.trendUp ?? null,
    };
  }

  static toStatsDTOList(rawList: any[]): DashboardStatDTO[] {
    return rawList.map((item) => this.toStatsDTO(item));
  }
}
