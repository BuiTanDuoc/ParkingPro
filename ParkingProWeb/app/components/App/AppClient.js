import React from 'react';
import { hot } from 'react-hot-loader'
import { BrowserRouter as Router } from 'react-router-dom';

import AppLayout from './../../layout/default';
import { RoutedContent } from './../../routes';
import { AuthProvider } from './../../auth/AuthContext';

const basePath = process.env.BASE_PATH || '/';

const AppClient = () => {
    return (
        <Router basename={ basePath }>
            <AuthProvider>
                <AppLayout>
                    <RoutedContent />
                </AppLayout>
            </AuthProvider>
        </Router>
    );
}

export default hot(module)(AppClient);