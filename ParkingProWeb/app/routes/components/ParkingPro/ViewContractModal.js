import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter, Alert, Button, Badge
} from './../../../components';

import { getContractBySlot, renewContract, cancelContract } from './../../../api/contracts';
import { getApiBaseUrl } from './../../../api/http';
import EditContractModal from './EditContractModal';

const statusColor = { DangHoatDong: 'success', SapHetHan: 'warning', HetHan: 'secondary', DaHuy: 'danger' };
const statusLabel = { DangHoatDong: 'Đang hoạt động', SapHetHan: 'Sắp hết hạn', HetHan: 'Hết hạn', DaHuy: 'Đã hủy' };
const resolvePhotoUrl = (url) => (url ? (url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`) : null);

/** Xem hợp đồng vé tháng gắn với 1 slot — dùng cho menu "Xem HĐ" trên sơ đồ bãi xe. */
const ViewContractModal = ({ slotId, toggle, onChanged }) => {
    const [contract, setContract] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        if (!slotId) return;
        setLoading(true);
        setError(null);
        getContractBySlot(slotId)
            .then((c) => setContract(c))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [slotId]);

    const handleRenew = async () => {
        const months = window.prompt('Gia hạn thêm bao nhiêu tháng?', '1');
        if (!months) return;
        try {
            const updated = await renewContract(contract.id, Number(months));
            setContract(updated);
            onChanged();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Xác nhận hủy hợp đồng này?')) return;
        try {
            await cancelContract(contract.id);
            onChanged();
            toggle();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Modal isOpen={!!slotId} toggle={toggle}>
            <ModalHeader toggle={toggle}>Hợp đồng vé tháng</ModalHeader>
            <ModalBody>
                {error && <Alert color="danger">{error}</Alert>}
                {loading && <p className="text-muted">Đang tải...</p>}
                {contract && (
                    <div className="text-center">
                        <img
                            src={resolvePhotoUrl(contract.vehiclePhotoUrl)}
                            alt={contract.licensePlate}
                            style={{ width: 160, height: 110, objectFit: 'cover', borderRadius: 6 }}
                            className="mb-3"
                        />
                        <h5>{contract.licensePlate}</h5>
                        <p className="mb-1">Khách hàng: <strong>{contract.customerName}</strong></p>
                        <p className="mb-1">Slot cố định: {contract.fixedSlotCode || '-'}</p>
                        <p className="mb-1">Hiệu lực: {contract.startDate} → {contract.endDate}</p>
                        <p className="mb-1">Phí/tháng: {contract.monthlyFee.toLocaleString('vi-VN')} đ</p>
                        <p className="mb-1">Tự động gia hạn: {contract.autoRenew ? 'Có' : 'Không'}</p>
                        <Badge color={statusColor[contract.status] || 'secondary'} className="mt-2">
                            {statusLabel[contract.status] || contract.status}
                        </Badge>
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Đóng</Button>
                {contract && contract.status !== 'DaHuy' && (
                    <>
                        <Button color="secondary" outline onClick={() => setEditOpen(true)}>Sửa</Button>
                        <Button color="primary" outline onClick={handleRenew}>Gia hạn</Button>
                        <Button color="danger" outline onClick={handleCancel}>Hủy hợp đồng</Button>
                    </>
                )}
            </ModalFooter>
            <EditContractModal
                contract={editOpen ? contract : null}
                toggle={() => setEditOpen(false)}
                onSuccess={() => {
                    onChanged();
                    toggle();
                }}
            />
        </Modal>
    );
};

export default ViewContractModal;
