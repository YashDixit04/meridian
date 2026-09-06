import React, { useState, useEffect, useRef } from 'react';
import {
    Heading2,
    BodyBase,
} from '../ui/Typography';
import { getLabel, DynamicSection, SectionSaveEvent } from '@/components/common/DynamicRender';
import PageLayout from '@/components/layout/PageLayout';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
} from '@/components/ui/Timeline';
import { User, Settings, Shield, Bell, Key, Database, Zap, MapPin, Users, Ship, ShoppingCart, FileText, Clock, ChevronRight, Package, Briefcase } from 'lucide-react';
import { BreadcrumbLink } from '../common/Breadcrub/dynamicbreadcrub';
import { QuickLinkSection } from '@/data/tenantDetailsData';
import Button from '../ui/Button';

// --- Generic data shape for DetailsView ---
export interface DetailsViewData {
    type: string;
    basic: Record<string, any>;
    advanced?: Record<string, any>;
}

// Icon mapping for quick links
const quickLinkIconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
    'users': Users,
    'ship': Ship,
    'shopping-cart': ShoppingCart,
    'package': Package,
    'briefcase': Briefcase,
    'file': FileText,
    'clock': Clock,
};

interface DetailsViewProps {
    data: DetailsViewData;
    breadcrumbItems: BreadcrumbLink[];
    actions?: React.ReactNode;
    pageTitle: string;
    pageSubtitle: string;
    isEditMode?: boolean;
    quickLinks?: QuickLinkSection[];
    onQuickLinkClick?: (redirectUrl: string) => void;
    onChange?: (data: DetailsViewData) => void;
    showSectionSaveButtons?: boolean;
    fieldErrors?: Record<string, string>;
    onFieldInteraction?: (fieldPath: string) => void;
    readOnlySectionKeys?: string[];
    onSectionSave?: (event: SectionSaveEvent) => void;
}

