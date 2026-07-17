import React, { useEffect, useState } from 'react';
import {
    Container, Row, Col, Card, CardBody, Table, Badge, Button,
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput, Alert
} from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import { getZones, createZone, createSlot, updateSlot, getSlotStatuses, setSlotMaintenance } from './../../api/slots';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const slotTypeLabels = { Thuong: 'Thường', Vip: 'VIP', DanhChoVeThang: 'Dành vé tháng' };
const statusColor = { Trong: 'success', DangDauXe: 'danger', DaDatTruoc: 'warning', BaoTri: 'secondary' };
const statusLabel = { Trong: 'Trống', DangDauXe: 'Đang có xe', DaDatTruoc: 'Đã đặt trước', BaoTri: 'Bảo trì' };

const CreateZoneModal = ({ isOpen, toggle, onSuccess }) => {
    const [name, setName] = useState('');
    const [floor, setFloor] = useState(0);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await createZone({ parkingLotId: DEFAULT_PARKING_LOT_ID, name, floor: Number(floor) });
            setName('');
            onSuccess();
            toggle();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <Form onSubmit={handleSubmit}>
                <ModalHeader toggle={toggle}>Tạo khu vực mới</ModalHeader>
                <ModalBody>
                    {error && <Alert color="danger">{error}</Alert>}
                    <FormGroup>
                        <Label>Tên khu vực</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tầng 2, Khu B..." required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Số tầng (dùng để sắp xếp thứ tự hiển thị)</Label>
                        <Input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} required />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" type="button" onClick={toggle}>Hủy</Button>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : 'Tạo khu vực'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

const SlotFormModal = ({ isOpen, toggle, zones, editingSlot, onSuccess }) => {
    const [zoneId, setZoneId] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState('Thuong');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editingSlot) {
            setCode(editingSlot.code);
            setType(editingSlot.type);
        } else {
            setCode('');
            setType('Thuong');
            if (zones.length > 0) setZoneId(zones[0].id);
        }
    }, [editingSlot, isOpen, zones]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (editingSlot) {
                await updateSlot(editingSlot.slotId, { code, type });
            } else {
                await createSlot({ zoneId, code, type });
            }
            onSuccess();
            toggle();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <Form onSubmit={handleSubmit}>
                <ModalHeader toggle={toggle}>{editingSlot ? `Sửa slot ${editingSlot.code}` : 'Tạo slot mới'}</ModalHeader>
                <ModalBody>
                    {error && <Alert color="danger">{error}</Alert>}
                    {!editingSlot && (
                        <FormGroup>
                            <Label>Khu vực</Label>
                            <CustomInput type="select" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                            </CustomInput>
                        </FormGroup>
                    )}
                    <FormGroup>
                        <Label>Mã slot</Label>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="A-01" required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Loại slot</Label>
                        <CustomInput type="select" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="Thuong">Thường</option>
                            <option value="Vip">VIP</option>
                            <option value="DanhChoVeThang">Dành vé tháng</option>
                        </CustomInput>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" type="button" onClick={toggle}>Hủy</Button>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : editingSlot ? 'Lưu thay đổi' : 'Tạo slot'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

const SlotsManagement = () => {
    const [zones, setZones] = useState([]);
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState(null);
    const [createZoneOpen, setCreateZoneOpen] = useState(false);
    const [slotModalOpen, setSlotModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);

    const load = () => {
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }
        Promise.all([getZones(DEFAULT_PARKING_LOT_ID), getSlotStatuses(DEFAULT_PARKING_LOT_ID)])
            .then(([zonesRes, slotsRes]) => { setZones(zonesRes); setSlots(slotsRes); })
            .catch((err) => setError(err.message));
    };

    useEffect(load, []);

    const handleToggleMaintenance = async (slot) => {
        try {
            await setSlotMaintenance(slot.slotId, slot.status !== 'BaoTri');
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const openCreateSlot = () => { setEditingSlot(null); setSlotModalOpen(true); };
    const openEditSlot = (slot) => { setEditingSlot(slot); setSlotModalOpen(true); };

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={6}>
                    <HeaderMain title="Quản lý khu vực & slot" className="mb-4 mb-lg-3" />
                </Col>
                <Col lg={6} className="d-flex align-items-center justify-content-lg-end mb-3">
                    <Button color="secondary" outline className="mr-2" onClick={() => setCreateZoneOpen(true)}>
                        <i className="fa fa-plus mr-2"></i>Khu vực mới
                    </Button>
                    <Button color="primary" onClick={openCreateSlot} disabled={zones.length === 0}>
                        <i className="fa fa-plus mr-2"></i>Slot mới
                    </Button>
                </Col>
            </Row>

            {error && <Alert color="warning">{error}</Alert>}

            <Card className="mb-3">
                <CardBody>
                    <h6 className="mb-3">Khu vực ({zones.length})</h6>
                    <Table responsive size="sm">
                        <thead><tr><th>Tên</th><th>Tầng</th><th>Số slot</th></tr></thead>
                        <tbody>
                            {zones.map((z) => (
                                <tr key={z.id}><td>{z.name}</td><td>{z.floor}</td><td>{z.slotCount}</td></tr>
                            ))}
                            {zones.length === 0 && <tr><td colSpan={3} className="text-center text-muted">Chưa có khu vực nào.</td></tr>}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <h6 className="mb-3">Danh sách slot ({slots.length})</h6>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Mã</th><th>Khu vực</th><th>Loại</th><th>Trạng thái</th><th>Xe hiện tại</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map((s) => (
                                <tr key={s.slotId}>
                                    <td>{s.code}</td>
                                    <td>{s.zoneName}</td>
                                    <td>{slotTypeLabels[s.type] || s.type}</td>
                                    <td><Badge color={statusColor[s.status] || 'secondary'}>{statusLabel[s.status] || s.status}</Badge></td>
                                    <td>{s.currentLicensePlate || '-'}</td>
                                    <td className="text-nowrap">
                                        <Button
                                            size="sm" color="secondary" outline className="mr-2"
                                            disabled={s.status === 'DangDauXe'}
                                            onClick={() => openEditSlot(s)}
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
                                <tr><td colSpan={6} className="text-center text-muted">Chưa có slot nào.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            <CreateZoneModal isOpen={createZoneOpen} toggle={() => setCreateZoneOpen(false)} onSuccess={load} />
            <SlotFormModal
                isOpen={slotModalOpen}
                toggle={() => setSlotModalOpen(false)}
                zones={zones}
                editingSlot={editingSlot}
                onSuccess={load}
            />
        </Container>
    );
};

export default SlotsManagement;
