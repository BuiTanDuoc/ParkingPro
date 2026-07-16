import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, Alert, Badge } from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import { getSlotStatuses } from './../../api/slots';
import { connectToParkingHub, disconnectFromParkingHub } from './../../api/signalr';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const statusColor = {
    Trong: 'success',
    DangDauXe: 'danger',
    DaDatTruoc: 'warning',
    BaoTri: 'secondary',
};
const statusLabel = {
    Trong: 'Trống',
    DangDauXe: 'Đang có xe',
    DaDatTruoc: 'Đã đặt trước',
    BaoTri: 'Bảo trì',
};

const ParkingMap = () => {
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState(null);

    const loadSlots = useCallback(() => {
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }
        getSlotStatuses(DEFAULT_PARKING_LOT_ID).then(setSlots).catch((err) => setError(err.message));
    }, []);

    useEffect(() => {
        loadSlots();

        if (!DEFAULT_PARKING_LOT_ID) return undefined;

        let hubConnection;
        connectToParkingHub(DEFAULT_PARKING_LOT_ID).then((connection) => {
            hubConnection = connection;
            // Backend phát 3 sự kiện: SlotStatusChanged, SessionCheckedIn, SessionCheckedOut
            // — cả 3 đều có thể ảnh hưởng tới trạng thái slot nên đơn giản nhất là load lại toàn bộ.
            connection.on('SlotStatusChanged', loadSlots);
            connection.on('SessionCheckedIn', loadSlots);
            connection.on('SessionCheckedOut', loadSlots);
        }).catch((err) => setError(`Không kết nối được realtime: ${err.message}`));

        return () => {
            disconnectFromParkingHub();
        };
    }, [loadSlots]);

    // Nhóm slot theo khu vực (ZoneName) để hiển thị từng khối riêng
    const groupedByZone = slots.reduce((acc, slot) => {
        (acc[slot.zoneName] = acc[slot.zoneName] || []).push(slot);
        return acc;
    }, {});

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={12}>
                    <HeaderMain title="Sơ đồ bãi xe (realtime)" className="mb-4 mb-lg-3" />
                </Col>
            </Row>

            {error && <Alert color="warning">{error}</Alert>}

            {Object.entries(groupedByZone).map(([zoneName, zoneSlots]) => (
                <Card className="mb-3" key={zoneName}>
                    <CardBody>
                        <h6 className="mb-3">{zoneName}</h6>
                        <Row>
                            {zoneSlots.map((slot) => (
                                <Col xs={4} sm={3} md={2} lg={2} className="mb-3" key={slot.slotId}>
                                    <div
                                        className={`p-2 text-center rounded border border-${statusColor[slot.status] || 'secondary'}`}
                                        title={slot.currentLicensePlate || ''}
                                    >
                                        <div className="font-weight-bold">{slot.code}</div>
                                        <Badge color={statusColor[slot.status] || 'secondary'} className="mt-1">
                                            {statusLabel[slot.status] || slot.status}
                                        </Badge>
                                        {slot.currentLicensePlate && (
                                            <div className="small text-muted mt-1">{slot.currentLicensePlate}</div>
                                        )}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </CardBody>
                </Card>
            ))}
        </Container>
    );
};

export default ParkingMap;