const DetailsView: React.FC<DetailsViewProps> = ({
    data,
    breadcrumbItems,
    actions,
    pageTitle,
    pageSubtitle,
    isEditMode = true,
    readOnlySectionKeys = [],
    quickLinks,
    onQuickLinkClick,
    onChange,
    showSectionSaveButtons = false,
    fieldErrors = {},
    onFieldInteraction,
    onSectionSave,
}) => {
    const [viewData, setViewData] = useState<DetailsViewData>(data);
    const [activeSection, setActiveSection] = useState<string>('');
    const skipNextOnChangeSync = useRef(true);

    // Ref for the scrollable container (PageLayout)
    const scrollContainerRef = useRef<HTMLElement>(null);

    // Refs to store section elements for the intersection observer
    const sectionRefs = useRef<{ [key: string]: Element | null }>({});
    // Ref to prevent observer updates during manual scroll (click)
    const isManualScroll = useRef(false);

    // Sync state when data prop changes
    useEffect(() => {
        setViewData(data);
        skipNextOnChangeSync.current = true;
    }, [data]);

    // Propagate data changes after render to avoid setState warnings in parent components.
    useEffect(() => {
        if (!onChange) return;

        if (skipNextOnChangeSync.current) {
            skipNextOnChangeSync.current = false;
            return;
        }

        onChange(viewData);
    }, [viewData, onChange]);

    // Initialize active section
    useEffect(() => {
        if (viewData.basic) {
            const firstKey = Object.keys(viewData.basic)[0];
            if (firstKey) setActiveSection(firstKey);
        }
    }, [viewData.basic]);

    const handleInputChange = (
        parent: string,
        section: string,
        field: string,
        value: any
    ) => {
        setViewData(prev => {
            const parentData = prev[parent as keyof DetailsViewData] as any;
            const sectionData = parentData[section];

            // BUSINESS LOGIC: Country to Currency & Timezone
            let newSectionData = { ...sectionData, [field]: value };
            if (field === 'country' && section === 'tenantInformation') {
                newSectionData.currency = value === 'United States' ? 'USD' : 
                                        value === 'United Kingdom' ? 'GBP' : 
                                        value === 'India' ? 'INR' : 
                                        value === 'Europe' ? 'EUR' : 'USD'; // Default
                                        
                newSectionData.timezone = value === 'United States' ? 'UTC -5' : 
                                        value === 'United Kingdom' ? 'UTC +0' : 
                                        value === 'India' ? 'UTC +5:30' : 
                                        value === 'Europe' ? 'UTC +1' : 'UTC'; // Default
            }

            const newData = {
                ...prev,
                [parent]: {
                    ...parentData,
                    [section]: newSectionData
                }
            };

            return newData;
        });
    };

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        isManualScroll.current = true;

        const element = document.getElementById(id);
        const container = scrollContainerRef.current;

        if (element && container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            // Calculate relative position
            const relativeTop = elementRect.top - containerRect.top;
            const currentScroll = container.scrollTop;
            const yOffset = -100;

            container.scrollTo({
                top: currentScroll + relativeTop + yOffset,
                behavior: 'smooth'
            });

            // Reset manual scroll lock after animation (approximate)
            setTimeout(() => {
                isManualScroll.current = false;
            }, 1000);
        }
    };

    // Scroll Spy Logic
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const observerOptions = {
            root: container,
            rootMargin: '-10% 0px -80% 0px',
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            if (isManualScroll.current) return;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        Object.values(sectionRefs.current).forEach((el: Element | null) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [viewData]);

    // Auto-scroll left sidebar to active section
    useEffect(() => {
        if (!activeSection || isManualScroll.current) return;
        const leftSidebar = document.getElementById('left-sidebar');
        const activeLink = document.getElementById(`nav-link-${activeSection}`);

        if (leftSidebar && activeLink) {
            const sidebarRect = leftSidebar.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();

            // Check if active item is outside the visible area of the sidebar
            if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
                leftSidebar.scrollTo({
                    top: activeLink.offsetTop - leftSidebar.offsetTop - leftSidebar.clientHeight / 2 + activeLink.clientHeight / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeSection]);

    return (
        <PageLayout
            ref={scrollContainerRef}
            breadcrumbItems={breadcrumbItems}
            actions={actions}
        >
            <div className="p-6">
                {/* Page Header Content */}
                <div className="mb-8">
                    <Heading2 className="text-grey-900 dark:text-white mb-1">{pageTitle}</Heading2>
                    <BodyBase className="text-grey-500 dark:text-grey-400">{pageSubtitle}</BodyBase>
                </div>

                <div className="flex flex-1 gap-10 items-start relative min-h-full">
                    {/* Sticky Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20 h-fit max-h-[calc(100vh-12rem)] overflow-y-auto no-scrollbar pb-10 z-0" id="left-sidebar">
                        <div className="flex flex-col gap-1">

                            {/* Basic Details */}
                            {viewData.basic && Object.keys(viewData.basic).length > 0 && (
                                <>
                                    <div className="px-4 py-2 mt-2 mb-4">
                                        <h3 className="text-sm font-bold text-grey-900 dark:text-white uppercase tracking-wider opacity-80">
                                            Basic Details
                                        </h3>
                                    </div>
                                    <div className="pl-4">
                                        <Timeline>
                                            {Object.keys(viewData.basic).map((key, index, arr) => {
                                                const icons = [User, User, Shield, Key, Bell, Database];
                                                const Icon = icons[index % icons.length];
                                                const isLast = index === arr.length - 1 && (!viewData.advanced || Object.keys(viewData.advanced).length === 0);

                                                return (
                                                    <TimelineItem key={key}>
                                                        <TimelineSeparator>
                                                            <TimelineDot
                                                                variant={activeSection === key ? "solid" : "outline"}
                                                                color="primary"
                                                                className={`w-8 h-8 ${activeSection !== key ? 'border-[1.5px]' : ''}`}
                                                            >
                                                                <Icon size={14} />
                                                            </TimelineDot>
                                                            {!isLast && <TimelineConnector />}
                                                        </TimelineSeparator>
                                                        <TimelineContent className="pb-6">
                                                            <button
                                                                id={`nav-link-${key}`}
                                                                onClick={() => scrollToSection(key)}
                                                                className={`text-left w-full text-sm rounded-lg transition-all duration-200 mt-1.5
                                                                        ${activeSection === key ? "text-primary font-semibold" : "text-grey-500 hover:text-grey-900 dark:hover:text-grey-300"}
                                                                    `}
                                                            >
                                                                {getLabel(key)}
                                                            </button>
                                                        </TimelineContent>
                                                    </TimelineItem>
                                                );
                                            })}
                                        </Timeline>
                                    </div>
                                </>
                            )}

                            {/* Advanced Details */}
                            {viewData.advanced && Object.keys(viewData.advanced).length > 0 && (
                                <>
                                    <div className="px-4 py-2 mt-2 mb-4">
                                        <h3 className="text-sm font-bold text-grey-900 dark:text-white uppercase tracking-wider opacity-80">
                                            Advanced
                                        </h3>
                                    </div>
                                    <div className="pl-4">
                                        <Timeline>
                                            {Object.keys(viewData.advanced).map((key, index, arr) => {
                                                const icons = [Settings, Zap, MapPin, Shield, Database, Key];
                                                const Icon = icons[index % icons.length];
                                                const isLast = index === arr.length - 1;

                                                return (
                                                    <TimelineItem key={key}>
                                                        <TimelineSeparator>
                                                            <TimelineDot
                                                                variant={activeSection === key ? "solid" : "outline"}
                                                                color="primary"
                                                                className={`w-8 h-8 ${activeSection !== key ? 'border-[1.5px]' : ''}`}
                                                            >
                                                                <Icon size={14} />
                                                            </TimelineDot>
                                                            {!isLast && <TimelineConnector />}
                                                        </TimelineSeparator>
                                                        <TimelineContent className="pb-6">
                                                            <button
                                                                id={`nav-link-${key}`}
                                                                onClick={() => scrollToSection(key)}
                                                                className={`text-left w-full text-sm rounded-lg transition-all duration-200 mt-1.5
                                                                        ${activeSection === key ? "text-primary font-semibold" : "text-grey-500 hover:text-grey-900 dark:hover:text-grey-300"}
                                                                    `}
                                                            >
                                                                {getLabel(key)}
                                                            </button>
                                                        </TimelineContent>
                                                    </TimelineItem>
                                                );
                                            })}
                                        </Timeline>
                                    </div>
                                </>
                            )}

                        </div>
                    </aside>


                    {/* Main Content */}
                    <main className="flex-1 min-w-0 pb-20">
                        <div className="max-w-4xl space-y-12">

                            {viewData.basic &&
                                Object.entries(viewData.basic).map(([key, data]) => (
                                    <DynamicSection
                                        key={key}
                                        id={key}
                                        data={data}
                                        parentKey="basic"
                                        onInputChange={handleInputChange}
                                        setRef={(el) => (sectionRefs.current[key] = el)}
                                        isEditMode={isEditMode && !readOnlySectionKeys?.includes(key)}
                                        showSaveButton={showSectionSaveButtons}
                                        fieldErrors={fieldErrors}
                                        onFieldInteraction={onFieldInteraction}
                                        onSectionSave={onSectionSave}
                                    />
                                ))}

                            {viewData.advanced &&
                                Object.entries(viewData.advanced).map(([key, data]) => (
                                    <DynamicSection
                                        key={key}
                                        id={key}
                                        data={data}
                                        parentKey="advanced"
                                        onInputChange={handleInputChange}
                                        setRef={(el) => (sectionRefs.current[key] = el)}
                                        isEditMode={isEditMode && !readOnlySectionKeys?.includes(key)}
                                        showSaveButton={showSectionSaveButtons}
                                        fieldErrors={fieldErrors}
                                        onFieldInteraction={onFieldInteraction}
                                        onSectionSave={onSectionSave}
                                    />
                                ))}

                        </div>
                    </main>

                    {/* Right Sticky Sidebar — Quick Links */}
                    {quickLinks && quickLinks.length > 0 && (
                        <aside className="hidden xl:block w-56 flex-shrink-0 sticky top-20 h-fit z-0">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xs font-bold text-grey-500 dark:text-grey-400 uppercase tracking-wider mb-2 px-1">
                                    Quick Links
                                </h3>
                                {quickLinks.map((link, index) => {
                                    const IconComponent = quickLinkIconMap[link.icon] || FileText;
                                    return (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            color="grey"
                                            size="medium"
                                            className="w-full !justify-start gap-3 !px-3 !h-11 group hover:!bg-primary-soft"
                                            onClick={() => onQuickLinkClick?.(link.redirectUrl)}
                                        >
                                            <span className="w-8 h-8 rounded-lg bg-grey-100 dark:bg-grey-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-soft group-hover:text-primary transition-colors">
                                                <IconComponent size={16} />
                                            </span>
                                            <span className="flex-1 text-left text-sm font-medium text-grey-700 dark:text-grey-300 group-hover:text-primary transition-colors truncate">
                                                {link.title}
                                            </span>
                                            {link.total !== null && (
                                                <span className="text-xs font-semibold text-grey-500 dark:text-grey-400 bg-grey-100 dark:bg-grey-800 rounded-full px-2 py-0.5 group-hover:bg-primary-soft group-hover:text-primary transition-colors">
                                                    {link.total.toLocaleString()}
                                                </span>
                                            )}
                                            <ChevronRight size={14} className="text-grey-400 group-hover:text-primary transition-colors flex-shrink-0" />
                                        </Button>
                                    );
                                })}
                            </div>
                        </aside>
                    )}

                </div>
            </div>
        </PageLayout>
    );
};

DetailsView.displayName = 'DetailsView';

export default DetailsView;
