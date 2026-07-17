import React from 'react';
import PropTypes from 'prop-types';

import { Provider } from './ThemeContext';

const STORAGE_KEY = 'parkingpro_theme';

const readSavedTheme = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        // localStorage có thể không khả dụng (vd chế độ ẩn danh chặn) — bỏ qua, dùng mặc định
        return null;
    }
};

const saveTheme = (themeState) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(themeState));
    } catch (e) {
        // Bỏ qua nếu không ghi được (quota đầy, chế độ ẩn danh...)
    }
};

export class ThemeProvider extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        initialStyle: PropTypes.string,
        initialColor: PropTypes.string,
    };

    constructor(props) {
        super(props);

        // Ưu tiên giá trị đã lưu ở lần trước (localStorage) > props initialStyle/initialColor > mặc định
        const saved = readSavedTheme();

        this.state = {
            style: (saved && saved.style) || props.initialStyle || 'light',
            color: (saved && saved.color) || props.initialColor || 'primary',
        };
    }

    onChangeTheme(themeState) {
        this.setState(themeState, () => {
            saveTheme({ style: this.state.style, color: this.state.color });
        });
    }

    render() {
        const { children } = this.props;

        return (
            <Provider
                value={{
                    ...this.state,
                    onChangeTheme: this.onChangeTheme.bind(this)
                }}
            >
                { children }
            </Provider>
        );
    }
}
