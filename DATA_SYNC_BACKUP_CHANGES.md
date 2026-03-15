# Chi tiết cập nhật tính năng Sao lưu và Khôi phục dữ liệu (DataSync Backup/Restore)


```diff
diff --git a/app/views/Management/DataSync/DataSync.jsx b/app/views/Management/DataSync/DataSync.jsx
index 2944790..668554f 100644
--- a/app/views/Management/DataSync/DataSync.jsx
+++ b/app/views/Management/DataSync/DataSync.jsx
@@ -127,10 +127,20 @@ const DataSync = () => {
           <button
             onClick={() => setActiveTab("clean")}
             className={`m-1 px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === "clean"
-              ? "bg-rose-600 text-white scale-105"
+              ? "bg-rose-600 text-white shadow-rose-500/30 scale-105"
               : "text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40"
               }`}
           > {t("data_sync.clean_data")} </button>
+
+          <div className="w-px h-6 bg-blue-100 dark:bg-blue-900/50 mx-1"></div>
+
+          <button
+            onClick={() => setActiveTab("backup")}
+            className={`m-1 px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === "backup"
+              ? "bg-emerald-600 text-white shadow-emerald-500/30 scale-105"
+              : "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
+              }`}
+          > {t("data_sync.backup_restore", {defaultValue: "SAO LƯU & KHÔI PHỤC"})} </button>
         </div>
 
         {/* TAB CONTENT - Premium Card Layout */}
@@ -330,6 +340,80 @@ const DataSync = () => {
                 </div>
               </div>
             </div>)}
+
+          {/* ===== BACKUP & RESTORE SECTION - Cách 2 ===== */}
+          {activeTab === "backup" && (
+            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
+              <div className="relative justify-between flex p-10 bg-white dark:bg-gray-800 rounded border border-emerald-50 dark:border-emerald-900/30 shadow-2xl shadow-emerald-500/5 overflow-hidden">
+                <div className="absolute top-0 right-0 p-12 opacity-5">
+                  <svg className="w-40 h-40 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
+                </div>
+                
+                <div className="relative z-10 max-w-xl">
+                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded flex items-center justify-center text-emerald-500 mb-8 border border-emerald-100 dark:border-emerald-800">
+                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
+                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
+                    </svg>
+                  </div>
+                  <h2 className="text-[11px] font-black text-emerald-400 dark:text-emerald-500 uppercase tracking-[0.3em] mb-4">
+                    {t("data_sync.data_security", {defaultValue: "An toàn dữ liệu"})}
+                  </h2>
+                  <h3 className="text-3xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight mb-6">
+                    {t("data_sync.static_backup_restore", {defaultValue: "Sao lưu tĩnh & Khôi phục"})}
+                  </h3>
+                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
+                    {t("data_sync.backup_description", {defaultValue: "Giải pháp an toàn cho dữ liệu. Tải tệp sao lưu .sqlite để lưu trữ thủ công trên Google Drive hoặc khôi phục dữ liệu từ tệp này trong trường hợp cần thiết."})}
+                  </p>
+                  
+                  <div className="flex gap-4 mt-8">
+                    <button
+                      onClick={() => window.open('http://localhost:6789/api/sync/backup')}
+                      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-black uppercase tracking-[0.2em] shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-3"
+                    >
+                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" /></svg>
+                      {t("data_sync.backup_download_btn", {defaultValue: "Tải file Sao Lưu"})}
+                    </button>
+                    
+                    <label className="cursor-pointer px-8 py-4 bg-white dark:bg-gray-800 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900 text-[11px] font-black uppercase tracking-[0.2em] rounded transition-all active:scale-95 flex items-center gap-3">
+                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-3-3m0 0L8 8m4-4v12" /></svg>
+                      {t("data_sync.restore_upload_btn", {defaultValue: "Khôi phục dữ liệu"})}
+                      <input 
+                        type="file" 
+                        accept=".sqlite" 
+                        className="hidden" 
+                        onChange={async (e) => {
+                          const file = e.target.files[0];
+                          if (!file) return;
+                          if (!window.confirm(t("data_sync.restore_warning", {defaultValue: "CẢNH BÁO: Thao tác này sẽ GHI ĐÈ dữ liệu hiện tại và KHỞI ĐỘNG LẠI phần mềm. Bạn có chắc chắn?"}))) {
+                            e.target.value = null;
+                            return;
+                          }
+                          const formData = new FormData();
+                          formData.append("db_file", file);
+                          try {
+                            const res = await fetch("http://localhost:6789/api/sync/restore", {
+                                method: "POST",
+                                body: formData
+                            });
+                            const data = await res.json();
+                            if(data.success) {
+                                alert(data.message);
+                                window.location.reload();
+                            } else {
+                                alert(t("data_sync.restore_failed", {defaultValue: "Khôi phục thất bại: "}) + data.message);
+                            }
+                          } catch (err) {
+                            alert(t("data_sync.error", {defaultValue: "Lỗi: "}) + err.message);
+                          }
+                          e.target.value = null;
+                        }} 
+                      />
+                    </label>
+                  </div>
+                </div>
+              </div>
+            </div>)}
+
         </div>
       </div>
 
diff --git a/server/controllers/sync.controller.js b/server/controllers/sync.controller.js
index 21f551d..e3c6a86 100644
--- a/server/controllers/sync.controller.js
+++ b/server/controllers/sync.controller.js
@@ -1,4 +1,9 @@
 const SyncService = require('../services/sync');
+const { DB_SCHEME } = require('../services/common/constant_sql');
+const Database = require('better-sqlite3');
+const path = require('path');
+const os = require('os');
+const fs = require('fs');
 
 class SyncController {
     
@@ -469,6 +474,69 @@ class SyncController {
             });
         }
     }
+
+    /**
+     * GET /api/sync/backup
+     * Sao lưu tĩnh CSDL SQLite
+     */
+    async backupDatabase(req, res) {
+        try {
+            const tempDir = os.tmpdir();
+            const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
+            const backupFileName = `DigiSports_Backup_${dateStr}.sqlite`;
+            const backupPath = path.join(tempDir, backupFileName);
+
+            const db = new Database(DB_SCHEME);
+            await db.backup(backupPath);
+            db.close();
+
+            res.download(backupPath, backupFileName, (err) => {
+                if (err) {
+                    console.error('Error downloading backup:', err);
+                }
+                setTimeout(() => {
+                    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
+                }, 5000);
+            });
+        } catch (error) {
+            console.error('Error backupDatabase:', error);
+            if (!res.headersSent) {
+                res.status(500).json({ success: false, message: 'Lỗi sao lưu CSDL', error: error.message });
+            }
+        }
+    }
+
+    /**
+     * POST /api/sync/restore
+     * Khôi phục CSDL từ file tải lên
+     */
+    async restoreDatabase(req, res) {
+        try {
+            if (!req.file) {
+                return res.status(400).json({ success: false, message: 'Không tìm thấy file' });
+            }
+
+            const uploadedFile = req.file.path;
+            
+            // Xóa file SHM và WAL để tránh corrupt db sau khi copy
+            if (fs.existsSync(`${DB_SCHEME}-shm`)) fs.unlinkSync(`${DB_SCHEME}-shm`);
+            if (fs.existsSync(`${DB_SCHEME}-wal`)) fs.unlinkSync(`${DB_SCHEME}-wal`);
+            
+            // Ghi đè file chính
+            fs.copyFileSync(uploadedFile, DB_SCHEME);
+            fs.unlinkSync(uploadedFile);
+
+            res.json({ success: true, message: 'Khôi phục CSDL thành công. Ứng dụng sẽ tự động khởi động lại.' });
+            
+            // Restart process to clear all memory sqlite connections
+            setTimeout(() => {
+                process.exit(1);
+            }, 2000);
+        } catch (error) {
+            console.error('Error restoreDatabase:', error);
+            res.status(500).json({ success: false, message: 'Lỗi khôi phục CSDL', error: error.message });
+        }
+    }
 }
 
 module.exports = new SyncController();
diff --git a/server/routes/sync.routes.js b/server/routes/sync.routes.js
index c8bc26c..5a58072 100644
--- a/server/routes/sync.routes.js
+++ b/server/routes/sync.routes.js
@@ -3,6 +3,10 @@ const router = express.Router();
 const SyncController = require('../controllers/sync.controller');
 const { getIP } = require('../config/config');
 const axios = require('axios');
+const multer = require('multer');
+const os = require('os');
+
+const upload = multer({ dest: os.tmpdir() });
 
 // GET /api/sync/local-ip - Lấy IP của máy hiện tại
 router.get('/local-ip', async (req, res) => {
@@ -161,5 +165,11 @@ router.post('/staging/:sessionId/apply', SyncController.applyStagingChanges);
 // DELETE /api/sync/staging/:sessionId - Xóa staging session
 router.delete('/staging/:sessionId', SyncController.deleteStagingSession);
 
+// GET /api/sync/backup - Tải về bản sao lưu database SQLite
+router.get('/backup', SyncController.backupDatabase);
+
+// POST /api/sync/restore - Tải lên bản sao lưu và khôi phục
+router.post('/restore', upload.single('db_file'), SyncController.restoreDatabase);
+
 module.exports = router;
 
```

