import React, { useEffect, useState } from 'react';
import {
    Container, Row, Col, Card, CardBody, Table, Badge, Button,
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput, Alert
} from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import { getExpiringSoon, createContract, renewContract, cancelContract } from './../../api/contracts';
import { getApiBaseUrl } from './../../api/http';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const statusColor = { DangHoatDong: 'success', SapHetHan: 'warning', HetHan: 'secondary', DaHuy: 'danger' };
const statusLabel = { DangHoatDong: 'Đang hoạt động', SapHetHan: 'Sắp hết hạn', HetHan: 'Hết hạn', DaHuy: 'Đã hủy' };

const resolvePhotoUrl = (url) => (url ? (url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`) : null);

const CreateContractModal = ({ isOpen, toggle, onSuccess }) => {
    const [customerUserId, setCustomerUserId] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [numberOfMonths, setNumberOfMonths] = useState(1);
    const [autoRenew, setAutoRenew] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await createContract({
                parkingLotId: DEFAULT_PARKING_LOT_ID,
                customerUserId,
                licensePlate,
                startDate,
                numberOfMonths,
                autoRenew,
            }, photoFile);
            setCustomerUserId('');
            setLicensePlate('');
            setPhotoFile(null);
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
                <ModalHeader toggle={toggle}>Tạo hợp đồng vé tháng</ModalHeader>
                <ModalBody>
                    {error && <Alert color="danger">{error}</Alert>}
                    <FormGroup>
                        <Label>Mã khách hàng (User Id)</Label>
                        <Input
                            value={customerUserId}
                            onChange={(e) => setCustomerUserId(e.target.value)}
                            placeholder="GUID của khách hàng đã đăng ký tài khoản"
                            required
                        />
                        <small className="text-muted">
                            Cần khách hàng đã có tài khoản (đăng ký qua /api/auth/register-customer).
                            Bản scaffold hiện chưa có UI tìm kiếm khách hàng.
                        </small>
                    </FormGroup>
                    <FormGroup>
                        <Label>Biển số xe</Label>
                        <Input value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required placeholder="51A-12345" />
                    </FormGroup>
                    <FormGroup>
                        <Label>Ngày bắt đầu</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Số tháng đăng ký</Label>
                        <Input type="number" min={1} value={numberOfMonths} onChange={(e) => setNumberOfMonths(Number(e.target.value))} required />
                    </FormGroup>
                    <FormGroup>
                        <CustomInput
                            type="checkbox"
                            id="autoRenew"
                            label="Tự động gia hạn"
                            checked={autoRenew}
                            onChange={(e) => setAutoRenew(e.target.checked)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Ảnh xe (không bắt buộc)</Label>
                        <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0] || null)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" type="button" onClick={toggle}>Hủy</Button>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : 'Tạo hợp đồng'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

const MonthlyContracts = () => {
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);

    const load = () => {
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }
        getExpiringSoon(DEFAULT_PARKING_LOT_ID, 30).then((res) => setContracts(res.items)).catch((err) => setError(err.message));
    };

    useEffect(load, []);

    const handleRenew = async (id) => {
        const months = window.prompt('Gia hạn thêm bao nhiêu tháng?', '1');
        if (!months) return;
        try {
            await renewContract(id, Number(months));
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Xác nhận hủy hợp đồng này?')) return;
        try {
            await cancelContract(id);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={8}>
                    <HeaderMain title="Vé tháng" className="mb-4 mb-lg-3" />
                </Col>
                <Col lg={4} className="d-flex align-items-center justify-content-lg-end mb-3">
                    <Button color="primary" onClick={() => setCreateOpen(true)}>
                        <i className="fa fa-plus mr-2"></i>Tạo hợp đồng
                    </Button>
                </Col>
            </Row>

            {error && <Alert color="warning">{error}</Alert>}

            <Card>
                <CardBody>
                    <p className="text-muted small mb-3">
                        Danh sách hợp đồng đang hoạt động hoặc sắp/đã hết hạn trong 30 ngày qua.
                    </p>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Ảnh xe</th>
                                <th>Biển số</th>
                                <th>Khách hàng</th>
                                <th>Slot cố định</th>
                                <th>Hết hạn</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        <img
                                            src={resolvePhotoUrl(c.vehiclePhotoUrl)}
                                            alt={c.licensePlate}
                                            style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }}
                                        />
                                    </td>
                                    <td>{c.licensePlate}</td>
                                    <td>{c.customerName}</td>
                                    <td>{c.fixedSlotCode || '-'}</td>
                                    <td>{c.endDate}</td>
                                    <td><Badge color={statusColor[c.status] || 'secondary'}>{statusLabel[c.status] || c.status}</Badge></td>
                                    <td className="text-nowrap">
                                        <Button size="sm" color="primary" outline className="mr-2" onClick={() => handleRenew(c.id)}>
                                            Gia hạn
                                        </Button>
                                        <Button size="sm" color="danger" outline onClick={() => handleCancel(c.id)}>
                                            Hủy
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {contracts.length === 0 && (
                                <tr><td colSpan={7} className="text-center text-muted">Không có hợp đồng nào.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            <CreateContractModal isOpen={createOpen} toggle={() => setCreateOpen(false)} onSuccess={load} />
        </Container>
    );
};

export default MonthlyContracts;
