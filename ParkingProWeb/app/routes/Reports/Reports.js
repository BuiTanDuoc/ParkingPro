import React, { useState } from 'react';
import {
    Container, Row, Col, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input, Alert
} from './../../components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { HeaderMain } from '../components/HeaderMain';
import { getRevenueReport } from './../../api/reports';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
};

const Reports = () => {
    const [fromDate, setFromDate] = useState(daysAgoStr(6));
    const [toDate, setToDate] = useState(todayStr());
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = async (e) => {
        if (e) e.preventDefault();
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const rev = await getRevenueReport(DEFAULT_PARKING_LOT_ID, fromDate, toDate);
            setData(rev.map((r) => ({
                date: r.date,
                'Theo giờ': r.hourlyRevenue,
                'Theo ngày': r.dailyRevenue,
                'Theo tháng': r.monthlyRevenue,
                'Tổng': r.totalRevenue,
            })));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const total = data.reduce((sum, d) => sum + d['Tổng'], 0);

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={12}>
                    <HeaderMain title="Báo cáo doanh thu" className="mb-4 mb-lg-3" />
                </Col>
            </Row>

            {error && <Alert color="warning">{error}</Alert>}

            <Card className="mb-3">
                <CardBody>
                    <Form inline onSubmit={load}>
                        <FormGroup className="mr-3">
                            <Label className="mr-2">Từ ngày</Label>
                            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </FormGroup>
                        <FormGroup className="mr-3">
                            <Label className="mr-2">Đến ngày</Label>
                            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </FormGroup>
                        <Button color="primary" type="submit" disabled={loading}>
                            {loading ? 'Đang tải...' : 'Xem báo cáo'}
                        </Button>
                    </Form>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <CardTitle tag="h6" className="mb-4">
                        Tổng doanh thu: <strong>{total.toLocaleString('vi-VN')} đ</strong>
                    </CardTitle>
                    <div style={{ width: '100%', height: 360 }}>
                        <ResponsiveContainer>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} đ`} />
                                <Legend />
                                <Bar dataKey="Theo giờ" stackId="a" fill="#4f8ef7" />
                                <Bar dataKey="Theo ngày" stackId="a" fill="#f7b84f" />
                                <Bar dataKey="Theo tháng" stackId="a" fill="#4ff7a0" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardBody>
            </Card>
        </Container>
    );
};

export default Reports;