### 1. Luồng Sao Lưu Dữ Liệu (Backup)
**Mục đích:** Khóa an toàn toàn bộ dữ liệu hiện hành (Các giải đấu, Trọng tài, Bảng điểm...) và xuất ra 1 file duy nhất để người dùng tải về cất trữ ở máy cá nhân, USB hoặc Google Drive.

* **Bước 1 (Frontend):** Người dùng ấn nút **Tải file Sao Lưu** trên màn hình giao diện. Ngay lập tức Front-end sẽ chuyển hướng/mở tab ẩn gọi tới API máy chủ cục bộ: `GET /api/sync/backup`.
* **Bước 2 (Backend Khởi tạo File Tạm):** Trình biên dịch `SyncController` sẽ tạo ra một đường dẫn ngẫu nhiên trên thư mục rác tạm thời của Hệ Điều Hành (OS Temp) với tên dạng `DigiSports_Backup_2026-03-07...sqlite`.
* **Bước 3 (Thư viện SQLite xử lý):** Sử dụng hàm `db.backup()` của thư viện `better-sqlite3`. Đây là kĩ thuật sao chụp trực tiếp (snapshot): 
  * CSDL sẽ mất vài mili-giây để khóa tạm các truy vấn ghi (write), copy dần từng trang bộ nhớ (memory page) dang dở vào chung file tạm đó. 
  * Cách này an toàn tuyệt đối và không gây ra trạng thái tham chiếu lỗi (corrupted) – tốt hơn rất nhiều so với cách copy chay `Ctrl+C / Ctrl+V` thông thường.
