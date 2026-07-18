import React, { useEffect, useState, useCallback } from 'react';
import {
    Container, Row, Col, Card, CardBody, Alert, Badge,
    UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem
} from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import SlotFormModal from '../components/ParkingPro/SlotFormModal';
import CheckInModal from '../components/ParkingPro/CheckInModal';
import CheckOutModal from '../components/ParkingPro/CheckOutModal';
import CreateContractModal from '../components/ParkingPro/CreateContractModal';
import ViewContractModal from '../components/ParkingPro/ViewContractModal';

import { getSlotStatuses, setSlotMaintenance, getZones } from './../../api/slots';
import { getActiveSessionBySlot } from './../../api/sessions';
import { connectToParkingHub, disconnectFromParkingHub } from './../../api/signalr';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const statusColor = { Trong: 'success', DangDauXe: 'danger', DaDatTruoc: 'warning', BaoTri: 'secondary' };
const statusLabel = { Trong: 'Trống', DangDauXe: 'Đang có xe', DaDatTruoc: 'Đã đặt trước', BaoTri: 'Bảo trì' };

// Icon + màu viền riêng theo loại slot — trạng thái (Trống/Đang có xe/...) vẫn thể hiện qua Badge bên dưới,
// còn màu viền/nền ở đây giúp phân biệt loại slot (Thường/VIP/Vé tháng) ngay cả khi cùng trạng thái.
// Dùng inline style cho nền vì Bootstrap 4 mặc định không có class nền màu nhạt (bg-*-light).
const slotTypeIcon = { Thuong: 'fa-car', Vip: 'fa-star', DanhChoVeThang: 'fa-id-card' };
const slotTypeBorderColor = { Thuong: 'secondary', Vip: 'warning', DanhChoVeThang: 'info' };
const slotTypeTextColor = { Thuong: 'text-secondary', Vip: 'text-warning', DanhChoVeThang: 'text-info' };
const slotTypeBgColor = { Thuong: '#f1f2f4', Vip: '#fff6df', DanhChoVeThang: '#e4f3fc' };
const slotTypeLabel = { Thuong: 'Thường', Vip: 'VIP', DanhChoVeThang: 'Dành vé tháng' };

const SlotBox = ({ slot, zones, onChanged, onOpenEdit, onOpenCheckIn, onOpenCheckOut, onOpenCreateContract, onOpenViewContract }) => {
    const isOccupied = slot.status === 'DangDauXe';
    const isMaintenance = slot.status === 'BaoTri';
    const isEmpty = slot.status === 'Trong';
    const isReserved = slot.status === 'DaDatTruoc';

    const handleToggleMaintenance = async () => {
        try {
            await setSlotMaintenance(slot.slotId, !isMaintenance);
            onChanged();
        } catch (err) {
            window.alert(err.message);
        }
    };

    return (
        <div
            className={`p-2 text-center rounded border border-${slotTypeBorderColor[slot.type] || 'secondary'}`}
            style={{ borderWidth: 2, backgroundColor: slotTypeBgColor[slot.type] || '#f8f9fa' }}
        >
            <div className="d-flex justify-content-between align-items-start">
                <i className={`fa ${slotTypeIcon[slot.type] || 'fa-square'} ${slotTypeTextColor[slot.type] || ''}`} title={slotTypeLabel[slot.type]}></i>
                <UncontrolledDropdown size="sm">
                    <DropdownToggle tag="span" style={{ cursor: 'pointer' }}>
                        <i className="fa fa-ellipsis-v text-muted"></i>
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem onClick={() => onOpenEdit(slot)} disabled={isOccupied}>
                            <i className="fa fa-pencil mr-2"></i>Sửa
                        </DropdownItem>
                        <DropdownItem onClick={handleToggleMaintenance} disabled={isOccupied}>
                            <i className="fa fa-wrench mr-2"></i>{isMaintenance ? 'Mở lại hoạt động' : 'Bảo trì'}
                        </DropdownItem>
                        {(isEmpty || isReserved) && <DropdownItem divider />}
                        {isEmpty && (
                            <DropdownItem onClick={() => onOpenCreateContract(slot)}>
                                <i className="fa fa-id-card mr-2"></i>Tạo hợp đồng vé tháng
                            </DropdownItem>
                        )}
                        {isReserved && (
                            <DropdownItem onClick={() => onOpenViewContract(slot)}>
                                <i className="fa fa-id-card mr-2"></i>Xem hợp đồng
                            </DropdownItem>
                        )}
                        {(isEmpty || isOccupied) && <DropdownItem divider />}
                        {isEmpty && (
                            <DropdownItem onClick={() => onOpenCheckIn(slot)}>
                                <i className="fa fa-sign-in mr-2"></i>Check-in
                            </DropdownItem>
                        )}
                        {isOccupied && (
                            <DropdownItem onClick={() => onOpenCheckOut(slot)}>
                                <i className="fa fa-sign-out mr-2"></i>Check-out
                            </DropdownItem>
                        )}
                    </DropdownMenu>
                </UncontrolledDropdown>
            </div>
            <div className="font-weight-bold">{slot.code}</div>
            <Badge color={statusColor[slot.status] || 'secondary'} className="mt-1">
                {statusLabel[slot.status] || slot.status}
            </Badge>
            {slot.currentLicensePlate && (
                <div className="small text-muted mt-1">{slot.currentLicensePlate}</div>
            )}
            {slot.description && (
                <div className="small text-muted mt-1" title={slot.description}>
                    <i className="fa fa-info-circle"></i>
                </div>
            )}
        </div>
    );
};

