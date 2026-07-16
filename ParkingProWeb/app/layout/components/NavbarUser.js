import React from 'react';
import PropTypes from 'prop-types';

import { NavItem, NavLink } from './../../components';
import { useAuth } from './../../auth/AuthContext';

const NavbarUser = (props) => {
    const { logout } = useAuth();
    return (
        <NavItem {...props}>
            <NavLink href="javascript:;" onClick={logout} title="Đăng xuất">
                <i className="fa fa-power-off"></i>
            </NavLink>
        </NavItem>
    );
};
NavbarUser.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object
};

export { NavbarUser };
