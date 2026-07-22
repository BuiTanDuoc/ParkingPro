import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput, Alert, Button
} from './../../../components';

import { createContract } from './../../../api/contracts';
import { getSlotStatuses } from './../../../api/slots';
import { getAllUsers } from './../../../api/users';
import { DEFAULT_PARKING_LOT_ID } from './../../../config/parkingLot';

/**
 * Tạo hợp đồng vé tháng. Dùng chung cho trang Vé tháng và menu "Tạo hợp đồng" trên sơ đồ bãi xe
 * (khi đó truyền sẵn preferredSlotId/preferredSlotCode để chọn sẵn slot đang bấm — vẫn có thể đổi lại).
 */
const CreateContractModal = ({ isOpen, toggle, onSuccess, preferredSlotId, preferredSlotCode }) => {
    const [licensePlate, setLicensePlate] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [numberOfMonths, setNumberOfMonths] = useState(1);
    const [autoRenew, setAutoRenew] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);

    const [slots, setSlots] = useState([]);
    const [fixedSlotId, setFixedSlotId] = useState('');

    const [createNewCustomer, setCreateNewCustomer] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [customerUserId, setCustomerUserId] = useState('');
    const [newCustomerFullName, setNewCustomerFullName] = useState('');
    const [newCustomerEmail, setNewCustomerEmail] = useState('');
    const [newCustomerPassword, setNewCustomerPassword] = useState('');
    const [newCustomerPhoneNumber, setNewCustomerPhoneNumber] = useState('');

    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setLicensePlate('');
        setPhotoFile(null);
        setError(null);
        setFixedSlotId(preferredSlotId || '');
        setCreateNewCustomer(false);
        setCustomerUserId('');
        setNewCustomerFullName('');
        setNewCustomerEmail('');
        setNewCustomerPassword('');
        setNewCustomerPhoneNumber('');

        if (DEFAULT_PARKING_LOT_ID) {
            getSlotStatuses(DEFAULT_PARKING_LOT_ID).then(setSlots).catch(() => {});
        }
        getAllUsers('Customer', 1, 200).then((res) => setCustomers(res.items)).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, preferredSlotId]);

    const availableSlots = slots.filter((s) => s.status === 'Trong' || s.slotId === preferredSlotId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!createNewCustomer && !customerUserId) {
            setError('Vui lòng chọn khách hàng hoặc chọn "Tạo khách hàng mới".');
            return;
        }
        if (createNewCustomer && (!newCustomerFullName || !newCustomerEmail || !newCustomerPassword)) {
            setError('Vui lòng nhập đủ họ tên, email và mật khẩu cho khách hàng mới.');
            return;
        }

        setSubmitting(true);
        try {
            await createContract({
                parkingLotId: DEFAULT_PARKING_LOT_ID,
                customerUserId: createNewCustomer ? undefined : customerUserId,
                newCustomerFullName: createNewCustomer ? newCustomerFullName : undefined,
                newCustomerEmail: createNewCustomer ? newCustomerEmail : undefined,
                newCustomerPassword: createNewCustomer ? newCustomerPassword : undefined,
                newCustomerPhoneNumber: createNewCustomer ? newCustomerPhoneNumber : undefined,
                licensePlate,
                fixedSlotId: fixedSlotId || undefined,
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
                        <CustomInput
                            type="switch"
                            id="createNewCustomerSwitch"
                            label="Tạo tài khoản khách hàng mới"
                            checked={createNewCustomer}
                            onChange={(e) => setCreateNewCustomer(e.target.checked)}
                        />
                    </FormGroup>

                    {!createNewCustomer && (
                        <FormGroup>
                            <Label>Khách hàng</Label>
                            <CustomInput
                                type="select"
                                value={customerUserId}
                                onChange={(e) => setCustomerUserId(e.target.value)}
                                required={!createNewCustomer}
                            >
                                <option value="">-- Chọn khách hàng --</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                                ))}
                            </CustomInput>
                            {customers.length === 0 && (
                                <small className="text-muted">
                                    Chưa có khách hàng nào — bật "Tạo tài khoản khách hàng mới" ở trên để tạo mới.
                                </small>
                            )}
                        </FormGroup>
                    )}

                    {createNewCustomer && (
                        <>
                            <FormGroup>
                                <Label>Họ tên khách hàng</Label>
                                <Input
                                    value={newCustomerFullName}
                                    onChange={(e) => setNewCustomerFullName(e.target.value)}
                                    required={createNewCustomer}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Tên đăng nhập (Email)</Label>
                                <Input
                                    type="email"
                                    value={newCustomerEmail}
                                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                                    required={createNewCustomer}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Mật khẩu</Label>
                                <Input
                                    type="password"
                                    value={newCustomerPassword}
                                    onChange={(e) => setNewCustomerPassword(e.target.value)}
                                    required={createNewCustomer}
                                    minLength={6}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Số điện thoại (không bắt buộc)</Label>
                                <Input
                                    value={newCustomerPhoneNumber}
                                    onChange={(e) => setNewCustomerPhoneNumber(e.target.value)}
                                />
                            </FormGroup>
                        </>
                    )}

                    <FormGroup>
                        <Label>Biển số xe</Label>
                        <Input value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required placeholder="51A-12345" />
                    </FormGroup>

                    <FormGroup>
                        <Label>Slot cố định (không bắt buộc)</Label>
                        <CustomInput type="select" value={fixedSlotId} onChange={(e) => setFixedSlotId(e.target.value)}>
                            <option value="">-- Dùng slot tự do, gán sau --</option>
                            {availableSlots.map((s) => (
                                <option key={s.slotId} value={s.slotId}>{s.code} ({s.zoneName})</option>
                            ))}
                        </CustomInput>
                        <small className="text-muted">Chỉ hiển thị các slot đang trống. Có thể để trống và gán sau khi sửa hợp đồng.</small>
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
