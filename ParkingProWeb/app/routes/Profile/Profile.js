import React, { useState, useRef } from 'react';
import {
    Container, Row, Col, Card, CardBody, Button, Alert, Avatar
} from './../../components';

import { HeaderMain } from '../components/HeaderMain';
import { useAuth } from './../../auth/AuthContext';
import { updateMyAvatar } from './../../api/users';
import { getApiBaseUrl } from './../../api/http';

const roleLabels = { Admin: 'Quản trị viên', Manager: 'Quản lý', Staff: 'Nhân viên', Customer: 'Khách hàng' };

const resolveAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    return avatarUrl.startsWith('http') ? avatarUrl : `${getApiBaseUrl()}${avatarUrl}`;
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

            <Card>
                <CardBody className="text-center">
                    <Avatar.Image size="xl" src={resolveAvatarUrl(user.avatarUrl)} className="mb-3" />
                    <h4>{user.fullName}</h4>
                    <p className="text-muted">{roleLabels[user.role] || user.role}</p>
                    <p>{user.email}</p>
                    {user.phoneNumber && <p>{user.phoneNumber}</p>}

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="d-none"
                        onChange={handleFileChange}
                    />
                    <Button color="primary" outline onClick={() => fileInputRef.current.click()} disabled={uploading}>
                        {uploading ? 'Đang tải ảnh lên...' : 'Đổi ảnh đại diện'}
                    </Button>
                </CardBody>
            </Card>
        </Container>
    );
};

export default Profile;
