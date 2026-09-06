import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import tenantService from '@/services/tenantService';
import { ApiException } from '@/lib/apiClient';
import type { TenantCatalog, TenantVendor, ExternalVendor } from '@/services/microservices/tenant';

import {
  DEFAULT_PORT_OPTIONS,
  resolveTenantCatalogueMode,
  type TenantCatalogueMode,
} from '../addProduct.utils';

export interface VendorOption {
  value: string;
  label: string;
  isExternal?: boolean;
  vendorTenantId?: string;
  isDisabled?: boolean;
}

interface UseTenantCatalogueContextResult {
  tenantCatalogueMode: TenantCatalogueMode;
  tenantVendors: TenantVendor[];
  tenantCatalogs: TenantCatalog[];
  setTenantCatalogs: Dispatch<SetStateAction<TenantCatalog[]>>;
  portOptions: string[];
  isContextLoading: boolean;
  contextMessage: string;
  vendorOptions: VendorOption[];
  externalVendors: ExternalVendor[];
  canViewOtherTenantVendors: boolean;
}

export const useTenantCatalogueContext = (
  tenantId: string,
): UseTenantCatalogueContextResult => {
  const [tenantCatalogueMode, setTenantCatalogueMode] = useState<TenantCatalogueMode>('unknown');
  const [tenantVendors, setTenantVendors] = useState<TenantVendor[]>([]);
  const [tenantCatalogs, setTenantCatalogs] = useState<TenantCatalog[]>([]);
  const [portOptions, setPortOptions] = useState<string[]>(DEFAULT_PORT_OPTIONS);
  const [isContextLoading, setIsContextLoading] = useState<boolean>(true);
  const [contextMessage, setContextMessage] = useState<string>('');
  const [externalVendors, setExternalVendors] = useState<ExternalVendor[]>([]);
  const [canViewOtherTenantVendors, setCanViewOtherTenantVendors] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const loadTenantContext = async () => {
      if (!tenantId) {
        setContextMessage('Tenant context is missing. Open Add Product from a tenant catalogue page.');
        setIsContextLoading(false);
        return;
      }

      setIsContextLoading(true);
      setContextMessage('');

      try {
        const tenantDetails = await tenantService.getTenantDetails(tenantId);
        
        const canViewOther = tenantDetails?.tenantInformation?.canViewOtherTenantVendors || tenantDetails?.canViewOtherTenantVendors || false;
        
        const promises: [Promise<TenantVendor[]>, Promise<TenantCatalog[]>, Promise<ExternalVendor[]>?] = [
          tenantService.getVendors(tenantId),
          tenantService.getCatalogs(tenantId),
        ];

        if (canViewOther) {
          promises.push(tenantService.getCrossTenantVendors(tenantId));
        }

        const [vendors, catalogs, crossVendors] = await Promise.all(promises);

        if (!mounted) {
          return;
        }

        const mode = resolveTenantCatalogueMode(
          tenantDetails?.userConfigurations?.userTypeSelection,
        );

        setTenantCatalogueMode(mode);
        setTenantVendors(Array.isArray(vendors) ? vendors : []);
        setTenantCatalogs(Array.isArray(catalogs) ? catalogs : []);
        setCanViewOtherTenantVendors(canViewOther);
        setExternalVendors(Array.isArray(crossVendors) ? crossVendors : []);

        const discoveredPorts = Array.from(
          new Set(
            (Array.isArray(vendors) ? vendors : []).flatMap((vendor) =>
              Array.isArray(vendor.coverage?.portsServed) ? vendor.coverage.portsServed : [],
            ),
          ),
        ).filter((port): port is string => typeof port === 'string' && port.trim().length > 0);

        setPortOptions(discoveredPorts.length > 0 ? discoveredPorts : DEFAULT_PORT_OPTIONS);
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (error instanceof ApiException && error.statusCode === 404) {
          setContextMessage('Selected tenant was not found. Open Add Product from a valid tenant details page.');
        } else {
          setContextMessage('Unable to load tenant catalogue context. Product publish is unavailable right now.');
        }
      } finally {
        if (mounted) {
          setIsContextLoading(false);
        }
      }
    };

    void loadTenantContext();

    return () => {
      mounted = false;
    };
  }, [tenantId]);

  const vendorOptions = useMemo(
    () => {
      const ownOptions = tenantVendors
        .map((vendor) => ({
          value: vendor.id,
          label: vendor.basicInfo.companyName?.trim() || vendor.basicInfo.legalName?.trim() || vendor.id,
          isExternal: false,
        }))
        .filter((option) => option.label.length > 0);

      if (!canViewOtherTenantVendors || externalVendors.length === 0) {
        return ownOptions;
      }

      const externalOptions = externalVendors
        .map((vendor) => ({
          value: vendor.id,
          label: `${vendor.basicInfo.companyName?.trim() || vendor.id} (External — Tenant: ${vendor.vendorTenantName})`,
          isExternal: true,
          vendorTenantId: vendor.vendorTenantId,
        }))
        .filter((option) => option.label.length > 0);

      if (ownOptions.length > 0) {
        return [
          ...ownOptions,
          { value: 'divider', label: '── External Vendors ──', isDisabled: true },
          ...externalOptions,
        ];
      }
      return externalOptions;
    },
    [tenantVendors, externalVendors, canViewOtherTenantVendors],
  );

  return {
    tenantCatalogueMode,
    tenantVendors,
    tenantCatalogs,
    setTenantCatalogs,
    portOptions,
    isContextLoading,
    contextMessage,
    vendorOptions,
    externalVendors,
    canViewOtherTenantVendors,
  };
};
