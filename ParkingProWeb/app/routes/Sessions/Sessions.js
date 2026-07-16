import React, { useEffect, useState } from 'react';
import {
    Container, Row, Col, Card, CardBody, Table, Badge, Button,
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput, Alert
} from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import { getActiveSessions, checkIn, checkOut } from './../../api/sessions';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const statusColor = { DangGuiXe: 'warning', DaThanhToan: 'success', DaHuy: 'secondary' };

const CheckInModal = ({ isOpen, toggle, onSuccess }) => {
    const [licensePlate, setLicensePlate] = useState('');
    const [vehicleType, setVehicleType] = useState('OToDuoi7Cho');
    const [sessionType, setSessionType] = useState('TheoGio');
    const [photoFile, setPhotoFile] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await checkIn({
                parkingLotId: DEFAULT_PARKING_LOT_ID,
                licensePlate,
                vehicleType,
                sessionType,
            }, photoFile);
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
                <ModalHeader toggle={toggle}>Check-in xe</ModalHeader>
                <ModalBody>
                    {error && <Alert color="danger">{error}</Alert>}
                    <FormGroup>
                        <Label>Biển số xe</Label>
                        <Input value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required placeholder="51A-12345" />
                    </FormGroup>
                    <FormGroup>
                        <Label>Loại xe</Label>
                        <CustomInput type="select" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                            <option value="OToDuoi7Cho">Ô tô dưới 7 chỗ</option>
                            <option value="OToTren7Cho">Ô tô trên 7 chỗ</option>
                            <option value="XeTai">Xe tải</option>
                        </CustomInput>
                    </FormGroup>
                    <FormGroup>
                        <Label>Hình thức gửi</Label>
                        <CustomInput type="select" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                            <option value="TheoGio">Theo giờ</option>
                            <option value="TheoNgay">Theo ngày</option>
                        </CustomInput>
                    </FormGroup>
                    <FormGroup>
                        <Label>Ảnh check-in (không bắt buộc)</Label>
                        <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0] || null)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle} type="button">Hủy</Button>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : 'Check-in'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

const CheckOutModal = ({ session, toggle, onSuccess }) => {
    const [photoFile, setPhotoFile] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const result = await checkOut(session.id, photoFile);
            onSuccess(result);
            toggle();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={!!session} toggle={toggle}>
            <Form onSubmit={handleSubmit}>
                <ModalHeader toggle={toggle}>Check-out xe {session?.licensePlate}</ModalHeader>
                <ModalBody>
                    {error && <Alert color="danger">{error}</Alert>}
                    <FormGroup>
                        <Label>Ảnh check-out (không bắt buộc)</Label>
                        <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0] || null)} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle} type="button">Hủy</Button>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : 'Xác nhận check-out'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

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
