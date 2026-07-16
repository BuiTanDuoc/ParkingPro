import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

import { useAuth } from './AuthContext';
import { PageLoader } from './../components';

const PrivateRoute = ({ component: Component, roles, ...rest }) => {
    const { user, loading } = useAuth();

    return (
        <Route
            {...rest}
            render={(props) => {
                if (loading) return <PageLoader />;
                if (!user) return <Redirect to="/login" />;
                if (roles && !roles.includes(user.role)) return <Redirect to="/" />;
                return <Component {...props} />;
            }}
        />
    );
};
PrivateRoute.propTypes = {
    component: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
    roles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;
