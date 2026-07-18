import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput, Alert, Button
} from './../../../components';

import { createSlot, updateSlot } from './../../../api/slots';

/**
 * Tạo/sửa slot. Dùng chung cho trang Quản lý khu vực & slot và menu "Sửa" trên sơ đồ bãi xe.
 * @param {object|null} editingSlot - null = tạo mới. Có giá trị = sửa (object có slotId, zoneId, code, type, description).
 */
const SlotFormModal = ({ isOpen, toggle, zones, editingSlot, onSuccess, defaultZoneId }) => {
    const [zoneId, setZoneId] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState('Thuong');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (editingSlot) {
            setCode(editingSlot.code);
            setType(editingSlot.type);
            setDescription(editingSlot.description || '');
        } else {
            setCode('');
            setType('Thuong');
            setDescription('');
            setZoneId(defaultZoneId || (zones[0] && zones[0].id) || '');
        }
        setError(null);
    }, [editingSlot, isOpen, zones, defaultZoneId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (editingSlot) {
                await updateSlot(editingSlot.slotId, { code, type, description });
            } else {
                await createSlot({ zoneId, code, type, description });
            }
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
                <ModalHeader toggle={toggle}>{editingSlot ? `Sửa slot ${editingSlot.code}` : 'Tạo slot mới'}</ModalHeader>
                <ModalBody>
                    {error && <Alert color="danger">{error}</Alert>}
                    {!editingSlot && (
                        <FormGroup>
                            <Label>Khu vực</Label>
                            <CustomInput type="select" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
                                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                            </CustomInput>
                        </FormGroup>
                    )}
                    <FormGroup>
                        <Label>Mã slot</Label>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="A-01" required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Loại slot</Label>
                        <CustomInput type="select" value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="Thuong">Thường</option>
                            <option value="Vip">VIP</option>
                            <option value="DanhChoVeThang">Dành vé tháng</option>
                        </CustomInput>
                    </FormGroup>
                    <FormGroup>
                        <Label>Mô tả</Label>
                        <Input
                            type="textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ghi chú thêm về vị trí, đặc điểm slot..."
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" type="button" onClick={toggle}>Hủy</Button>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : editingSlot ? 'Lưu thay đổi' : 'Tạo slot'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default SlotFormModal;
