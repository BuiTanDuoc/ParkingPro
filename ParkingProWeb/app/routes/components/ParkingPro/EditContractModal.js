import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput, Alert, Button
} from './../../../components';

import { updateContract } from './../../../api/contracts';
import { getSlotStatuses } from './../../../api/slots';
import { getAllUsers } from './../../../api/users';
import { DEFAULT_PARKING_LOT_ID } from './../../../config/parkingLot';

/**
 * Sửa hợp đồng vé tháng đang có: biển số xe, tự động gia hạn, slot cố định (gán/đổi/bỏ),
 * và đổi khách hàng (chọn khách có sẵn hoặc tạo mới).
 */
const EditContractModal = ({ contract, toggle, onSuccess }) => {
    const [licensePlate, setLicensePlate] = useState('');
    const [autoRenew, setAutoRenew] = useState(false);

    const [slots, setSlots] = useState([]);
    const [fixedSlotId, setFixedSlotId] = useState('');

    const [changeCustomer, setChangeCustomer] = useState(false);
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
        if (!contract) return;

        setLicensePlate(contract.licensePlate || '');
        setAutoRenew(!!contract.autoRenew);
        setFixedSlotId(contract.fixedSlotId || '');
        setError(null);
        setChangeCustomer(false);
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
    }, [contract]);

    if (!contract) return null;

    // Slot hiện tại của hợp đồng vẫn hiển thị được (dù trạng thái đang là DaDatTruoc, không phải Trong)
    const availableSlots = slots.filter((s) => s.status === 'Trong' || s.slotId === contract.fixedSlotId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (changeCustomer && !createNewCustomer && !customerUserId) {
            setError('Vui lòng chọn khách hàng hoặc chọn "Tạo khách hàng mới".');
            return;
        }
        if (changeCustomer && createNewCustomer && (!newCustomerFullName || !newCustomerEmail || !newCustomerPassword)) {
            setError('Vui lòng nhập đủ họ tên, email và mật khẩu cho khách hàng mới.');
            return;
        }

        setSubmitting(true);
        try {
            await updateContract(contract.id, {
                licensePlate,
                autoRenew,
                fixedSlotId: fixedSlotId || null,
                customerUserId: changeCustomer && !createNewCustomer ? customerUserId : null,
                newCustomerFullName: changeCustomer && createNewCustomer ? newCustomerFullName : null,
                newCustomerEmail: changeCustomer && createNewCustomer ? newCustomerEmail : null,
                newCustomerPassword: changeCustomer && createNewCustomer ? newCustomerPassword : null,
                newCustomerPhoneNumber: changeCustomer && createNewCustomer ? newCustomerPhoneNumber : null,
            });
            onSuccess();
            toggle();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={!!contract} toggle={toggle}>
            <Form onSubmit={handleSubmit}>
                <ModalHeader toggle={toggle}>Sửa hợp đồng vé tháng — {contract.licensePlate}</ModalHeader>
                <ModalBody>
                    {error && <Alert color="danger">{error}</Alert>}

                    <FormGroup>
                        <Label>Biển số xe</Label>
                        <Input value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required />
                    </FormGroup>

                    <FormGroup>
                        <Label>Slot cố định</Label>
                        <CustomInput type="select" value={fixedSlotId} onChange={(e) => setFixedSlotId(e.target.value)}>
                            <option value="">-- Không gán slot cố định (slot tự do) --</option>
                            {availableSlots.map((s) => (
                                <option key={s.slotId} value={s.slotId}>{s.code} ({s.zoneName})</option>
                            ))}
                        </CustomInput>
                        <small className="text-muted">Chỉ hiển thị slot đang trống (và slot hiện tại của hợp đồng này).</small>
                    </FormGroup>

                    <FormGroup>
                        <CustomInput
                            type="checkbox"
                            id="editAutoRenew"
                            label="Tự động gia hạn"
                            checked={autoRenew}
                            onChange={(e) => setAutoRenew(e.target.checked)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <CustomInput
                            type="switch"
                            id="changeCustomerSwitch"
                            label={`Đổi khách hàng (hiện tại: ${contract.customerName})`}
                            checked={changeCustomer}
                            onChange={(e) => setChangeCustomer(e.target.checked)}
                        />
                    </FormGroup>

                    {changeCustomer && (
                        <>
                            <FormGroup>
                                <CustomInput
                                    type="switch"
                                    id="createNewCustomerSwitchEdit"
                                    label="Tạo tài khoản khách hàng mới"
                                    checked={createNewCustomer}
                                    onChange={(e) => setCreateNewCustomer(e.target.checked)}
                                />
                            </FormGroup>

                            {!createNewCustomer && (
                                <FormGroup>
                                    <Label>Khách hàng mới</Label>
                                    <CustomInput
                                        type="select"
                                        value={customerUserId}
                                        onChange={(e) => setCustomerUserId(e.target.value)}
                                    >
                                        <option value="">-- Chọn khách hàng --</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                                        ))}
                                    </CustomInput>
                                </FormGroup>
                            )}

                            {createNewCustomer && (
                                <>
                                    <FormGroup>
                                        <Label>Họ tên khách hàng</Label>
                                        <Input value={newCustomerFullName} onChange={(e) => setNewCustomerFullName(e.target.value)} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Tên đăng nhập (Email)</Label>
                                        <Input type="email" value={newCustomerEmail} onChange={(e) => setNewCustomerEmail(e.target.value)} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Mật khẩu</Label>
                                        <Input type="password" value={newCustomerPassword} onChange={(e) => setNewCustomerPassword(e.target.value)} minLength={6} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Số điện thoại (không bắt buộc)</Label>
                                        <Input value={newCustomerPhoneNumber} onChange={(e) => setNewCustomerPhoneNumber(e.target.value)} />
                                    </FormGroup>
                                </>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" type="button" onClick={toggle}>Hủy</Button>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default EditContractModal;
