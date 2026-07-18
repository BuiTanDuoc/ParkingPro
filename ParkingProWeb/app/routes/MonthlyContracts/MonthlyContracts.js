import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Table, Badge, Button, Alert } from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import CreateContractModal from '../components/ParkingPro/CreateContractModal';
import { getExpiringSoon, renewContract, cancelContract } from './../../api/contracts';
import { getApiBaseUrl } from './../../api/http';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const statusColor = { DangHoatDong: 'success', SapHetHan: 'warning', HetHan: 'secondary', DaHuy: 'danger' };
const statusLabel = { DangHoatDong: 'Đang hoạt động', SapHetHan: 'Sắp hết hạn', HetHan: 'Hết hạn', DaHuy: 'Đã hủy' };

const resolvePhotoUrl = (url) => (url ? (url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`) : null);

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
