# DataSync Component Architecture

## 📋 Tổng quan

Component **DataSync** đã được refactor từ monolithic file (~3,785 lines) thành cấu trúc modular.

---

## 🗂️ Cấu trúc Thư mục

```
app/views/Management/DataSync/
├── DataSync.jsx                    # Main component (sẽ được refactor)
├── components/
│   ├── index.js                    # Export barrel file
│   ├── NetworkConnection.jsx       # Kết nối mạng thủ công
│   ├── TableSelection.jsx          # Chọn bảng để sync
│   ├── RecordsView.jsx             # Hiển thị records với dynamic columns
│   ├── CompetitionDKMultiView.jsx  # Multi-record view cho competition_dk
│   ├── StagingSection.jsx          # Sessions và review staging data
│   ├── DatabaseCleanupModal.jsx    # Modal xóa bảng
│   └── RecordDetailModal.jsx       # Modal xem chi tiết record
├── hooks/
│   └── useDataSync.js              # Custom hook chứa state & logic
└── utils/
    └── columnConfig.js             # Column configuration & filtering
```

---

## 🧩 Chi tiết Components

### **1. `useDataSync.js` — Custom Hook (722 lines)**

Centralized state management và business logic

**State Categories**:

- Tables & Sync, Record View, Competition_DK, Network, Staging, Cleanup

**Key Functions** (60+):

- loadAvailableTables(), loadTableRecords(), loadStagingSessions()
- handleRecordToggle(), handleSelectAllRecords(), handleDeleteRecord()
- toggleCompDKMultiView(), toggleCompDKRecord(), toggleCardExpand()
- handleManualConnect(), handleScanNetwork(), handleConnectScanned()
- handleSyncSelectedDataRows(), handleSendRequest(), handleReceiveData()
- handleOpenSession(), handleUpdateMapping(), handleApplyStaging()

---

### **2. `columnConfig.js` — Utility**

Column configuration cho từng bảng với tên tiếng Việt

Exports: `getColumnConfig()`, `buildColumnConfig()`, `filterColumns()`

---

### **3. `NetworkConnection.jsx`**

Kết nối mạng thủ công: Server code, manual IP input, network scan

---

### **4. `TableSelection.jsx`**

Checkbox list tables với select all/none

---

### **5. `RecordsView.jsx`**

Dynamic columns table, column visibility toggles, special rendering cho competition_dk.data

---

### **6. `CompetitionDKMultiView.jsx`**

Multi-record view với:

- Sticky toolbar
- Record selector (expand/collapse)
- Multiple data table cards (expand/collapse)

---

### **7. `StagingSection.jsx`**

Sessions list + review interface với mapping controls

---

### **8-9. Modals**

DatabaseCleanupModal, RecordDetailModal

---

Xem full docs tại file này.

```
┌──────────────────────────────────────────────────────────────┐
│  DataSync.jsx (Main Orchestrator)                            │
│  - useDataSync() hook                                        │
│  - Destructure state & handlers                              │
│  - Render layout + route sub-components                      │
└──────────────────────────────────────────────────────────────┘
                            │
                            ├─→ NetworkConnection
                            │   └─→ Manual IP, Scan, Connect
                            │
                            ├─→ TableSelection
                            │   └─→ Checkbox list + Select all/none
                            │
                            ├─→ RecordsView
                            │   ├─→ Dynamic columns table
                            │   ├─→ Column config UI
                            │   ├─→ renderCellValue() per cell
                            │   └─→ CompetitionDKMultiView (if competition_dk + multi-view ON)
                            │       ├─→ Record selector (expand/collapse)
                            │       └─→ Multiple cards (expand/collapse)
                            │
                            ├─→ StagingSection
                            │   ├─→ Sessions list
                            │   └─→ Review table + mapping controls
                            │
                            └─→ Modals
                                ├─→ DatabaseCleanupModal
                                └─→ RecordDetailModal
```

---

## 🚀 Cách sử dụng trong DataSync.jsx

**Trước** (monolithic):

```javascript
const DataSync = () => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  // ... 50+ more states

  const loadAvailableTables = async () => {
    /* ... */
  };
  const handleTableToggle = () => {
    /* ... */
  };
  // ... 60+ more functions

  return <div>{/* 3,785 lines of JSX */}</div>;
};
```

**Sau** (modular):

