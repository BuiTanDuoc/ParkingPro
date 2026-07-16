import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

import {
    Form,
    FormGroup,
    Input,
    Button,
    Label,
    Alert,
    EmptyLayout,
    ThemeConsumer
} from './../../../components';

import { HeaderAuth } from '../../components/Pages/HeaderAuth';
import { FooterAuth } from '../../components/Pages/FooterAuth';
import { useAuth } from './../../../auth/AuthContext';

const Login = () => {
    const { user, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Redirect to="/" />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <EmptyLayout>
            <EmptyLayout.Section center>
                <HeaderAuth
                    title="Đăng nhập ParkingPro"
                    text="Hệ thống quản lý bãi giữ xe ô tô"
                />
                <Form className="mb-3" onSubmit={handleSubmit}>
                    {error && <Alert color="danger">{error}</Alert>}
                    <FormGroup>
                        <Label for="email">Email</Label>
                        <Input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="admin@parkingpro.vn"
                            className="bg-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="password">Mật khẩu</Label>
                        <Input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            className="bg-white"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <ThemeConsumer>
                        {({ color }) => (
                            <Button color={color} block type="submit" disabled={submitting}>
                                {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </Button>
                        )}
                    </ThemeConsumer>
                </Form>
                <FooterAuth />
            </EmptyLayout.Section>
        </EmptyLayout>
    );
};

export default Login;
