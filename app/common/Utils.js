import moment from "moment";
import { LIST_APPROVAL_STATUS, LIST_JUDGE_PRORMISSION, LIST_STATUS, LIST_CHAMPION_STATUS, LIST_GENDER } from "./Constants";

export default class Utils {
  /**
   * @param {any} obj
   */
  static cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  /**
   * Chuyển ngày sang định dạng DD/MM/YYYY
   * @param {string|Date} date - Chuỗi ngày hoặc object Date
   * @returns {string} - Chuỗi định dạng DD/MM/YYYY
   */
  static formatDate(date) {
    return moment(date).format("DD/MM/YYYY");
  }

  /**
 * Lấy label quyền giám định từ key
 * @param {string} key - Mã quyền giám định (VD: GD1, GD2, ...)
 * @returns {string} - Label tương ứng (VD: Giám định 1, Giám định 2, ...)
 */
  static getJudgePermissionLabel(key) {
    const found = LIST_JUDGE_PRORMISSION.find((item) => item.key === key);
    return found ? found.label : key;
  }

  /**
   * Lấy label trạng thái từ key
   * @param {string} key - Mã trạng thái (VD: active, inactive, maintenance)
   * @returns {string} - Label tương ứng (VD: Hoạt động, Ngưng hoạt động, Bảo trì)
   */
  static getStatusLabel(key) {
    const found = LIST_STATUS.find((item) => item.key === key);
    return found ? found.label : key;
  }

  /**
   * Lấy label trạng thái phê duyệt từ key
   * @param {string} key - Mã trạng thái phê duyệt (VD: approved, rejected, pending)
   * @returns {string} - Label tương ứng (VD: Đã duyệt, Từ chối, Chờ duyệt)
   */
  static getApprovalStatusLabel(key) {
    const found = LIST_APPROVAL_STATUS.find((item) => item.key === key);
    return found ? found.label : key;
  }

  /**
   * Lấy label trạng thái giải đấu từ key
   * @param {string} key - Mã trạng thái giải đấu (VD: NEW, PRO, COM, ...)
   * @returns {string} - Label tương ứng (VD: Tạo mới, Chờ đăng ký, Hoàn thiện đăng ký, ...)
   */
  static getChampionStatusLabel(key) {
    const found = LIST_CHAMPION_STATUS.find((item) => item.key === key);
    return found ? found.label : key;
  }

  /**
   * Lấy label giới tính từ key
   * @param {string} key - Mã giới tính (VD: M, F)
   * @returns {string} - Label tương ứng (VD: Nam, Nữ)
   */
  static getGenderLabel(key) {
    const found = LIST_GENDER.find((item) => item.key === key);
    return found ? found.label : key;
  }
}
