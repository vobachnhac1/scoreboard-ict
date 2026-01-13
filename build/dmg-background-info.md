# DMG Background Image

## Yêu cầu

- **Kích thước**: 540x380 pixels (theo cấu hình trong package.json)
- **Format**: PNG
- **Tên file**: `dmg-background.png`
- **Vị trí**: `build/dmg-background.png`

## Tạo background đơn giản

Nếu chưa có file background, bạn có thể:

### Option 1: Tạo background đơn giản bằng ImageMagick
```bash
# Cài ImageMagick nếu chưa có
brew install imagemagick

# Tạo background gradient đơn giản
convert -size 540x380 gradient:#ffffff-#f0f0f0 build/dmg-background.png
```

### Option 2: Tạo bằng sips (built-in macOS)
```bash
# Tạo background trắng đơn giản
sips -z 380 540 --setProperty format png build/icon.png --out build/dmg-background.png
```

### Option 3: Không dùng background
Xóa dòng `"background"` trong `package.json`:
```json
"dmg": {
  "title": "${productName} ${version}",
  "icon": "build/icon.icns",
  // Xóa dòng này: "background": "build/dmg-background.png",
  "contents": [...]
}
```

## Design Guidelines

Nếu muốn design background chuyên nghiệp:

1. **Kích thước**: 540x380 pixels
2. **Vị trí icon app**: x=130, y=220
3. **Vị trí Applications folder**: x=410, y=220
4. **Màu sắc**: Nên dùng màu nhạt, không quá chói
5. **Text**: Có thể thêm text hướng dẫn "Drag to Applications"

## Ví dụ layout

```
┌─────────────────────────────────────────┐
│                                         │
│         ScoreBoard                      │
│         Võ Hiện Đại                     │
│                                         │
│                                         │
│    [App Icon]  →  [Applications]        │
│       (130,220)       (410,220)         │
│                                         │
│  Drag icon to Applications to install   │
│                                         │
└─────────────────────────────────────────┘
     540 x 380 pixels
```

## Tạm thời bỏ qua

Nếu không muốn custom background, có thể comment dòng trong package.json:
```json
"dmg": {
  "title": "${productName} ${version}",
  "icon": "build/icon.icns",
  // "background": "build/dmg-background.png",  // Comment dòng này
  ...
}
```

macOS sẽ dùng background mặc định (trắng).

