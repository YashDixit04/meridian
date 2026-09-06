import React, { useEffect, useState } from 'react';
import GenericTablePage from '@/components/common/GenericTablePage';
import ViewToggle from '@/components/layout/viewTableLayout';
import { Vessel, vesselsColumns } from '@/data/vesselsData';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ApiException } from '@/lib/apiClient';
import { Calendar, ChevronDown, Hash, Pencil, Plus, Ship, Trash2, X } from 'lucide-react';
import { authService } from '@/services/authService';
import tenantService, { TenantVessel } from '@/services/tenantService';

interface VesselsPageProps {
    tenantId?: string;
    onNavigate?: (target: string) => void;
}

interface EditVesselFormState {
    vesselName: string;
    imoNumber: string;
    vesselType: string;
    currentStatus: TenantVessel['operations']['currentStatus'];
    currentPort: string;
    captain: string;
}

const mapTenantVesselToRow = (vessel: TenantVessel, index: number): Vessel => ({
    id: index + 1,
    vesselName: vessel.coreInfo.vesselName,
    imoNumber: vessel.coreInfo.imoNumber,
    vesselType: vessel.coreInfo.vesselType,
    captain: vessel.crew.captain || '-',
    location: vessel.operations.currentPort || '-',
    status: vessel.operations.currentStatus,
    lastInspection: new Date(vessel.updatedAt).toLocaleDateString(),
    _backendId: vessel.id,
    _tenantId: vessel.tenantId,
});

