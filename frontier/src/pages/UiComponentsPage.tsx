import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import TypographyDisplay from '@/components/ui/TypographyDisplay';
import ButtonsDisplay from '@/components/ui/ButtonsDisplay';
import InputsDisplay from '@/components/ui/InputsDisplay';
import TogglesDisplay from '@/components/ui/TogglesDisplay';
import ComboboxDisplay from '@/components/ui/ComboboxDisplay';
import DatePickerDisplay from '@/components/ui/DatePickerDisplay';
import TimePickerDisplay from '@/components/ui/TimePickerDisplay';
import DataDisplay from '@/components/ui/DataDisplay';
import PaginationTooltipDisplay from '@/components/ui/PaginationTooltipDisplay';
import TimelineDisplay from '@/components/ui/TimelineDisplay';
import DraggableListDisplay from '@/components/ui/DraggableListDisplay';

const UiComponentsPage: React.FC = () => {
    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Help & Support (UI Components)', active: true }
    ];

    return (
        <PageLayout breadcrumbItems={breadcrumbItems}>
            <div className="p-6 space-y-12">
                <TypographyDisplay />
                <ButtonsDisplay />
                <InputsDisplay />
                <TogglesDisplay />
                <ComboboxDisplay />
                <DatePickerDisplay />
                <TimePickerDisplay />
                <DataDisplay />
                <PaginationTooltipDisplay />
                <TimelineDisplay />
                <DraggableListDisplay />
            </div>
        </PageLayout>
    );
};

export default UiComponentsPage;
