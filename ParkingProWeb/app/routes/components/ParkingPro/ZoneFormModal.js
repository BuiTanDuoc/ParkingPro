import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Button
} from './../../../components';

import { createZone, updateZone } from './../../../api/slots';
import { DEFAULT_PARKING_LOT_ID } from './../../../config/parkingLot';

/**
 * Tạo/sửa khu vực (Zone).
 * @param {object|null} editingZone - null = tạo mới. Có giá trị = sửa (object có id, name, floor, description).
 */
const ZoneFormModal = ({ isOpen, toggle, editingZone, onSuccess }) => {
    const [name, setName] = useState('');
    const [floor, setFloor] = useState(0);
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (editingZone) {
            setName(editingZone.name);
            setFloor(editingZone.floor);
            setDescription(editingZone.description || '');
        } else {
            setName('');
            setFloor(0);
            setDescription('');
        }
        setError(null);
    }, [editingZone, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (editingZone) {
                await updateZone(editingZone.id, { name, floor: Number(floor), description });
            } else {
                await createZone({ parkingLotId: DEFAULT_PARKING_LOT_ID, name, floor: Number(floor), description });
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
                <ModalHeader toggle={toggle}>{editingZone ? `Sửa khu vực ${editingZone.name}` : 'Tạo khu vực mới'}</ModalHeader>
                <ModalBody>
                    {error && <Alert color="danger">{error}</Alert>}
                    <FormGroup>
                        <Label>Tên khu vực</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tầng 2, Khu B..." required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Số tầng (dùng để sắp xếp thứ tự hiển thị)</Label>
                        <Input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Mô tả</Label>
                        <Input
                            type="textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ghi chú thêm về khu vực..."
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" type="button" onClick={toggle}>Hủy</Button>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : editingZone ? 'Lưu thay đổi' : 'Tạo khu vực'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default ZoneFormModal;
