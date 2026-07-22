// Sinh dist/config.js sau khi build production, chứa các giá trị runtime hiện tại của .env
// (dùng làm giá trị khởi tạo). File này KHÔNG bị Webpack xử lý — sau khi deploy, có thể sửa
// trực tiếp trên server (vd đổi DEFAULT_PARKING_LOT_ID) mà không cần build lại project.
require('dotenv').config();

var fs = require('fs');
var path = require('path');
var config = require('./../config');

var runtimeConfig = {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5080',
    DEFAULT_PARKING_LOT_ID: process.env.DEFAULT_PARKING_LOT_ID || '',
};

var fileContent =
    '// File cấu hình runtime — KHÔNG bị Webpack bundle, sửa trực tiếp trên server sau khi deploy\n' +
    '// (vd đổi bãi xe/domain API) mà không cần build lại. Sửa xong chỉ cần F5 lại trang, không cần restart gì.\n' +
    'window.__APP_CONFIG__ = ' + JSON.stringify(runtimeConfig, null, 2) + ';\n';

var outPath = path.join(config.distDir, 'config.js');
fs.writeFileSync(outPath, fileContent, 'utf8');

console.log('[generate-runtime-config] Đã tạo ' + outPath);
console.log(fileContent);
