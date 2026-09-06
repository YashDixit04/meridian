import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Switch from '../components/ui/Switch';
import {
  Heading2,
  BodyBase,
  Heading3,
  Display2,
  BodySm,
  LabelSm,
  Heading6
} from '../components/ui/Typography';
import { Check, Minus, Plus } from 'lucide-react';
import { PricingPlan, pricingPlans } from '@/data/offeringdata';
import PageLayout from '@/components/layout/PageLayout';
import { useNavigate } from 'react-router-dom';
import { resolveNavigationTarget } from '@/lib/appRouting';
import { authService } from '@/services/authService';

const Offers: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getSession();
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans] = useState<PricingPlan[]>(pricingPlans);

  const routeContext = {
    sessionTenantId: session?.tenantId,
    currentTenantId: session?.tenantId,
  };

  const homePath = resolveNavigationTarget('dashboard', routeContext);
  const offersPath = resolveNavigationTarget('offers', routeContext);

  const breadcrumbItems = [
    {
      label: 'Home',
      href: homePath,
      onClick: () => navigate(homePath),
    },
    {
      label: 'Offers',
      href: offersPath,
      active: true,
    }
  ];

  const actions = (
    <div className="flex items-center gap-4">
      <LabelSm className={`transition-colors ${!isAnnual ? 'text-grey-900 dark:text-white font-semibold' : 'text-grey-500'}`}>
        Monthly pricing
      </LabelSm>
      <Switch
        checked={isAnnual}
        onChange={setIsAnnual}
      />
      <LabelSm className={`transition-colors ${isAnnual ? 'text-grey-900 dark:text-white font-semibold' : 'text-grey-500'}`}>
        Annual pricing
      </LabelSm>
    </div>
  );

  return (
    <PageLayout breadcrumbItems={breadcrumbItems} actions={actions}>
      <div className="flex-1 flex flex-col py-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        {/* Header & Toggle Container */}
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between w-full mb-12 gap-6">
          {/* Header Section (Left) */}
          <div className="text-left max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Heading2 className="text-grey-900 dark:text-white">Pricing Options</Heading2>
              <Badge variant="soft" color="warning" className="rounded-full">
                Free for 30 days
              </Badge>
            </div>
            <BodyBase className="text-grey-600 mb-2">
              Get the power, control, and customization you need to manage your
              team's and organization's projects.
            </BodyBase>
          </div>


        </div>

        {/* Pricing Cards */}
        <div className="flex gap-8 w-full overflow-x-auto py-12 px-4 snap-x items-stretch [&::-webkit-scrollbar]:hidden">
          {plans.map((plan) => {
            // Adjust price for annual if needed (mock logic)
            const displayPrice = isAnnual && plan.price !== 'Free'
              ? `$${(parseFloat(plan.price.replace('$', '')) * 0.8).toFixed(2)}`
              : plan.price;

            return (
              <div
                key={plan.id}
                className={`
                  min-w-[320px] flex-shrink-0 relative flex flex-col p-8 rounded-2xl transition-all duration-300 h-full snap-center
                  ${plan.highlighted
                    ? 'bg-primary-soft dark:bg-light-soft shadow-xl shadow-primary/10 border border-primary scale-105 z-10'
                    : 'bg-white dark:bg-grey-50 border border-grey-200 hover:border-primary/30'
                  }
                `}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="solid" color="warning" className="rounded-full px-4 py-1 shadow-sm font-medium">
                      Best value
                    </Badge>
                  </div>
                )}

                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className={`p-4 rounded-2xl ${plan.highlighted ? 'bg-warning-soft/30' : 'bg-primary-soft/30'}`}>
                    {plan.icon}
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-2">
                  <Heading3 className="text-grey-900 dark:text-grey-900 mb-1">{plan.title}</Heading3>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <Display2 className="text-grey-900 dark:text-grey-900">
                      {displayPrice}
                    </Display2>
                    {plan.period && (
                      <span className="text-grey-500 text-sm font-medium">{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="flex-shrink-0 text-success">
                          <Check size={18} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 text-grey-300 dark:text-grey-600">
                          <Minus size={18} strokeWidth={2.5} />
                        </div>
                      )}
                      <BodySm className={`${feature.included ? 'text-grey-700 dark:text-grey-900' : 'text-grey-400 dark:text-grey-600'}`}>
                        {feature.text}
                      </BodySm>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={plan.highlighted ? 'solid' : 'soft'}
                  color="primary"
                  className="w-full"
                  size="large"
                >
                  {plan.buttonText}
                </Button>
              </div>
            );
          })}

          {/* Create New Offer Card */}
          <div className="min-w-[320px] flex-shrink-0 relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-grey-300 dark:border-grey-600 hover:border-primary hover:bg-grey-50 dark:hover:bg-grey-800/50 transition-all duration-300 cursor-pointer group h-full min-h-[400px] snap-center">
            <div className="p-4 rounded-full bg-grey-100 dark:bg-grey-800 group-hover:bg-primary/10 transition-colors mb-4">
              <Plus size={32} className="text-grey-400 group-hover:text-primary transition-colors" />
            </div>
            <Heading3 className="text-grey-500 group-hover:text-primary text-center transition-colors">
              Create a new subscription?
            </Heading3>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-16 text-center">
          <Heading6 className="text-grey-900 dark:text-white mb-2">Confused still?</Heading6>
          <div className="flex items-center justify-center gap-1 text-sm">
            <span className="text-grey-500">Try the</span>
            <a href="#" className="text-primary hover:text-primary-active font-medium transition-colors">
              basic version of Software
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Offers;