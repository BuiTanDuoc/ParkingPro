import React from 'react';

import { SidebarMenu } from './../../components';
import { useAuth } from './../../auth/AuthContext';

export const SidebarMiddleNav = () => {
    const { user } = useAuth();
    const role = user?.role;

    return (
        <SidebarMenu>
            <SidebarMenu.Item
                icon={<i className="fa fa-fw fa-tachometer"></i>}
                title="Dashboard"
                to="/"
                exact
            />
            <SidebarMenu.Item
                icon={<i className="fa fa-fw fa-th-large"></i>}
                title="Sơ đồ bãi xe"
                to="/parking-map"
                exact
            />
            <SidebarMenu.Item
                icon={<i className="fa fa-fw fa-car"></i>}
                title="Gửi xe theo giờ/ngày"
                to="/sessions"
                exact
            />
            <SidebarMenu.Item
                icon={<i className="fa fa-fw fa-id-card"></i>}
                title="Vé tháng"
                to="/monthly-contracts"
                exact
            />
            {(role === 'Admin' || role === 'Manager') && (
                <SidebarMenu.Item
                    icon={<i className="fa fa-fw fa-bar-chart"></i>}
                    title="Báo cáo"
                    to="/reports"
                    exact
                />
            )}
            {(role === 'Admin' || role === 'Manager') && (
                <SidebarMenu.Item
                    icon={<i className="fa fa-fw fa-th"></i>}
                    title="Khu vực & Slot"
                    to="/slots-management"
                    exact
                />
            )}
            {role === 'Admin' && (
                <SidebarMenu.Item
                    icon={<i className="fa fa-fw fa-users"></i>}
                    title="Quản lý người dùng"
                    to="/users"
                    exact
                />
            )}
            <SidebarMenu.Item
                icon={<i className="fa fa-fw fa-user"></i>}
                title="Hồ sơ của tôi"
                to="/profile"
                exact
            />
        </SidebarMenu>
    );
};
