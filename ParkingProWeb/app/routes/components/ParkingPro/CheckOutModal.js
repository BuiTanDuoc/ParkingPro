import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Button
} from './../../../components';

import { checkOut } from './../../../api/sessions';

/**
 * Modal check-out xe. Dùng chung cho trang Sessions và menu trên sơ đồ bãi xe.
 * @param {object} session - { id, licensePlate } — null thì modal đóng.
 */
const CheckOutModal = ({ session, toggle, onSuccess }) => {
    const [photoFile, setPhotoFile] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (session) {
            setPhotoFile(null);
            setError(null);
        }
    }, [session]);

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

export default CheckOutModal;
