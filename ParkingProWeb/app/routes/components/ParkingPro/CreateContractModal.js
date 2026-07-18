import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput, Alert, Button
} from './../../../components';

import { createContract } from './../../../api/contracts';
import { DEFAULT_PARKING_LOT_ID } from './../../../config/parkingLot';

/**
 * Tạo hợp đồng vé tháng. Dùng chung cho trang Vé tháng và menu "Tạo hợp đồng" trên sơ đồ bãi xe
 * (khi đó truyền sẵn preferredSlotId/preferredSlotCode để gán cố định slot đang chọn).
 */
const CreateContractModal = ({ isOpen, toggle, onSuccess, preferredSlotId, preferredSlotCode }) => {
    const [customerUserId, setCustomerUserId] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [numberOfMonths, setNumberOfMonths] = useState(1);
    const [autoRenew, setAutoRenew] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCustomerUserId('');
            setLicensePlate('');
            setPhotoFile(null);
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await createContract({
                parkingLotId: DEFAULT_PARKING_LOT_ID,
                customerUserId,
                licensePlate,
                fixedSlotId: preferredSlotId,
                startDate,
                numberOfMonths,
                autoRenew,
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
                    Tạo hợp đồng vé tháng{preferredSlotCode ? ` — Slot ${preferredSlotCode}` : ''}
                </ModalHeader>
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

export default CreateContractModal;
