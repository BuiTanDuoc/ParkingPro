import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Badge } from './../../../components';
import { getApiBaseUrl } from './../../../api/http';

const statusColor = { DangHoatDong: 'success', SapHetHan: 'warning', HetHan: 'secondary', DaHuy: 'danger' };
const statusLabel = { DangHoatDong: 'Đang hoạt động', SapHetHan: 'Sắp hết hạn', HetHan: 'Hết hạn', DaHuy: 'Đã hủy' };

const resolvePhotoUrl = (url) => (url ? (url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`) : null);

const Row = ({ label, children }) => (
    <div className="d-flex justify-content-between border-bottom py-2">
        <span className="text-muted">{label}</span>
        <span className="text-right">{children}</span>
    </div>
);

/** Xem chi tiết hợp đồng (chỉ đọc) — dùng cho cả 2 tab của trang Vé tháng. */
const ContractDetailModal = ({ contract, toggle, onEdit, onRenew, onCancel }) => (
    <Modal isOpen={!!contract} toggle={toggle}>
        {contract && (
            <>
                <ModalHeader toggle={toggle}>Chi tiết hợp đồng — {contract.licensePlate}</ModalHeader>
                <ModalBody>
                    {contract.vehiclePhotoUrl && (
                        <div className="text-center mb-3">
                            <img
                                src={resolvePhotoUrl(contract.vehiclePhotoUrl)}
                                alt={contract.licensePlate}
                                style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6 }}
                            />
                        </div>
                    )}
                    <Row label="Biển số xe">{contract.licensePlate}</Row>
                    <Row label="Khách hàng">{contract.customerName}</Row>
                    <Row label="Slot cố định">{contract.fixedSlotCode || 'Không có (slot tự do)'}</Row>
                    <Row label="Ngày bắt đầu">{contract.startDate}</Row>
                    <Row label="Ngày hết hạn">{contract.endDate}</Row>
                    <Row label="Đơn giá/tháng">{contract.monthlyFee?.toLocaleString('vi-VN')} đ</Row>
                    <Row label="Tự động gia hạn">{contract.autoRenew ? 'Có' : 'Không'}</Row>
                    <Row label="Trạng thái">
                        <Badge color={statusColor[contract.status] || 'secondary'}>
                            {statusLabel[contract.status] || contract.status}
                        </Badge>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>Đóng</Button>
                    {contract.status !== 'DaHuy' && (
                        <>
                            <Button color="secondary" outline onClick={() => onEdit(contract)}>Sửa</Button>
                            <Button color="primary" outline onClick={() => onRenew(contract.id)}>Gia hạn</Button>
                            <Button color="danger" outline onClick={() => onCancel(contract.id)}>Hủy</Button>
                        </>
                    )}
                </ModalFooter>
            </>
        )}
    </Modal>
);

export default ContractDetailModal;