const normalizeOptionalText = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const VesselsPage: React.FC<VesselsPageProps> = ({ tenantId: propTenantId, onNavigate }) => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [vessels, setVessels] = useState<Vessel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
    const [editForm, setEditForm] = useState<EditVesselFormState | null>(null);
    const [editError, setEditError] = useState('');
    const [saving, setSaving] = useState(false);

    const session = authService.getSession();
    const tenantId = propTenantId || session?.tenantId || '';

    const fetchVessels = async () => {
        if (!tenantId) {
            setVessels([]);
            setIsLoading(false);
            setPageError('Tenant context is missing. Open this page from Tenant Details.');
            return;
        }

        try {
            setIsLoading(true);
            const data = await tenantService.getVessels(tenantId);
            setVessels(data.map(mapTenantVesselToRow));
            setPageError('');
        } catch (err) {
            console.error('Failed to fetch vessels:', err);
            setVessels([]);
            setPageError('Failed to load tenant vessels. Please refresh and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVessels();
    }, [tenantId]);

    const navigateToCreatePage = () => {
        if (!tenantId) {
            setPageError('Tenant context is missing. Open this page from Tenant Details.');
            return;
        }

        onNavigate?.(`/tenant/${tenantId}/vessels/new`);
    };

    const openEditModal = (row: Vessel) => {
        if (!row._backendId) {
            return;
        }

        setEditingVessel(row);
        setEditForm({
            vesselName: row.vesselName,
            imoNumber: row.imoNumber,
            vesselType: row.vesselType,
            currentStatus: row.status,
            currentPort: row.location,
            captain: row.captain === '-' ? '' : row.captain,
        });
        setEditError('');
    };

    const handleUpdate = async () => {
        if (!editingVessel || !editForm || !editingVessel._backendId) {
            return;
        }

        if (!tenantId) {
            setEditError('Missing tenant context. Open this page from Tenant Details.');
            return;
        }

        if (!editForm.vesselName.trim() || !editForm.imoNumber.trim() || !editForm.vesselType.trim()) {
            setEditError('Vessel name, IMO number, and vessel type are required.');
            return;
        }

        if (!editForm.currentPort.trim()) {
            setEditError('Current port is required.');
            return;
        }

        setSaving(true);
        setEditError('');

        try {
            await tenantService.updateVessel(tenantId, editingVessel._backendId, {
                coreInfo: {
                    vesselName: editForm.vesselName.trim(),
                    imoNumber: editForm.imoNumber.trim(),
                    vesselType: editForm.vesselType.trim(),
                },
                operations: {
                    currentStatus: editForm.currentStatus,
                    currentPort: editForm.currentPort.trim(),
                },
                crew: {
                    captain: normalizeOptionalText(editForm.captain),
                },
            });

            setEditingVessel(null);
            setEditForm(null);
            await fetchVessels();
        } catch (err) {
            console.error('Failed to update vessel:', err);
            if (err instanceof ApiException) {
                setEditError(err.errorMessage);
            } else {
                setEditError('Failed to update vessel. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingVessel || !editingVessel._backendId || !tenantId) {
            return;
        }

        const confirmed = window.confirm(
            `Delete vessel "${editingVessel.vesselName}"? This action cannot be undone.`,
        );
        if (!confirmed) {
            return;
        }

        setSaving(true);
        setEditError('');

        try {
            await tenantService.deleteVessel(tenantId, editingVessel._backendId);
            setEditingVessel(null);
            setEditForm(null);
            await fetchVessels();
        } catch (err) {
            console.error('Failed to delete vessel:', err);
            if (err instanceof ApiException) {
                setEditError(err.errorMessage);
            } else {
                setEditError('Failed to delete vessel. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    const tableColumns = vesselsColumns.map((column) => {
        if (column.header !== 'Action') {
            return column;
        }

        return {
            ...column,
            cell: (row: Vessel) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            openEditModal(row);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-grey-200 dark:border-grey-700 px-2 py-1 text-xs font-medium text-grey-700 dark:text-grey-300 hover:border-primary/40 hover:text-primary transition-colors"
                    >
                        <Pencil size={12} /> Edit
                    </button>
                </div>
            ),
        };
    });

    const breadcrumbItems = [
        { label: 'Home', href: '#' },
        { label: 'Tenant', href: '#' },
        { label: 'Vessels', href: '#', active: true },
    ];

    const actions = (
        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg border border-grey-200 dark:border-grey-700 bg-grey-50 dark:bg-grey-800 cursor-pointer hover:border-primary/50 hover:bg-white dark:hover:bg-grey-800 transition-all group">
                <Calendar size={14} className="text-grey-500 group-hover:text-primary transition-colors" />
                <span className="text-xs font-medium text-grey-700 dark:text-grey-300">September, 2024</span>
                <ChevronDown size={14} className="text-grey-400 group-hover:text-primary transition-colors" />
            </div>
            <Button variant="solid" color="primary" size="small" onClick={navigateToCreatePage}>
                <Plus size={14} className="mr-1" /> Add Vessel
            </Button>
        </div>
    );

    return (
        <>
            <GenericTablePage
                breadcrumbItems={breadcrumbItems}
                data={vessels}
                columns={tableColumns}
                createButtonLabel="Add Vessel"
                onCreateClick={navigateToCreatePage}
                itemsPerPage={7}
                viewToggle={<ViewToggle viewMode={viewMode} onViewChange={setViewMode} />}
                viewMode={viewMode}
                actions={actions}
                customContent={
                    <>
                        {isLoading && (
                            <div className="rounded-lg border border-primary/20 bg-primary-soft px-4 py-2 text-sm text-primary">
                                Loading tenant-scoped vessels...
                            </div>
                        )}
                        {pageError && (
                            <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger">
                                {pageError}
                            </div>
                        )}
                    </>
                }
            />

            {editingVessel && editForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0A0A0D] rounded-2xl border border-grey-200 dark:border-grey-800 p-8 shadow-xl max-w-2xl w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-grey-900 dark:text-white">Edit Vessel</h3>
                            <button
                                onClick={() => {
                                    setEditingVessel(null);
                                    setEditForm(null);
                                    setEditError('');
                                }}
                                className="text-grey-400 hover:text-grey-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {editError && (
                            <div className="mb-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                                {editError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Vessel Name</label>
                                <Input
                                    name="vesselName"
                                    type="text"
                                    value={editForm.vesselName}
                                    onChange={(event) => setEditForm({ ...editForm, vesselName: event.target.value })}
                                    leftIcon={<Ship size={18} />}
                                    size="medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">IMO Number</label>
                                <Input
                                    name="imoNumber"
                                    type="text"
                                    value={editForm.imoNumber}
                                    onChange={(event) => setEditForm({ ...editForm, imoNumber: event.target.value })}
                                    leftIcon={<Hash size={18} />}
                                    size="medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Vessel Type</label>
                                <Input
                                    name="vesselType"
                                    type="text"
                                    value={editForm.vesselType}
                                    onChange={(event) => setEditForm({ ...editForm, vesselType: event.target.value })}
                                    size="medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Current Status</label>
                                <select
                                    value={editForm.currentStatus}
                                    onChange={(event) =>
                                        setEditForm({
                                            ...editForm,
                                            currentStatus: event.target.value as EditVesselFormState['currentStatus'],
                                        })
                                    }
                                    className="w-full h-10 px-3 bg-white dark:bg-[#0A0A0D] border border-grey-200 dark:border-grey-800 rounded-lg text-grey-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                >
                                    <option value="Active">Active</option>
                                    <option value="In Port">In Port</option>
                                    <option value="Sailing">Sailing</option>
                                    <option value="Dry Dock">Dry Dock</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Current Port</label>
                                <Input
                                    name="currentPort"
                                    type="text"
                                    value={editForm.currentPort}
                                    onChange={(event) => setEditForm({ ...editForm, currentPort: event.target.value })}
                                    size="medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-1.5">Captain</label>
                                <Input
                                    name="captain"
                                    type="text"
                                    value={editForm.captain}
                                    onChange={(event) => setEditForm({ ...editForm, captain: event.target.value })}
                                    size="medium"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" color="danger" size="small" onClick={handleDelete} disabled={saving}>
                                <Trash2 size={14} className="mr-1" /> Delete Vessel
                            </Button>
                            <Button
                                variant="outline"
                                color="grey"
                                size="small"
                                onClick={() => {
                                    setEditingVessel(null);
                                    setEditForm(null);
                                    setEditError('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button variant="solid" color="primary" size="small" onClick={handleUpdate} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VesselsPage;
