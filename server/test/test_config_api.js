/**
 * Test Script cho ConfigSystem API
 * 
 * Chạy script này để test API sau khi cập nhật
 * 
 * Cách chạy:
 * node server/test/test_config_api.js
 */

const axios = require('axios');

// Cấu hình
const BASE_URL = 'http://localhost:3000'; // Thay đổi nếu cần
const API_PREFIX = '/api/config';

// Colors for console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: GET Config System
async function testGetConfigSystem() {
    log('\n📥 Test 1: GET Config System', 'cyan');
    log('━'.repeat(50), 'cyan');
    
    try {
        const response = await axios.post(`${BASE_URL}${API_PREFIX}/get-config-system`);
        
        if (response.data.success) {
            log('✅ GET API thành công!', 'green');
            
            const data = response.data.data;
            
            // Kiểm tra các trường mới
            const newFields = [
                'ten_giai_dau',
                'bo_mon',
                'thoi_gian_bat_dau',
                'thoi_gian_ket_thuc',
                'mo_ta_giai_dau'
            ];
            
            log('\n📋 Kiểm tra các trường mới:', 'yellow');
            newFields.forEach(field => {
                if (data.hasOwnProperty(field)) {
                    const value = data[field];
                    const type = typeof value;
                    log(`   ✅ ${field}: "${value}" (${type})`, 'green');
                } else {
                    log(`   ❌ ${field}: KHÔNG TỒN TẠI`, 'red');
                }
            });
            
            // Kiểm tra type của các trường
            log('\n🔍 Kiểm tra data types:', 'yellow');
            log(`   - ten_giai_dau: ${typeof data.ten_giai_dau} (expected: string)`, 
                typeof data.ten_giai_dau === 'string' ? 'green' : 'red');
            log(`   - so_giam_dinh: ${typeof data.so_giam_dinh} (expected: number)`, 
                typeof data.so_giam_dinh === 'number' ? 'green' : 'red');
            log(`   - so_hiep: ${typeof data.so_hiep} (expected: number)`, 
                typeof data.so_hiep === 'number' ? 'green' : 'red');
            
            return data;
        } else {
            log('❌ GET API thất bại!', 'red');
            log(JSON.stringify(response.data, null, 2), 'red');
            return null;
        }
    } catch (error) {
        log('❌ Lỗi khi gọi GET API:', 'red');
        log(error.message, 'red');
        return null;
    }
}

// Test 2: UPDATE Config System
async function testUpdateConfigSystem() {
    log('\n📤 Test 2: UPDATE Config System', 'cyan');
    log('━'.repeat(50), 'cyan');

    const testData = {
        ten_giai_dau: 'Giải Test API - ' + new Date().toISOString(),
        bo_mon: 'Vovinam Test',
        thoi_gian_bat_dau: '2025-02-01',
        thoi_gian_ket_thuc: '2025-02-05',
        mo_ta_giai_dau: 'Đây là test mô tả giải đấu',
        so_giam_dinh: '7',
        so_hiep: '4',
        so_hiep_phu: '2',
        // Thêm field mới để test auto-insert
        test_field_new: 'Test value for new field',
    };

    try {
        log('\n📝 Dữ liệu gửi lên:', 'yellow');
        log(JSON.stringify(testData, null, 2), 'blue');

        const response = await axios.post(`${BASE_URL}${API_PREFIX}/update-config-system`, testData);

        if (response.data.success) {
            log('\n✅ UPDATE API thành công!', 'green');
            return testData;
        } else {
            log('\n❌ UPDATE API thất bại!', 'red');
            log(JSON.stringify(response.data, null, 2), 'red');
            return null;
        }
    } catch (error) {
        log('\n❌ Lỗi khi gọi UPDATE API:', 'red');
        log(error.message, 'red');
        if (error.response) {
            log('Response data:', 'red');
            log(JSON.stringify(error.response.data, null, 2), 'red');
        }
        return null;
    }
}

// Test 3: Verify Update
async function testVerifyUpdate(expectedData) {
    log('\n🔍 Test 3: Verify Update', 'cyan');
    log('━'.repeat(50), 'cyan');

    try {
        const response = await axios.post(`${BASE_URL}${API_PREFIX}/get-config-system`);

        if (response.data.success) {
            const data = response.data.data;

            log('\n📋 Dữ liệu sau khi update:', 'yellow');
            log(`   - ten_giai_dau: "${data.ten_giai_dau}"`, 'blue');
            log(`   - bo_mon: "${data.bo_mon}"`, 'blue');
            log(`   - thoi_gian_bat_dau: "${data.thoi_gian_bat_dau}"`, 'blue');
            log(`   - thoi_gian_ket_thuc: "${data.thoi_gian_ket_thuc}"`, 'blue');
            log(`   - mo_ta_giai_dau: "${data.mo_ta_giai_dau}"`, 'blue');
            log(`   - so_giam_dinh: ${data.so_giam_dinh}`, 'blue');
            log(`   - so_hiep: ${data.so_hiep}`, 'blue');
            log(`   - so_hiep_phu: ${data.so_hiep_phu}`, 'blue');

            // Kiểm tra field mới có được thêm vào không
            if (expectedData && expectedData.test_field_new) {
                if (data.test_field_new === expectedData.test_field_new) {
                    log(`   - test_field_new: "${data.test_field_new}" ✅ (Auto-inserted)`, 'green');
                } else {
                    log(`   - test_field_new: KHÔNG KHỚP ❌`, 'red');
                }
            }

            // Kiểm tra data types
            log('\n🔍 Kiểm tra data types:', 'yellow');
            const typeChecks = [
                { field: 'ten_giai_dau', expected: 'string', actual: typeof data.ten_giai_dau },
                { field: 'bo_mon', expected: 'string', actual: typeof data.bo_mon },
                { field: 'so_giam_dinh', expected: 'number', actual: typeof data.so_giam_dinh },
                { field: 'so_hiep', expected: 'number', actual: typeof data.so_hiep },
            ];

            typeChecks.forEach(check => {
                const isCorrect = check.expected === check.actual;
                const icon = isCorrect ? '✅' : '❌';
                const color = isCorrect ? 'green' : 'red';
                log(`   ${icon} ${check.field}: ${check.actual} (expected: ${check.expected})`, color);
            });

            log('\n✅ Verify thành công!', 'green');
            return true;
        } else {
            log('\n❌ Verify thất bại!', 'red');
            return false;
        }
    } catch (error) {
        log('\n❌ Lỗi khi verify:', 'red');
        log(error.message, 'red');
        return false;
    }
}

// Main test runner
async function runTests() {
    log('\n🚀 BẮT ĐẦU TEST CONFIG SYSTEM API', 'cyan');
    log('='.repeat(50), 'cyan');

    // Test 1: GET
    const getData = await testGetConfigSystem();
    if (!getData) {
        log('\n❌ Test 1 thất bại. Dừng test.', 'red');
        return;
    }

    // Test 2: UPDATE
    const updateData = await testUpdateConfigSystem();
    if (!updateData) {
        log('\n❌ Test 2 thất bại. Dừng test.', 'red');
        return;
    }

    // Wait 1 second
    log('\n⏳ Đợi 1 giây để database cập nhật...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: VERIFY
    await testVerifyUpdate(updateData);

    log('\n' + '='.repeat(50), 'cyan');
    log('✨ HOÀN THÀNH TẤT CẢ TESTS!', 'green');
    log('='.repeat(50) + '\n', 'cyan');
}

// Run tests
runTests().catch(err => {
    log('\n❌ Test runner thất bại:', 'red');
    log(err.message, 'red');
    process.exit(1);
});

