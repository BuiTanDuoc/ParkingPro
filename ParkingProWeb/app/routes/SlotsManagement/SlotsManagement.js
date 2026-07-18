import React, { useEffect, useState } from 'react';
import {
    Container, Row, Col, Card, CardBody, Table, Badge, Button, Alert,
    Nav, NavItem, NavLink, TabContent, TabPane, Form, FormGroup, Label, CustomInput, Input,
    Pagination, PaginationItem, PaginationLink
} from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import SlotFormModal from '../components/ParkingPro/SlotFormModal';
import ZoneFormModal from '../components/ParkingPro/ZoneFormModal';
import { getZones, getSlotsPaged, setSlotMaintenance } from './../../api/slots';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const slotTypeLabels = { Thuong: 'Thường', Vip: 'VIP', DanhChoVeThang: 'Dành vé tháng' };
const statusColor = { Trong: 'success', DangDauXe: 'danger', DaDatTruoc: 'warning', BaoTri: 'secondary' };
const statusLabel = { Trong: 'Trống', DangDauXe: 'Đang có xe', DaDatTruoc: 'Đã đặt trước', BaoTri: 'Bảo trì' };
const PAGE_SIZE = 10;

const ZonesTab = ({ zones, onReload }) => {
    const [zoneModalOpen, setZoneModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState(null);

    const openCreate = () => { setEditingZone(null); setZoneModalOpen(true); };
    const openEdit = (zone) => { setEditingZone(zone); setZoneModalOpen(true); };

    return (
        <Card>
            <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Khu vực ({zones.length})</h6>
                    <Button size="sm" color="primary" onClick={openCreate}>
                        <i className="fa fa-plus mr-2"></i>Khu vực mới
                    </Button>
                </div>
                <Table responsive hover size="sm">
                    <thead><tr><th>Tên</th><th>Tầng</th><th>Mô tả</th><th>Số slot</th><th></th></tr></thead>
                    <tbody>
                        {zones.map((z) => (
                            <tr key={z.id}>
                                <td>{z.name}</td>
                                <td>{z.floor}</td>
                                <td>{z.description || '-'}</td>
                                <td>{z.slotCount}</td>
                                <td>
                                    <Button size="sm" color="secondary" outline onClick={() => openEdit(z)}>Sửa</Button>
                                </td>
                            </tr>
                        ))}
                        {zones.length === 0 && <tr><td colSpan={5} className="text-center text-muted">Chưa có khu vực nào.</td></tr>}
                    </tbody>
                </Table>
            </CardBody>

            <ZoneFormModal
                isOpen={zoneModalOpen}
                toggle={() => setZoneModalOpen(false)}
                editingZone={editingZone}
                onSuccess={onReload}
            />
        </Card>
    );
};

const SlotsTab = ({ zones, onReload }) => {
    const [slots, setSlots] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [zoneFilter, setZoneFilter] = useState('');
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);
    const [slotModalOpen, setSlotModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    const load = () => {
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }
        getSlotsPaged(DEFAULT_PARKING_LOT_ID, { zoneId: zoneFilter || undefined, search: search || undefined, pageNumber, pageSize: PAGE_SIZE })
            .then((res) => { setSlots(res.items); setTotalCount(res.totalCount); })
            .catch((err) => setError(err.message));
    };

    useEffect(load, [pageNumber, zoneFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageNumber(1);
        load();
    };

    const handleToggleMaintenance = async (slot) => {
        try {
            await setSlotMaintenance(slot.slotId, slot.status !== 'BaoTri');
            load();
            onReload();
        } catch (err) {
            setError(err.message);
        }
    };

    const openCreate = () => { setEditingSlot(null); setSlotModalOpen(true); };
    const openEdit = (slot) => { setEditingSlot(slot); setSlotModalOpen(true); };

    const handleModalSuccess = () => { load(); onReload(); };

    return (
        <Card>
            <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Danh sách slot ({totalCount})</h6>
                    <Button size="sm" color="primary" onClick={openCreate} disabled={zones.length === 0}>
                        <i className="fa fa-plus mr-2"></i>Slot mới
                    </Button>
                </div>

                {error && <Alert color="warning">{error}</Alert>}

                <Form inline onSubmit={handleSearchSubmit} className="mb-3">
                    <FormGroup className="mr-3 mb-2">
                        <Label className="mr-2">Khu vực</Label>
                        <CustomInput
                            type="select" bsSize="sm"
                            value={zoneFilter}
                            onChange={(e) => { setZoneFilter(e.target.value); setPageNumber(1); }}
                        >
                            <option value="">Tất cả</option>
                            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                        </CustomInput>
                    </FormGroup>
                    <FormGroup className="mr-3 mb-2">
                        <Input
                            bsSize="sm"
                            placeholder="Tìm theo mã hoặc mô tả..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </FormGroup>
                    <Button size="sm" color="secondary" outline type="submit" className="mb-2">
                        <i className="fa fa-search mr-1"></i>Tìm
                    </Button>
                </Form>

                <Table responsive hover>
                    <thead>
                        <tr>
                            <th>Mã</th><th>Khu vực</th><th>Loại</th><th>Mô tả</th><th>Trạng thái</th><th>Xe hiện tại</th><th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {slots.map((s) => (
                            <tr key={s.slotId}>
                                <td>{s.code}</td>
                                <td>{s.zoneName}</td>
                                <td>{slotTypeLabels[s.type] || s.type}</td>
                                <td>{s.description || '-'}</td>
                                <td><Badge color={statusColor[s.status] || 'secondary'}>{statusLabel[s.status] || s.status}</Badge></td>
                                <td>{s.currentLicensePlate || '-'}</td>
                                <td className="text-nowrap">
                                    <Button
                                        size="sm" color="secondary" outline className="mr-2"
                                        disabled={s.status === 'DangDauXe'}
                                        onClick={() => openEdit(s)}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        size="sm"
                                        color={s.status === 'BaoTri' ? 'success' : 'warning'}
                                        outline
                                        disabled={s.status === 'DangDauXe'}
                                        onClick={() => handleToggleMaintenance(s)}
                                    >
                                        {s.status === 'BaoTri' ? 'Mở lại' : 'Bảo trì'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {slots.length === 0 && (
                            <tr><td colSpan={7} className="text-center text-muted">Không có slot nào phù hợp.</td></tr>
                        )}
                    </tbody>
                </Table>

                {totalPages > 1 && (
                    <Pagination size="sm" className="justify-content-center mt-3">
                        <PaginationItem disabled={pageNumber <= 1}>
                            <PaginationLink previous onClick={() => setPageNumber((p) => p - 1)} />
                        </PaginationItem>
                        <PaginationItem disabled>
                            <PaginationLink>Trang {pageNumber} / {totalPages}</PaginationLink>
                        </PaginationItem>
                        <PaginationItem disabled={pageNumber >= totalPages}>
                            <PaginationLink next onClick={() => setPageNumber((p) => p + 1)} />
                        </PaginationItem>
                    </Pagination>
                )}
            </CardBody>

            <SlotFormModal
                isOpen={slotModalOpen}
                toggle={() => setSlotModalOpen(false)}
                zones={zones}
                editingSlot={editingSlot}
                onSuccess={handleModalSuccess}
            />
        </Card>
    );
};

const SlotsManagement = () => {
    const [activeTab, setActiveTab] = useState('zones');
    const [zones, setZones] = useState([]);
    const [error, setError] = useState(null);

    const loadZones = () => {
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }
        getZones(DEFAULT_PARKING_LOT_ID).then(setZones).catch((err) => setError(err.message));
    };

    useEffect(loadZones, []);

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={12}>
                    <HeaderMain title="Quản lý khu vực & slot" className="mb-4 mb-lg-3" />
                </Col>
            </Row>

            {error && <Alert color="warning">{error}</Alert>}

            <Nav tabs className="mb-3">
                <NavItem>
                    <NavLink active={activeTab === 'zones'} onClick={() => setActiveTab('zones')} style={{ cursor: 'pointer' }}>
                        Khu vực
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink active={activeTab === 'slots'} onClick={() => setActiveTab('slots')} style={{ cursor: 'pointer' }}>
                        Danh sách slot
                    </NavLink>
                </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
                <TabPane tabId="zones">
                    <ZonesTab zones={zones} onReload={loadZones} />
                </TabPane>
                <TabPane tabId="slots">
                    <SlotsTab zones={zones} onReload={loadZones} />
                </TabPane>
            </TabContent>
        </Container>
    );
};

export default SlotsManagement;
