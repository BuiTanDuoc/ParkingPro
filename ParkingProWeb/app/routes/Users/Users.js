import React, { useEffect, useState } from 'react';
import {
    Container, Row, Col, Card, CardBody, Table, Badge, Button,
    Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, CustomInput, Alert, Avatar
} from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import { getAllUsers, createStaffUser, setUserActive } from './../../api/users';
import { getApiBaseUrl } from './../../api/http';

const roleLabels = { Admin: 'Quản trị viên', Manager: 'Quản lý', Staff: 'Nhân viên', Customer: 'Khách hàng' };
const roleColor = { Admin: 'danger', Manager: 'primary', Staff: 'info', Customer: 'secondary' };

const resolveAvatarUrl = (url) => (url ? (url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`) : null);

const CreateUserModal = ({ isOpen, toggle, onSuccess }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState('Staff');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await createStaffUser({ fullName, email, password, phoneNumber, role });
            setFullName('');
            setEmail('');
            setPassword('');
            setPhoneNumber('');
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
                <ModalHeader toggle={toggle}>Tạo tài khoản nội bộ</ModalHeader>
                <ModalBody>
                    {error && <Alert color="danger">{error}</Alert>}
                    <FormGroup>
                        <Label>Họ tên</Label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Email</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Mật khẩu</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Số điện thoại</Label>
                        <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Vai trò</Label>
                        <CustomInput type="select" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="Staff">Nhân viên</option>
                            <option value="Manager">Quản lý</option>
                            <option value="Admin">Quản trị viên</option>
                            <option value="Customer">Khách hàng</option>
                        </CustomInput>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" type="button" onClick={toggle}>Hủy</Button>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : 'Tạo tài khoản'}
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('');
    const [error, setError] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);

    const load = () => {
        getAllUsers(roleFilter || undefined).then((res) => setUsers(res.items)).catch((err) => setError(err.message));
    };

    useEffect(load, [roleFilter]);

    const handleToggleActive = async (user) => {
        try {
            await setUserActive(user.id, !user.isActive);
            load();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={8}>
                    <HeaderMain title="Quản lý người dùng" className="mb-4 mb-lg-3" />
                </Col>
                <Col lg={4} className="d-flex align-items-center justify-content-lg-end mb-3">
                    <Button color="primary" onClick={() => setCreateOpen(true)}>
                        <i className="fa fa-plus mr-2"></i>Tạo tài khoản
                    </Button>
                </Col>
            </Row>

            {error && <Alert color="warning">{error}</Alert>}

            <Card className="mb-3">
                <CardBody>
                    <Form inline>
                        <FormGroup className="mr-3">
                            <Label className="mr-2">Lọc theo vai trò</Label>
                            <CustomInput type="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="">Tất cả</option>
                                <option value="Admin">Quản trị viên</option>
                                <option value="Manager">Quản lý</option>
                                <option value="Staff">Nhân viên</option>
                                <option value="Customer">Khách hàng</option>
                            </CustomInput>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>SĐT</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td><Avatar.Image size="sm" src={resolveAvatarUrl(u.avatarUrl)} /></td>
                                    <td>{u.fullName}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phoneNumber || '-'}</td>
                                    <td><Badge color={roleColor[u.role] || 'secondary'}>{roleLabels[u.role] || u.role}</Badge></td>
                                    <td>
                                        <Badge color={u.isActive ? 'success' : 'secondary'}>
                                            {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            color={u.isActive ? 'danger' : 'success'}
                                            outline
                                            onClick={() => handleToggleActive(u)}
                                        >
                                            {u.isActive ? 'Khóa' : 'Mở khóa'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr><td colSpan={7} className="text-center text-muted">Không có tài khoản nào.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>

            <CreateUserModal isOpen={createOpen} toggle={() => setCreateOpen(false)} onSuccess={load} />
        </Container>
    );
};

export default Users;