const ParkingMap = () => {
    const [slots, setSlots] = useState([]);
    const [zones, setZones] = useState([]);
    const [error, setError] = useState(null);

    const [editingSlot, setEditingSlot] = useState(null);
    const [checkInSlot, setCheckInSlot] = useState(null);
    const [checkOutSession, setCheckOutSession] = useState(null);
    const [createContractSlot, setCreateContractSlot] = useState(null);
    const [viewContractSlotId, setViewContractSlotId] = useState(null);

    const loadSlots = useCallback(() => {
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }
        getSlotStatuses(DEFAULT_PARKING_LOT_ID).then(setSlots).catch((err) => setError(err.message));
        getZones(DEFAULT_PARKING_LOT_ID).then(setZones).catch(() => {});
    }, []);

    useEffect(() => {
        loadSlots();

        if (!DEFAULT_PARKING_LOT_ID) return undefined;

        let hubConnection;
        connectToParkingHub(DEFAULT_PARKING_LOT_ID).then((connection) => {
            hubConnection = connection;
            connection.on('SlotStatusChanged', loadSlots);
            connection.on('SessionCheckedIn', loadSlots);
            connection.on('SessionCheckedOut', loadSlots);
        }).catch((err) => setError(`Không kết nối được realtime: ${err.message}`));

        return () => {
            disconnectFromParkingHub();
        };
    }, [loadSlots]);

    const handleOpenCheckOut = async (slot) => {
        try {
            const session = await getActiveSessionBySlot(slot.slotId);
            if (session) setCheckOutSession(session);
            else window.alert('Không tìm thấy phiên gửi xe đang hoạt động cho slot này.');
        } catch (err) {
            window.alert(err.message);
        }
    };

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
                                <Col xs={6} sm={4} md={3} lg={2} className="mb-3" key={slot.slotId}>
                                    <SlotBox
                                        slot={slot}
                                        zones={zones}
                                        onChanged={loadSlots}
                                        onOpenEdit={setEditingSlot}
                                        onOpenCheckIn={setCheckInSlot}
                                        onOpenCheckOut={handleOpenCheckOut}
                                        onOpenCreateContract={setCreateContractSlot}
                                        onOpenViewContract={(slot) => setViewContractSlotId(slot.slotId)}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </CardBody>
                </Card>
            ))}

            <SlotFormModal
                isOpen={!!editingSlot}
                toggle={() => setEditingSlot(null)}
                zones={zones}
                editingSlot={editingSlot}
                onSuccess={loadSlots}
            />
            <CheckInModal
                isOpen={!!checkInSlot}
                toggle={() => setCheckInSlot(null)}
                onSuccess={loadSlots}
                preferredSlotId={checkInSlot?.slotId}
                preferredSlotCode={checkInSlot?.code}
            />
            <CheckOutModal
                session={checkOutSession}
                toggle={() => setCheckOutSession(null)}
                onSuccess={loadSlots}
            />
            <CreateContractModal
                isOpen={!!createContractSlot}
                toggle={() => setCreateContractSlot(null)}
                onSuccess={loadSlots}
                preferredSlotId={createContractSlot?.slotId}
                preferredSlotCode={createContractSlot?.code}
            />
            <ViewContractModal
                slotId={viewContractSlotId}
                toggle={() => setViewContractSlotId(null)}
                onChanged={loadSlots}
            />
        </Container>
    );
};

export default ParkingMap;
