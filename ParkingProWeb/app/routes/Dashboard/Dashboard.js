import React, { useEffect, useState } from 'react';
import {
    Container, Row, Col, Card, CardBody, CardTitle, Alert
} from './../../components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { HeaderMain } from '../components/HeaderMain';
import { getOccupancyReport, getRevenueReport } from './../../api/reports';
import { DEFAULT_PARKING_LOT_ID } from './../../config/parkingLot';

const formatDate = (date) => date.toISOString().slice(0, 10);

const StatCard = ({ title, value, colorClass }) => (
    <Col lg={2} md={4} sm={6} className="mb-3">
        <Card className="h-100">
            <CardBody>
                <CardTitle tag="h6" className="text-muted mb-3">{title}</CardTitle>
                <h2 className={colorClass}>{value}</h2>
            </CardBody>
        </Card>
    </Col>
);

const Dashboard = () => {
    const [occupancy, setOccupancy] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!DEFAULT_PARKING_LOT_ID) {
            setError('Chưa cấu hình DEFAULT_PARKING_LOT_ID (xem app/config/parkingLot.js).');
            return;
        }

        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 6);

        Promise.all([
            getOccupancyReport(DEFAULT_PARKING_LOT_ID),
            getRevenueReport(DEFAULT_PARKING_LOT_ID, formatDate(fromDate), formatDate(toDate)),
        ])
            .then(([occ, rev]) => {
                setOccupancy(occ);
                setRevenue(rev.map((r) => ({
                    date: r.date.slice(5),
                    'Theo giờ': r.hourlyRevenue,
                    'Theo ngày': r.dailyRevenue,
                    'Theo tháng': r.monthlyRevenue,
                })));
            })
            .catch((err) => setError(err.message));
    }, []);

    return (
        <Container>
            <Row className="mb-2">
                <Col lg={12}>
                    <HeaderMain title="Dashboard" className="mb-4 mb-lg-3" />
                </Col>
            </Row>

            {error && <Alert color="warning">{error}</Alert>}

            {occupancy && (
                <Row>
                    <StatCard title="Tổng số slot" value={occupancy.totalSlots} colorClass="text-primary" />
                    <StatCard title="Đang có xe" value={occupancy.occupiedSlots} colorClass="text-danger" />
                    <StatCard title="Vé tháng" value={occupancy.reservedSlots} colorClass="text-info" />
                    <StatCard title="Bảo trì" value={occupancy.maintenanceSlots} colorClass="text-secondary" />
                    <StatCard title="Còn trống" value={occupancy.availableSlots} colorClass="text-success" />
                    <StatCard title="Tỷ lệ lấp đầy" value={`${occupancy.occupancyRatePercent}%`} colorClass="text-warning" />
                </Row>
            )}

            <Row>
                <Col lg={12}>
                    <Card className="mb-3">
                        <CardBody>
                            <CardTitle tag="h6" className="mb-4">Doanh thu 7 ngày gần nhất</CardTitle>
                            <div style={{ width: '100%', height: 320 }}>
                                <ResponsiveContainer>
                                    <BarChart data={revenue}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="Theo giờ" stackId="a" fill="#4f8ef7" />
                                        <Bar dataKey="Theo ngày" stackId="a" fill="#f7b84f" />
                                        <Bar dataKey="Theo tháng" stackId="a" fill="#4ff7a0" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
