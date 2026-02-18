/**
 * IP Masker Utility
 * Che giấu địa chỉ IP thiết bị để bảo mật
 * 
 * Các phương pháp che giấu:
 * 1. Hash MD5 - Chuyển IP thành mã hash
 * 2. Partial Mask - Che một phần IP (192.168.x.x)
 * 3. Device ID - Chuyển thành Device ID (DEV-001, DEV-002)
 * 4. Last Octet - Chỉ hiển thị octet cuối (.123)
 */

import CryptoJS from 'crypto-js';

class IpMasker {
  /**
   * Chuyển IP thành mã hash MD5
   * @param {string} ip - Địa chỉ IP
   * @returns {string} - Mã hash (8 ký tự đầu)
   * @example maskAsHash("192.168.1.100") => "a1b2c3d4"
   */
  static maskAsHash(ip) {
    if (!ip || ip === 'N/A' || ip === '::1') return 'N/A';
    
    const hash = CryptoJS.MD5(ip).toString();
    return hash.substring(0, 8).toUpperCase();
  }

  /**
   * Che một phần IP, chỉ hiển thị 2 octet đầu
   * @param {string} ip - Địa chỉ IP
   * @returns {string} - IP đã che (192.168.x.x)
   * @example maskPartial("192.168.1.100") => "192.168.x.x"
   */
  static maskPartial(ip) {
    if (!ip || ip === 'N/A' || ip === '::1') return 'N/A';
    
    const parts = ip.split('.');
    if (parts.length !== 4) return ip; // Không phải IPv4
    
    return `${parts[0]}.${parts[1]}.x.x`;
  }

  /**
   * Chuyển IP thành Device ID dựa trên index
   * @param {string} ip - Địa chỉ IP
   * @param {number} index - Số thứ tự thiết bị
   * @returns {string} - Device ID (DEV-001)
   * @example maskAsDeviceId("192.168.1.100", 5) => "DEV-005"
   */
  static maskAsDeviceId(ip, index = 0) {
    if (!ip || ip === 'N/A' || ip === '::1') return 'N/A';
    
    const deviceNum = String(index + 1).padStart(3, '0');
    return `DEV-${deviceNum}`;
  }

  /**
   * Chỉ hiển thị octet cuối của IP
   * @param {string} ip - Địa chỉ IP
   * @returns {string} - Octet cuối (.123)
   * @example maskLastOctet("192.168.1.100") => ".100"
   */
  static maskLastOctet(ip) {
    if (!ip || ip === 'N/A' || ip === '::1') return 'N/A';
    
    const parts = ip.split('.');
    if (parts.length !== 4) return ip; // Không phải IPv4
    
    return `.${parts[3]}`;
  }

  /**
   * Tạo Device Code từ IP và device name
   * @param {string} ip - Địa chỉ IP
   * @param {string} deviceName - Tên thiết bị
   * @returns {string} - Device code (REF1-A1B2)
   * @example maskAsCode("192.168.1.100", "Referee 1") => "REF1-A1B2"
   */
  static maskAsCode(ip, deviceName = '') {
    if (!ip || ip === 'N/A' || ip === '::1') return 'N/A';
    
    const hash = this.maskAsHash(ip).substring(0, 4);
    const prefix = deviceName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'DEV';
    
    return `${prefix}-${hash}`;
  }

  /**
   * Hiển thị IP với tooltip (cho UI)
   * @param {string} ip - Địa chỉ IP
   * @param {string} method - Phương pháp che giấu ('hash', 'partial', 'deviceId', 'lastOctet', 'code')
   * @param {number} index - Index cho deviceId method
   * @param {string} deviceName - Device name cho code method
   * @returns {object} - { display: string, tooltip: string, original: string }
   */
  static mask(ip, method = 'hash', index = 0, deviceName = '') {
    if (!ip || ip === 'N/A' || ip === '::1') {
      return {
        display: 'N/A',
        tooltip: 'Không có địa chỉ IP',
        original: ip
      };
    }

    let display = '';
    let tooltip = `Thiết bị kết nối`;

    switch (method) {
      case 'hash':
        display = this.maskAsHash(ip);
        tooltip = `Mã thiết bị: ${display}`;
        break;
      case 'partial':
        display = this.maskPartial(ip);
        tooltip = `Dải mạng: ${display}`;
        break;
      case 'deviceId':
        display = this.maskAsDeviceId(ip, index);
        tooltip = `Thiết bị số ${index + 1}`;
        break;
      case 'lastOctet':
        display = this.maskLastOctet(ip);
        tooltip = `Địa chỉ cuối: ${display}`;
        break;
      case 'code':
        display = this.maskAsCode(ip, deviceName);
        tooltip = `Mã thiết bị: ${display}`;
        break;
      default:
        display = this.maskAsHash(ip);
        tooltip = `Mã thiết bị: ${display}`;
    }

    return {
      display,
      tooltip,
      original: ip
    };
  }
}

export default IpMasker;

