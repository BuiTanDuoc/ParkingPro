import React, { useEffect, useState, useCallback } from 'react';
import {
    Container, Row, Col, Card, CardBody, Table, Badge, Button, Alert,
    Nav, NavItem, NavLink, TabContent, TabPane, CustomInput, FormGroup, Label, Input,
    Pagination, PaginationItem, PaginationLink,
} from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import CreateContractModal from '../components/ParkingPro/CreateContractModal';
import EditContractModal from '../components/ParkingPro/EditContractModal';
import ContractDetailModal from '../components/ParkingPro/ContractDetailModal';
import { getExpiringSoon, getAllContracts, renewContract, cancelContract } from './../../api/contracts';
import { getApiBaseUrl } from './../../api/http';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const statusColor = { DangHoatDong: 'success', SapHetHan: 'warning', HetHan: 'secondary', DaHuy: 'danger' };
const statusLabel = { DangHoatDong: 'Đang hoạt động', SapHetHan: 'Sắp hết hạn', HetHan: 'Hết hạn', DaHuy: 'Đã hủy' };

const resolvePhotoUrl = (url) => (url ? (url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`) : null);

/**
 * Màu nổi bật theo hạn hợp đồng:
 * - Sắp hết hạn (còn <= 3 ngày): vàng cảnh báo
 * - Đã hết hạn <= 3 ngày: đỏ (cần xử lý ngay)
 * - Đã hết hạn > 3 ngày: xám (đã cũ, ít khẩn cấp hơn)
 */
const getRowClass = (contract) => {
    if (contract.status === 'DaHuy') return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(contract.endDate);
    const diffDays = Math.round((end - today) / 86400000);

    if (diffDays >= 0 && diffDays <= 3) return 'table-warning';
    if (diffDays < 0 && diffDays >= -3) return 'table-danger';
    if (diffDays < -3) return 'table-secondary';
    return '';
};

const ContractsTable = ({ contracts, onViewDetail, onEdit, onRenew, onCancel, emptyMessage }) => (
    <Table responsive hover>
        <thead>
            <tr>
                <th>Ảnh xe</th>
                <th>Biển số</th>
                <th>Khách hàng</th>
                <th>Slot cố định</th>
                <th>Hết hạn</th>
                <th>Trạng thái</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {contracts.map((c) => (
                <tr key={c.id} className={getRowClass(c)}>
                    <td>
                        <img
                            src={resolvePhotoUrl(c.vehiclePhotoUrl)}
                            alt={c.licensePlate}
                            style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }}
                        />
                    </td>
                    <td>{c.licensePlate}</td>
                    <td>{c.customerName}</td>
                    <td>{c.fixedSlotCode || '-'}</td>
                    <td>{c.endDate}</td>
                    <td><Badge color={statusColor[c.status] || 'secondary'}>{statusLabel[c.status] || c.status}</Badge></td>
                    <td className="text-nowrap">
                        <Button size="sm" color="info" outline className="mr-2" onClick={() => onViewDetail(c)}>
                            Chi tiết
                        </Button>
                        <Button size="sm" color="secondary" outline className="mr-2" onClick={() => onEdit(c)}>
                            Sửa
                        </Button>
                        {c.status !== 'DaHuy' && (
                            <>
                                <Button size="sm" color="primary" outline className="mr-2" onClick={() => onRenew(c.id)}>
                                    Gia hạn
                                </Button>
                                <Button size="sm" color="danger" outline onClick={() => onCancel(c.id)}>
                                    Hủy
                                </Button>
                            </>
                        )}
                    </td>
                </tr>
            ))}
            {contracts.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted">{emptyMessage}</td></tr>
            )}
        </tbody>
    </Table>
);

const PagerControls = ({ pageNumber, pageSize, totalCount, onPageChange }) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (totalPages <= 1) return null;

    const pages = [];
    for (let p = 1; p <= totalPages; p += 1) pages.push(p);

    return (
        <Pagination className="mt-3 mb-0 justify-content-center">
            <PaginationItem disabled={pageNumber <= 1}>
                <PaginationLink previous onClick={() => onPageChange(pageNumber - 1)} />
            </PaginationItem>
            {pages.map((p) => (
                <PaginationItem key={p} active={p === pageNumber}>
                    <PaginationLink onClick={() => onPageChange(p)}>{p}</PaginationLink>
                </PaginationItem>
            ))}
            <PaginationItem disabled={pageNumber >= totalPages}>
                <PaginationLink next onClick={() => onPageChange(pageNumber + 1)} />
            </PaginationItem>
        </Pagination>
    );
};

const MonthlyContracts = () => {
    const [activeTab, setActiveTab] = useState('expiring');
    const [error, setError] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editingContract, setEditingContract] = useState(null);
    const [detailContract, setDetailContract] = useState(null);

    // Tab 1: HĐ sắp hết hạn (như cũ)
    const [expiringContracts, setExpiringContracts] = useState([]);

    // Tab 2: Quản lý hợp đồng
    const [allContracts, setAllContracts] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [maxExpiredMonths, setMaxExpiredMonths] = useState('1');
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const loadExpiring = useCallback(() => {
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }
        getExpiringSoon(DEFAULT_PARKING_LOT_ID, 30).then((res) => setExpiringContracts(res.items)).catch((err) => setError(err.message));
    }, []);

    const loadAll = useCallback(() => {
        if (!DEFAULT_PARKING_LOT_ID) return;
        getAllContracts(DEFAULT_PARKING_LOT_ID, {
            status: statusFilter || undefined,
            search: appliedSearch || undefined,
            maxExpiredMonths: maxExpiredMonths === '' ? null : Number(maxExpiredMonths),
            pageNumber,
            pageSize,
        })
            .then((res) => {
                setAllContracts(res.items);
                setTotalCount(res.totalCount);
            })
            .catch((err) => setError(err.message));
    }, [statusFilter, appliedSearch, maxExpiredMonths, pageNumber, pageSize]);

    const loadActiveTab = useCallback(() => {
        if (activeTab === 'expiring') loadExpiring();
        else loadAll();
    }, [activeTab, loadExpiring, loadAll]);

    useEffect(loadExpiring, [loadExpiring]);
    useEffect(() => {
        if (activeTab === 'all') loadAll();
    }, [activeTab, loadAll]);

    // Đổi filter thì luôn quay về trang 1
    useEffect(() => {
        setPageNumber(1);
    }, [statusFilter, appliedSearch, maxExpiredMonths]);

    const handleRenew = async (id) => {
        const months = window.prompt('Gia hạn thêm bao nhiêu tháng?', '1');
        if (!months) return;
        try {
            await renewContract(id, Number(months));
            loadActiveTab();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Xác nhận hủy hợp đồng này?')) return;
        try {
            await cancelContract(id);
            loadActiveTab();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={8}>
                    <HeaderMain title="Vé tháng" className="mb-4 mb-lg-3" />
                </Col>
                <Col lg={4} className="d-flex align-items-center justify-content-lg-end mb-3">
                    <Button color="primary" onClick={() => setCreateOpen(true)}>
                        <i className="fa fa-plus mr-2"></i>Tạo hợp đồng
                    </Button>
                </Col>
            </Row>

            {error && <Alert color="warning">{error}</Alert>}

            <Nav tabs className="mb-3">
                <NavItem>
                    <NavLink active={activeTab === 'expiring'} onClick={() => setActiveTab('expiring')} style={{ cursor: 'pointer' }}>
                        HĐ sắp hết hạn
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink active={activeTab === 'all'} onClick={() => setActiveTab('all')} style={{ cursor: 'pointer' }}>
                        Quản lý hợp đồng
                    </NavLink>
                </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
                <TabPane tabId="expiring">
                    <Card>
                        <CardBody>
                            <p className="text-muted small mb-3">
                                Danh sách hợp đồng đang hoạt động hoặc sắp/đã hết hạn trong 30 ngày qua.
                            </p>
                            <ContractsTable
                                contracts={expiringContracts}
                                onViewDetail={setDetailContract}
                                onEdit={setEditingContract}
                                onRenew={handleRenew}
                                onCancel={handleCancel}
                                emptyMessage="Không có hợp đồng nào sắp/đã hết hạn."
                            />
                        </CardBody>
                    </Card>
                </TabPane>

                <TabPane tabId="all">
                    <Card>
                        <CardBody>
                            <Row className="mb-3">
                                <Col md={3} className="mb-2">
                                    <FormGroup className="mb-0">
                                        <Label className="small text-muted mb-1">Trạng thái</Label>
                                        <CustomInput type="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                            <option value="">Tất cả</option>
                                            <option value="DangHoatDong">Đang hoạt động</option>
                                            <option value="SapHetHan">Sắp hết hạn</option>
                                            <option value="HetHan">Hết hạn</option>
                                            <option value="DaHuy">Đã hủy</option>
                                        </CustomInput>
                                    </FormGroup>
                                </Col>
                                <Col md={3} className="mb-2">
                                    <FormGroup className="mb-0">
                                        <Label className="small text-muted mb-1">Hợp đồng hết hạn trong vòng</Label>
                                        <CustomInput type="select" value={maxExpiredMonths} onChange={(e) => setMaxExpiredMonths(e.target.value)}>
                                            <option value="1">1 tháng gần đây</option>
                                            <option value="3">3 tháng gần đây</option>
                                            <option value="6">6 tháng gần đây</option>
                                            <option value="12">12 tháng gần đây</option>
                                            <option value="">Tất cả (không giới hạn)</option>
                                        </CustomInput>
                                    </FormGroup>
                                </Col>
                                <Col md={4} className="mb-2">
                                    <FormGroup className="mb-0">
                                        <Label className="small text-muted mb-1">Tìm kiếm</Label>
                                        <Input
                                            placeholder="Biển số xe hoặc tên khách hàng..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') setAppliedSearch(searchInput); }}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={2} className="mb-2 d-flex align-items-end">
                                    <Button color="secondary" outline block onClick={() => setAppliedSearch(searchInput)}>
                                        Lọc
                                    </Button>
                                </Col>
                            </Row>

                            <p className="text-muted small mb-3">
                                Tổng cộng {totalCount} hợp đồng phù hợp bộ lọc.
                            </p>

                            <ContractsTable
                                contracts={allContracts}
                                onViewDetail={setDetailContract}
                                onEdit={setEditingContract}
                                onRenew={handleRenew}
                                onCancel={handleCancel}
                                emptyMessage="Không có hợp đồng nào phù hợp bộ lọc."
                            />

                            <PagerControls
                                pageNumber={pageNumber}
                                pageSize={pageSize}
                                totalCount={totalCount}
                                onPageChange={setPageNumber}
                            />
                        </CardBody>
                    </Card>
                </TabPane>
            </TabContent>

            <CreateContractModal isOpen={createOpen} toggle={() => setCreateOpen(false)} onSuccess={loadActiveTab} />
            <EditContractModal contract={editingContract} toggle={() => setEditingContract(null)} onSuccess={loadActiveTab} />
            <ContractDetailModal
                contract={detailContract}
                toggle={() => setDetailContract(null)}
                onEdit={(c) => { setDetailContract(null); setEditingContract(c); }}
                onRenew={(id) => { setDetailContract(null); handleRenew(id); }}
                onCancel={(id) => { setDetailContract(null); handleCancel(id); }}
            />
        </Container>
    );
};

export default MonthlyContracts;
