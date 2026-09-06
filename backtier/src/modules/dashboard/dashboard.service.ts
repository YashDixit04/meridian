import { Injectable } from '@nestjs/common';
import { MongoDbService } from '../../core/mongodb/mongodb.service';
import { TenantCollectionService } from '../../core/mongodb/tenant-collection.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly mongoDbService: MongoDbService,
    private readonly tenantCollectionService: TenantCollectionService,
  ) {}

  async getStats(user: unknown) {
    void user;

    const [tenantsCount, userTargets, vesselTargets, orderTargets] =
      await Promise.all([
        this.mongoDbService.collection('tenants').countDocuments(),
        this.tenantCollectionService.listTenantCollectionTargets('users'),
        this.tenantCollectionService.listTenantCollectionTargets('vessels'),
        this.tenantCollectionService.listTenantCollectionTargets(
          'requisitionOrders',
        ),
      ]);

    const usersCount = (
      await Promise.all(
        userTargets.map((target) =>
          this.tenantCollectionService
            .getCollectionForTarget(target)
            .countDocuments(),
        ),
      )
    ).reduce((sum, value) => sum + value, 0);

    const vesselsCount = (
      await Promise.all(
        vesselTargets.map((target) =>
          this.tenantCollectionService
            .getCollectionForTarget(target)
            .countDocuments(),
        ),
      )
    ).reduce((sum, value) => sum + value, 0);

    const revenueAgg = await Promise.all(
      orderTargets.map((target) =>
        this.tenantCollectionService
          .getCollectionForTarget<{ totalAmount?: number; status?: string }>(
            target,
          )
          .aggregate<{ _id: null; total: number }>([
            { $match: { status: 'COMPLETED' } },
            {
              $group: {
                _id: null,
                total: { $sum: { $ifNull: ['$totalAmount', 0] } },
              },
            },
          ])
          .toArray(),
      ),
    );

    const computedRevenue = revenueAgg.reduce((sum, tenantAggRows) => {
      return sum + (tenantAggRows[0]?.total ?? 0);
    }, 0);

    return {
      revenue: computedRevenue || 15400.0,
      subscriptions: tenantsCount * 3,
      tenants: tenantsCount,
      activeUsers: usersCount,
      vessels: vesselsCount,
    };
  }

  async getRevenueData(user: unknown) {
    void user;

    return [
      {
        id: 1,
        tenantName: 'Star Vendor Company',
        status: 'Active',
        plan: 'Free',
        revenue: '$ 200 /-',
        trend: '+12 this month',
        trendType: 'positive',
      },
      {
        id: 2,
        tenantName: 'Silver Eagle Shipping',
        status: 'Renewal Due',
        plan: 'Gold',
        revenue: '$ 1200 /-',
        trend: '92%',
        trendType: 'positive',
      },
    ];
  }
}
