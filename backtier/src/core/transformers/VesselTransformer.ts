/**
 * Data Transformation Layer Strategy
 *
 * Since the frontend `b2b2/data/*.tsx` files contain React JSX components
 * (like `vesselsColumns` containing `<span>` elements) alongside pure JS arrays
 * (`vesselsTableData`), we cannot directly import them in a production Node.js
 * backend without Babel JSX stripping.
 *
 * The optimal approach for this backend is:
 * 1. Seed/Sync step: An isolated node script (using a tool like `ts-node` or
 *    `esbuild` configured to ignore JSX) extracts ONLY the pure data arrays
 *    (e.g., DASHBOARD_STATS, vesselsTableData).
 * 2. Or, for this backend, we directly copy/translate the shape of those arrays
 *    into pure JSON files within `src/data/json/` to completely decouple from
 *    the frontend UI layer.
 *
 * Here we provide the Transformer functions that assume the pure data objects
 * have been isolated and need mapped to Clean Architecture Entities and DTOs.
 */

// Example: Vessel DTO and Transformer
export interface VesselBackendDTO {
  id: number;
  name: string;
  imo: string;
  type: string;
  captain: string;
  location: string;
  status: 'Active' | 'Docked' | 'In Transit' | 'Maintenance';
  lastInspectionDate: string;
}

export class VesselTransformer {
  /**
   * Transforms raw frontend shape (vesselsTableData) into backend standard DTO
   */
  static toDTO(rawFrontendData: any): VesselBackendDTO {
    return {
      id: rawFrontendData.id,
      name: rawFrontendData.vesselName, // Mapping vesselName -> name
      imo: rawFrontendData.imoNumber, // Mapping imoNumber -> imo
      type: rawFrontendData.vesselType, // Mapping vesselType -> type
      captain: rawFrontendData.captain,
      location: rawFrontendData.location,
      status: rawFrontendData.status,
      lastInspectionDate: rawFrontendData.lastInspection,
    };
  }

  static toDTOList(rawList: any[]): VesselBackendDTO[] {
    return rawList.map((item) => this.toDTO(item));
  }
}
