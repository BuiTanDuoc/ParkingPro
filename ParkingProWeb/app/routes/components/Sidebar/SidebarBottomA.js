import React from 'react';

import { Sidebar } from './../../../components';
import { FooterText } from '../FooterText';

const SidebarBottomA = () => (
    <Sidebar.HideSlim>
        <Sidebar.Section className="text-muted small">
            <FooterText />
        </Sidebar.Section>
    </Sidebar.HideSlim>
);

export { SidebarBottomA };
