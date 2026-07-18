import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Table, Badge, Button, Alert } from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import CheckInModal from '../components/ParkingPro/CheckInModal';
import CheckOutModal from '../components/ParkingPro/CheckOutModal';
import { getActiveSessions } from './../../api/sessions';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const statusColor = { DangGuiXe: 'warning', DaThanhToan: 'success', DaHuy: 'secondary' };

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [error, setError] = useState(null);
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkOutSession, setCheckOutSession] = useState(null);
    const [lastReceipt, setLastReceipt] = useState(null);

    const load = () => {
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }
        getActiveSessions(DEFAULT_PARKING_LOT_ID).then((res) => setSessions(res.items)).catch((err) => setError(err.message));
    };

    useEffect(load, []);

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={8}>
                    <HeaderMain title="Gửi xe theo giờ/ngày" className="mb-4 mb-lg-3" />
                </Col>
                <Col lg={4} className="d-flex align-items-center justify-content-lg-end mb-3">
                    <Button color="primary" onClick={() => setCheckInOpen(true)}>
                        <i className="fa fa-plus mr-2"></i>Check-in xe
                    </Button>
                </Col>
            </Row>

            {error && <Alert color="warning">{error}</Alert>}
            {lastReceipt && (
                <Alert color="success" toggle={() => setLastReceipt(null)}>
                    Check-out thành công — xe {lastReceipt.licensePlate}: <strong>{lastReceipt.totalAmount.toLocaleString('vi-VN')} đ</strong>
                </Alert>
            )}

            <Card>
                <CardBody>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Biển số</th>
                                <th>Slot</th>
                                <th>Hình thức</th>
                                <th>Giờ vào</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.licensePlate}</td>
                                    <td>{s.slotCode}</td>
                                    <td>{s.sessionType === 'TheoGio' ? 'Theo giờ' : 'Theo ngày'}</td>
                                    <td>{new Date(s.checkInAtUtc).toLocaleString('vi-VN')}</td>
                                    <td><Badge color={statusColor[s.status] || 'secondary'}>{s.status}</Badge></td>
                                    <td>
                                        <Button size="sm" color="danger" outline onClick={() => setCheckOutSession(s)}>
                                            Check-out
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr><td colSpan={6} className="text-center text-muted">Không có xe nào đang gửi.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            <CheckInModal isOpen={checkInOpen} toggle={() => setCheckInOpen(false)} onSuccess={load} />
            <CheckOutModal
                session={checkOutSession}
                toggle={() => setCheckOutSession(null)}
                onSuccess={(receipt) => { setLastReceipt(receipt); load(); }}
            />
        </Container>
    );
};

export default Sessions;
