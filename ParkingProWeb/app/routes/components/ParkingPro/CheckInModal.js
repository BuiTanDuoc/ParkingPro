import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput, Alert, Button
} from './../../../components';

import { checkIn } from './../../../api/sessions';
import { getSlotStatuses } from './../../../api/slots';
import { DEFAULT_PARKING_LOT_ID } from './../../../config/parkingLot';

/**
 * Modal check-in xe. Dùng chung cho trang Sessions (chọn slot tự do trong danh sách trống, hoặc để trống
 * cho backend tự chọn) và menu trên sơ đồ bãi xe (chọn sẵn preferredSlotId — vẫn có thể đổi lại).
 */
const CheckInModal = ({ isOpen, toggle, onSuccess, preferredSlotId, preferredSlotCode }) => {
    const [licensePlate, setLicensePlate] = useState('');
    const [vehicleType, setVehicleType] = useState('OToDuoi7Cho');
    const [sessionType, setSessionType] = useState('TheoGio');
    const [photoFile, setPhotoFile] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLicensePlate('');
            setPhotoFile(null);
            setError(null);
            setSelectedSlotId(preferredSlotId || '');

            if (DEFAULT_PARKING_LOT_ID) {
                getSlotStatuses(DEFAULT_PARKING_LOT_ID).then(setSlots).catch(() => {});
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, preferredSlotId]);

    const availableSlots = slots.filter(
        (s) => (s.status === 'Trong' && s.type !== 'DanhChoVeThang') || s.slotId === preferredSlotId
    );

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
                preferredSlotId: selectedSlotId || undefined,
            }, photoFile);
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
                <ModalHeader toggle={toggle}>
                    Check-in xe{preferredSlotCode ? ` — Slot ${preferredSlotCode}` : ''}
                </ModalHeader>
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
                        <Label>Slot (không bắt buộc)</Label>
                        <CustomInput type="select" value={selectedSlotId} onChange={(e) => setSelectedSlotId(e.target.value)}>
                            <option value="">-- Tự động chọn slot trống --</option>
                            {availableSlots.map((s) => (
                                <option key={s.slotId} value={s.slotId}>{s.code} ({s.zoneName})</option>
                            ))}
                        </CustomInput>
                        <small className="text-muted">Chỉ hiển thị slot đang trống. Để trống thì hệ thống tự chọn slot trống đầu tiên.</small>
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

export default CheckInModal;