```javascript
import { useDataSync } from "./hooks/useDataSync";
import {
  NetworkConnection,
  TableSelection,
  RecordsView,
  CompetitionDKMultiView,
  StagingSection,
  DatabaseCleanupModal,
  RecordDetailModal,
} from "./components";

const DataSync = () => {
  const {
    // All state and handlers from hook
    availableTables,
    selectedTables,
    viewMode,
    tableRecords,
    stagingSessions,
    localIP,
    handleRefreshAll,
    handleTableToggle,
    handleRecordToggle,
    // ... destructure what you need
  } = useDataSync();

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header với Refresh button */}
      <div className="mb-6 flex justify-between">
        <h2>Đồng bộ dữ liệu</h2>
        <button onClick={handleRefreshAll}>Làm mới</button>
      </div>

      {/* Network Section */}
      <NetworkConnection
        localIP={localIP}
        manualServerIP={manualServerIP}
        setManualServerIP={setManualServerIP}
        isManualConnected={isManualConnected}
        handleManualConnect={handleManualConnect}
        handleScanNetwork={handleScanNetwork}
        // ... other props
      />

      {/* Send Data Section */}
      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded shadow">
        <h2>GỬI DỮ LIỆU ĐẾN MÁY KHÁC</h2>

        {viewMode === "table" ? (
          <TableSelection
            availableTables={availableTables}
            selectedTables={selectedTables}
            handleTableToggle={handleTableToggle}
          />
        ) : (
          <RecordsView
            selectedTableForRecords={selectedTableForRecords}
            tableRecords={tableRecords}
            loadingRecords={loadingRecords}
            // ... many props
          />
        )}
      </div>

      {/* Staging Section */}
      <StagingSection
        stagingSessions={stagingSessions}
        stagingView={stagingView}
        // ... staging props
      />

      {/* Modals */}
      <RecordDetailModal
        show={showRecordDetail}
        record={detailRecord}
        onClose={handleCloseRecordDetail}
      />
      <DatabaseCleanupModal
        show={showCleanupModal}
        allDatabaseTables={allDatabaseTables}
        {...cleanupProps}
      />
    </div>
  );
};
```

---

## ✅ Benefits của Refactor

| Khía cạnh           | Trước                            | Sau                               |
| ------------------- | -------------------------------- | --------------------------------- |
| **File size**       | 3,785 lines monolithic           | ~300 lines orchestration          |
| **Maintainability** | ❌ Khó tìm logic                 | ✅ Mỗi file < 300 lines           |
| **Testability**     | ❌ Phải test toàn bộ             | ✅ Test từng component/hook riêng |
| **Reusability**     | ❌ Logic bị lock trong component | ✅ Hook + utils reusable          |
| **Collaboration**   | ❌ Conflict merge thường xuyên   | ✅ Team làm song song             |
| **Performance**     | ❌ Re-render toàn bộ             | ✅ React.memo từng component      |

---

## 📝 Next Steps

1. ✅ **Đã hoàn thành**:
   - Custom hook `useDataSync.js`
   - Utility `columnConfig.js`
   - 7 UI components
   - Export barrel file `components/index.js`

2. ⏳ **Chưa hoàn thành**:
   - **Refactor main `DataSync.jsx`** để sử dụng hook và components
   - Test toàn bộ flow
   - Check dark mode styling
   - Verify no console errors

3. 🚀 **Tối ưu thêm** (optional):
   - Add React.memo cho performance
   - Extract more utility functions
   - Add PropTypes validation
   - Create unit tests

---

## 🐛 Troubleshooting

**Nếu gặp lỗi import**:

```javascript
// Ensure barrel export in components/index.js
export { default as NetworkConnection } from "./NetworkConnection";
// ...

// Import in DataSync.jsx
import { NetworkConnection, TableSelection } from "./components";
```

**Nếu missing props**:

- Check hook return object có export state/handler đó chưa
- Verify component destructure đúng prop name

**Nếu state không update**:

- Confirm setter được pass qua props (vd: `setColumnConfig`, `setExpandedCards`)
- Check hook có expose setter đó trong return không

---

## 📚 Related Files

- **Backend API**: `backend/src/routes/sync.js` — Endpoints cho sync logic
- **Socket Events**: `backend/src/sockets/handlers/syncHandlers.js`
- **IpMasker**: `app/common/IpMasker.js` — AES encryption cho IP
- **Redux**: `app/config/reducers/configSystemSlice.js`, `app/config/reducers/socketSlice.js`

---

**Tài liệu này được tạo tự động bởi Claude Code vào ngày 2025**
