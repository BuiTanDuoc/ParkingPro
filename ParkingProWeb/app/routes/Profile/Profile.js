import React, { useState, useRef } from 'react';
import {
    Container, Row, Col, Card, CardBody, CardTitle, Button, Alert, Avatar,
    Form, FormGroup, Label, Input
} from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import { useAuth } from './../../auth/AuthContext';
import { updateMyAvatar, updateMyProfile, changeMyPassword } from './../../api/users';
import { getApiBaseUrl } from './../../api/http';

const roleLabels = { Admin: 'Quản trị viên', Manager: 'Quản lý', Staff: 'Nhân viên', Customer: 'Khách hàng' };

const resolveAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    return avatarUrl.startsWith('http') ? avatarUrl : `${getApiBaseUrl()}${avatarUrl}`;
};

const ProfileInfoCard = ({ user, onAvatarUploading, uploading, onOpenFilePicker }) => (
    <Card className="mb-3">
        <CardBody className="text-center">
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar.Image size="xl" src={resolveAvatarUrl(user.avatarUrl)} className="mb-3" />
            </div>
            <h4>{user.fullName}</h4>
            <p className="text-muted mb-3">{roleLabels[user.role] || user.role}</p>

            <table className="table table-sm text-left w-auto mx-auto mb-3">
                <tbody>
                    <tr><th className="pr-3">Email</th><td>{user.email}</td></tr>
                    <tr><th className="pr-3">Số điện thoại</th><td>{user.phoneNumber || '-'}</td></tr>
                </tbody>
            </table>

            <Button color="primary" outline onClick={onOpenFilePicker} disabled={uploading}>
                {uploading ? 'Đang tải ảnh lên...' : 'Đổi ảnh đại diện'}
            </Button>
        </CardBody>
    </Card>
);

const EditProfileForm = ({ user, onSaved }) => {
    const [fullName, setFullName] = useState(user.fullName);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setSubmitting(true);
        try {
            await updateMyProfile({ fullName, phoneNumber });
            await onSaved();
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="mb-3">
            <CardBody>
                <CardTitle tag="h6" className="mb-3">Chỉnh sửa thông tin</CardTitle>
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success" toggle={() => setSuccess(false)}>Đã lưu thay đổi.</Alert>}
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Họ tên</Label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Số điện thoại</Label>
                        <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </FormGroup>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </Form>
            </CardBody>
        </Card>
    );
};

const ChangePasswordForm = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (newPassword !== confirmPassword) {
            setError('Xác nhận mật khẩu mới không khớp.');
            return;
        }

        setSubmitting(true);
        try {
            await changeMyPassword({ currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardBody>
                <CardTitle tag="h6" className="mb-3">Đổi mật khẩu</CardTitle>
                {error && <Alert color="danger">{error}</Alert>}
                {success && <Alert color="success" toggle={() => setSuccess(false)}>Đổi mật khẩu thành công.</Alert>}
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Mật khẩu hiện tại</Label>
                        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    </FormGroup>
                    <FormGroup>
                        <Label>Mật khẩu mới</Label>
                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                    </FormGroup>
                    <FormGroup>
                        <Label>Xác nhận mật khẩu mới</Label>
                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                    </FormGroup>
                    <Button color="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Button>
                </Form>
            </CardBody>
        </Card>
    );
};

const Profile = () => {
    const { user, refreshProfile } = useAuth();
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    if (!user) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError(null);
        setUploading(true);
        try {
            await updateMyAvatar(file);
            await refreshProfile();
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={12}>
                    <HeaderMain title="Hồ sơ của tôi" className="mb-4 mb-lg-3" />
                </Col>
            </Row>

            {error && <Alert color="danger">{error}</Alert>}

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="d-none"
                onChange={handleFileChange}
            />

            <Row>
                <Col lg={4}>
                    <ProfileInfoCard
                        user={user}
                        uploading={uploading}
                        onOpenFilePicker={() => fileInputRef.current.click()}
                    />
                </Col>
                <Col lg={8}>
                    <EditProfileForm user={user} onSaved={refreshProfile} />
                    <ChangePasswordForm />
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
