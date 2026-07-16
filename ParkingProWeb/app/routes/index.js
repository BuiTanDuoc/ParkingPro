import React from 'react';
import {
    Route,
    Switch,
    Redirect
} from 'react-router';

import PrivateRoute from './../auth/PrivateRoute';

// ----------- Pages Imports ---------------
import Dashboard from './Dashboard';
import ParkingMap from './ParkingMap';
import Sessions from './Sessions';
import MonthlyContracts from './MonthlyContracts';
import Reports from './Reports';
import Profile from './Profile';

import Login from './Pages/Login';
import Error404 from './Pages/Error404';

// ----------- Layout Imports ---------------
import { DefaultNavbar } from './../layout/components/DefaultNavbar';
import { DefaultSidebar } from './../layout/components/DefaultSidebar';

//------ Route Definitions --------
export const RoutedContent = () => {
    return (
        <Switch>
            <Route path="/login" exact component={Login} />

            <PrivateRoute path="/" exact component={Dashboard} />
            <PrivateRoute path="/parking-map" exact component={ParkingMap} />
            <PrivateRoute path="/sessions" exact component={Sessions} roles={['Admin', 'Manager', 'Staff']} />
            <PrivateRoute path="/monthly-contracts" exact component={MonthlyContracts} roles={['Admin', 'Manager', 'Staff']} />
            <PrivateRoute path="/reports" exact component={Reports} roles={['Admin', 'Manager']} />
            <PrivateRoute path="/profile" exact component={Profile} />

            <Route path="/pages/error-404" exact component={Error404} />
            { /* 404 */ }
            <Redirect to="/pages/error-404" />
        </Switch>
    );
};

//------ Custom Layout Parts --------
export const RoutedNavbars = () => (
    <Switch>
        <Route path="/login" render={() => null} />
        <Route component={DefaultNavbar} />
    </Switch>
);

export const RoutedSidebars = () => (
    <Switch>
        <Route path="/login" render={() => null} />
        <Route component={DefaultSidebar} />
    </Switch>
);