* **Bước 4 (Trả kết quả tay người dùng):** Từ Backend dùng lệnh `res.download()` trả luồng tệp đính kèm về cho Frontend xử lý tải xuống hộp thoại của Desktop.
* **Bước 5 (Dọn dẹp hệ thống):** Backend đếm ngược 5 giây sau đó tự động xoá file tạm thời do hàm khởi tạo ở (Bước 2) nhằm không gây lãng phí ổ đĩa dung lượng cao.

### 2. Luồng Khôi Phục Dữ Liệu (Restore)
**Mục đích:** Cập nhật ứng dụng về một bản sao cũ, thay đổi triệt để toàn bộ hiện trạng dữ liệu và khởi động động lại ứng dụng.

* **Bước 1 (Frontend Upload):** Người dùng bấm nút **Khôi phục dữ liệu** và chọn tệp `.sqlite` lên hệ thống. Giao diện sẽ cảnh báo: "*CẢNH BÁO: Thao tác này sẽ GHI ĐÈ dữ liệu hiện tại...*". 
  * Nếu người dùng đồng ý (`OK`), Front-end sẽ nhét tệp vào thư mục `FormData` gửi lên đường dẫn `POST /api/sync/restore`.
* **Bước 2 (Route Middleware):** API `sync.routes.js` có đi kèm một công cụ tên là `multer`. Công cụ này chịu trách nhiệm đỡ file rác gửi từ phía Client lên máy chủ cục bộ và lưu nháp thành 1 file rác tạm thời trong thư mục OS Temp.
* **Bước 3 (Xoá Bộ Đệm Truy Xuất Cảnh Báo Lõi - WAL/SHM):** 
  * CSDL của ứng dụng (Scoreboard ICT) đang chạy ở cơ chế hiệu năng cao của SQLite (gọi là bật chế độ thư mục `WAL - Write Ahead Log`). Chế độ này sinh ra 2 file đi kèm file `.sqlite` chính là: `-shm` (Shared Memory) và `-wal`.
  * Trước khi đắp file CSDL cũ lấy từ máy lên, Backend **phải dùng lệnh thực thi** `fs.unlinkSync` xóa hoàn toàn hiện trạng 2 file này đi. Lý do: nếu file mới đắp vào mà 2 file bộ đệm kia còn lưu địa chỉ tham chiếu chéo tới bộ nhớ CSDL bản cũ, phần mềm sẽ rơi vào hư hỏng cơ sở dữ liệu cấp nặng nề (**fatal corruption**).
* **Bước 4 (Đắp File Chính):** Thực thi copy ghi đè tệp tin tạm của `multer` vừa tạo (ở Bước 2) hoàn toàn xoá sổ file `database.sqlite` của thư mục `USER_DATA_PATH`.
* **Bước 5 (Khởi động Phục hồi Rắn):** 
  * Backend: Sau khi thực sự ghi trả tệp thành công (`success: true`). Backend sẽ đếm 2 giây và chạy lệnh Nodejs là `process.exit(1)`. Hàm này sẽ cưỡng ngắt hoàn toàn bộ nhớ đang chạy Background để triệt phá các kết nối cơ sở CSDL Cũ/Mới. Trình Quản Lý Process (`Electron` / `Nodemon`) sẽ thấy ứng dụng rớt và tự động khởi tạo lại Server kết nối với CSDL vừa đổi.
  * Frontend: Sau thao tác bắt được dòng chữ thành công 200, Web sẽ lập tức hiện thông báo thành công và gọi `window.location.reload()` để tải lại toàn bộ ứng dụng lấy cấu trúc/dữ liệu mới nhất vừa thay trên server.
