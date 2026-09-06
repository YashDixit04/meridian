import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface RoutingManifestResponse {
  pagePaths: Record<string, string>;
  tenantSegments: Record<string, string>;
  accessPages: string[];
  defaultPage: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('routing/manifest')
  getRoutingManifest(): RoutingManifestResponse {
    return {
      pagePaths: {
        dashboard: '/dashboard',
        users: '/tenantlist',
        platformUsers: '/users',
        userDetails: '/profile',
        addAccount: '/users/new',
        addTenant: '/tenant/new',
        tenantDetails: '/tenant/:tenantId',
        offers: '/offers',
        superadminCatalogue: '/superadmin/catalogue',
        help: '/help',
      },
      tenantSegments: {
        tenantSubUsers: 'sub-users',
        tenantVendors: 'vendors',
        tenantVessels: 'vessels',
        tenantOrders: 'orders',
        tenantCatalogue: 'catalogue',
        tenantDocuments: 'documents',
        tenantActivityLogs: 'activity-logs',
        addProduct: 'catalogue/add-product',
        cart: 'cart',
      },
      accessPages: [
        'dashboard',
        'users',
        'platformUsers',
        'offers',
        'superadminCatalogue',
        'help',
        'userDetails',
        'tenantDetails',
        'tenantSubUsers',
        'tenantVendors',
        'tenantVessels',
        'tenantOrders',
        'tenantCatalogue',
        'tenantDocuments',
        'tenantActivityLogs',
        'addAccount',
        'addTenant',
        'addSubUser',
        'addVessel',
        'addVendor',
        'addProduct',
        'cart',
      ],
      defaultPage: 'dashboard',
    };
  }
}
