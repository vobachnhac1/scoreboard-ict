# MatchListModal Component

Modal hiển thị danh sách trận đấu với khả năng tìm kiếm, lọc và thực hiện hành động.

## Features

- ✅ Hiển thị danh sách trận đấu dạng list
- ✅ Tìm kiếm theo số trận, tên VĐV, đội
- ✅ Lọc theo trạng thái (Chờ thi đấu, Đang thi đấu, Đã kết thúc)
- ✅ Chọn trận đấu
- ✅ Bắt đầu trận đấu trực tiếp từ modal
- ✅ Hiển thị trận đang thi đấu
- ✅ Hiển thị người thắng cuộc
- ✅ Dark mode support
- ✅ Responsive design

## Usage

```jsx
import React, { useState } from "react";
import MatchListModal from "../../components/MatchListModal";

function MyComponent() {
  const [showMatchList, setShowMatchList] = useState(false);
  const [currentMatchId, setCurrentMatchId] = useState(null);

  // Sample matches data
  const matches = [
    {
      id: 1,
      match_no: 1,
      red_name: "Nguyễn Văn A",
      red_unit: "Bình Tân",
      red_country: "vietnam",
      blue_name: "Trần Văn B",
      blue_unit: "Tân Phú",
      blue_country: "vietnam",
      status: "PENDING", // PENDING, ONGOING, FINISHED
      match_name: "Vòng loại",
      team_name: "Đội 1",
      winner: null, // "RED" or "BLUE" when finished
    },
    {
      id: 2,
      match_no: 2,
      red_name: "Lê Thị C",
      red_unit: "Quận 1",
      red_country: "vietnam",
      blue_name: "Phạm Văn D",
      blue_unit: "Quận 3",
      blue_country: "vietnam",
      status: "ONGOING",
      match_name: "Vòng loại",
      team_name: "Đội 2",
      winner: null,
    },
    {
      id: 3,
      match_no: 3,
      red_name: "Hoàng Văn E",
      red_unit: "Quận 5",
      red_country: "vietnam",
      blue_name: "Võ Thị F",
      blue_unit: "Quận 7",
      blue_country: "vietnam",
      status: "FINISHED",
      match_name: "Vòng loại",
      team_name: "Đội 3",
      winner: "RED",
    },
  ];

  const handleSelectMatch = (match) => {
    console.log("Selected match:", match);
  };

  const handleStartMatch = (match) => {
    console.log("Start match:", match);
    setCurrentMatchId(match.id);
    // Navigate to match scoring screen or start match logic
  };

  return (
    <div>
      <button onClick={() => setShowMatchList(true)}>
        Xem danh sách trận đấu
      </button>

      <MatchListModal
        isOpen={showMatchList}
        onClose={() => setShowMatchList(false)}
        matches={matches}
        onSelectMatch={handleSelectMatch}
        onStartMatch={handleStartMatch}
        currentMatchId={currentMatchId}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | boolean | Yes | - | Trạng thái mở/đóng modal |
| `onClose` | function | Yes | - | Callback khi đóng modal |
| `matches` | array | No | [] | Danh sách trận đấu |
| `onSelectMatch` | function | No | - | Callback khi chọn trận |
| `onStartMatch` | function | No | - | Callback khi bắt đầu trận |
| `currentMatchId` | number | No | null | ID trận đang thi đấu |

## Match Object Structure

```javascript
{
  id: number,              // ID trận đấu
  match_no: number,        // Số trận
  red_name: string,        // Tên VĐV đỏ
  red_unit: string,        // Đơn vị VĐV đỏ
  red_country: string,     // Quốc gia VĐV đỏ
  blue_name: string,       // Tên VĐV xanh
  blue_unit: string,       // Đơn vị VĐV xanh
  blue_country: string,    // Quốc gia VĐV xanh
  status: string,          // "PENDING" | "ONGOING" | "FINISHED"
  match_name: string,      // Tên trận (optional)
  team_name: string,       // Tên đội (optional)
  winner: string | null,   // "RED" | "BLUE" | null
}
```

## Status Values

- `PENDING` - Chờ thi đấu (màu vàng)
- `ONGOING` - Đang thi đấu (màu xanh lá)
- `FINISHED` - Đã kết thúc (màu xám)

## Features Detail

### Search
- Tìm kiếm theo số trận
- Tìm kiếm theo tên VĐV (đỏ hoặc xanh)
- Tìm kiếm theo tên đội

### Filter
- Tất cả
- Chờ thi đấu
- Đang thi đấu
- Đã kết thúc

### Actions
- **Bắt đầu** - Hiển thị cho trận có status PENDING
- **Xem** - Hiển thị cho trận có status ONGOING
- Click vào card để chọn trận

### Visual Indicators
- Border xanh dương - Trận được chọn
- Border xanh lá - Trận đang thi đấu
- Badge "Đang thi đấu" - Hiển thị ở góc trên bên phải
- Icon ngôi sao vàng - Hiển thị bên người thắng cuộc

