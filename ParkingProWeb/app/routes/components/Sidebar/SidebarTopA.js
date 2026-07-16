import React from 'react';
import { Link } from 'react-router-dom';

import {
    Sidebar,
    UncontrolledButtonDropdown,
    Avatar,
    AvatarAddOn,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from './../../../components';

import { useAuth } from './../../../auth/AuthContext';
import { getApiBaseUrl } from './../../../api/http';

const roleLabels = {
    Admin: 'Quản trị viên',
    Manager: 'Quản lý',
    Staff: 'Nhân viên',
    Customer: 'Khách hàng',
};

const resolveAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    return avatarUrl.startsWith('http') ? avatarUrl : `${getApiBaseUrl()}${avatarUrl}`;
};

const SidebarTopA = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const avatarSrc = resolveAvatarUrl(user.avatarUrl);

    return (
        <React.Fragment>
            {/* START: Sidebar Default */}
            <Sidebar.HideSlim>
                <Sidebar.Section className="pt-0">
                    <Link to="/profile" className="d-block">
                        <Sidebar.HideSlim>
                            <Avatar.Image
                                size="lg"
                                src={avatarSrc}
                                addOns={[
                                    <AvatarAddOn.Icon className="fa fa-circle" color="white" key="avatar-icon-bg" />,
                                    <AvatarAddOn.Icon className="fa fa-circle" color="success" key="avatar-icon-fg" />,
                                ]}
                            />
                        </Sidebar.HideSlim>
                    </Link>

                    <UncontrolledButtonDropdown>
                        <DropdownToggle color="link" className="pl-0 pb-0 btn-profile sidebar__link">
                            {user.fullName}
                            <i className="fa fa-angle-down ml-2"></i>
                        </DropdownToggle>
                        <DropdownMenu persist>
                            <DropdownItem header>{user.fullName}</DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem tag={Link} to="/profile">
                                Hồ sơ của tôi
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem onClick={logout}>
                                <i className="fa fa-fw fa-sign-out mr-2"></i>
                                Đăng xuất
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                    <div className="small sidebar__link--muted">
                        {roleLabels[user.role] || user.role}
                    </div>
                </Sidebar.Section>
            </Sidebar.HideSlim>
            {/* END: Sidebar Default */}

            {/* START: Sidebar Slim */}
            <Sidebar.ShowSlim>
                <Sidebar.Section>
                    <Avatar.Image
                        size="sm"
                        src={avatarSrc}
                        addOns={[
                            <AvatarAddOn.Icon className="fa fa-circle" color="white" key="avatar-icon-bg" />,
                            <AvatarAddOn.Icon className="fa fa-circle" color="success" key="avatar-icon-fg" />,
                        ]}
                    />
                </Sidebar.Section>
            </Sidebar.ShowSlim>
            {/* END: Sidebar Slim */}
        </React.Fragment>
    );
};

export { SidebarTopA };
