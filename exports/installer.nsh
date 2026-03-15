; ==========================================================
; DIGISPORTS PROFESSIONAL INSTALLER SCRIPT
; ==========================================================
; Tác giả: NhacVB
; Cập nhật ngày: 12/03/2026
; ==========================================================

!include "LogicLib.nsh"

; --- ĐỊNH NGHĨA CHUỖI VĂN BẢN (Ghi đè mặc định) ---
; Tiếng Việt (1066)
LangString WELCOME_TITLE 1066 "Hệ thống Chấm điểm & Trọng tài DigiSports"
LangString WELCOME_TEXT 1066 "Chào mừng quý khách đến với quy trình cài đặt DigiSports.$\n$\nGiải pháp công nghệ chuyên dụng hỗ trợ tối ưu cho công tác trọng tài, điều hành và chấm điểm các giải thi đấu thể thao.$\n$\nVui lòng nhấn 'Tiếp tục' để bắt đầu quá trình thiết lập hệ thống."
LangString FINISH_TITLE 1066 "Hoàn tất Cài đặt Thành công"
LangString FINISH_TEXT 1066 "Hệ thống DigiSports đã được cài đặt thành công và chuẩn bị sẵn sàng.$\n$\nCảm ơn quý khách đã tin dùng sản phẩm của chúng tôi."

; Override Standard MUI Strings (Tiếng Việt)
LangString MUI_TEXT_LICENSE_TITLE 1066 "Thỏa thuận Bản quyền"
LangString MUI_TEXT_LICENSE_SUBTITLE 1066 "Vui lòng xem kỹ các điều khoản trước khi cài đặt DigiSports."
LangString MUI_INNERTEXT_LICENSE_BOTTOM 1066 "Nếu quý khách chấp nhận các điều khoản, hãy nhấn 'Tôi Đồng Ý' để tiếp tục. Quý khách phải chấp nhận thỏa thuận này để cài đặt phần mềm."
LangString MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX 1066 "Tôi chấp nhận các điều khoản trong Thỏa thuận Bản quyền"
LangString MUI_BUTTONTEXT_INSTALL 1066 "Cài đặt"

; Override Installation Options Page (Tiếng Việt)
LangString MUI_TEXT_INSTALL_OPTIONS_TITLE 1066 "Tùy chọn Cài đặt"
LangString MUI_TEXT_INSTALL_OPTIONS_SUBTITLE 1066 "Chọn đối tượng sử dụng phần mềm này."
LangString MUI_INNERTEXT_INSTALL_OPTIONS_TOP 1066 "Vui lòng chọn việc cài đặt DigiSports cho tất cả người dùng trên máy tính này hay chỉ riêng quý khách."
LangString MUI_INNERTEXT_INSTALL_OPTIONS_ALL_USERS 1066 "Bất kỳ ai sử dụng máy tính này (tất cả người dùng)"
LangString MUI_INNERTEXT_INSTALL_OPTIONS_CURRENT_USER 1066 "Chỉ mình tôi sử dụng"

; Override Installing Page (Tiếng Việt)
LangString MUI_TEXT_INSTALLING_TITLE 1066 "Đang cài đặt"
LangString MUI_TEXT_INSTALLING_SUBTITLE 1066 "Vui lòng đợi trong khi DigiSports đang được thiết lập trên hệ thống."

; Override Directory Page (Tiếng Việt - Đề phòng nếu hiện trang chọn thư mục)
LangString MUI_TEXT_DIRECTORY_TITLE 1066 "Chọn Vị trí Cài đặt"
LangString MUI_TEXT_DIRECTORY_SUBTITLE 1066 "Chọn thư mục để cài đặt DigiSports."

; Override Uninstaller Pages (Tiếng Việt)
LangString MUI_UNTEXT_CONFIRM_TITLE 1066 "Gỡ cài đặt DigiSports"
LangString MUI_UNTEXT_CONFIRM_SUBTITLE 1066 "Gỡ bỏ DigiSports khỏi máy tính của quý khách."
LangString MUI_UNTEXT_UNINSTALLING_TITLE 1066 "Đang tiến hành gỡ bỏ"
LangString MUI_UNTEXT_UNINSTALLING_SUBTITLE 1066 "Vui lòng đợi trong khi DigiSports đang được gỡ bỏ."
LangString MUI_UNTEXT_FINISH_TITLE 1066 "Gỡ cài đặt Hoàn tất"
LangString MUI_UNTEXT_FINISH_SUBTITLE 1066 "DigiSports đã được gỡ bỏ thành công."

LangString MUI_TEXT_WELCOME_INFO_TITLE 1066 "$(WELCOME_TITLE)"
LangString MUI_TEXT_WELCOME_INFO_TEXT 1066 "$(WELCOME_TEXT)"
LangString MUI_TEXT_FINISH_INFO_TITLE 1066 "$(FINISH_TITLE)"
LangString MUI_TEXT_FINISH_INFO_TEXT 1066 "$(FINISH_TEXT)"

; Tiếng Anh (1033) - Dự phòng nhưng vẫn ép hiện Tiếng Việt cho branding
LangString WELCOME_TITLE 1033 "DigiSports Scoreboard & Referee System"
LangString WELCOME_TEXT 1033 "Welcome to the DigiSports Setup Wizard.$\n$\nProfessional technology solution for sports refereeing and scoring operations.$\n$\nClick 'Next' to continue the installation."
LangString FINISH_TITLE 1033 "Installation Completed Successfully"
LangString FINISH_TEXT 1033 "DigiSports has been installed on your computer.$\n$\nThank you for choosing our product."

; --- Tùy chỉnh Header & Branding ---
!macro customHeader
  BrandingText "DigiSports - Giải pháp Chấm điểm Chuyên nghiệp"
  
  ; Ép các nút bấm sang Tiếng Việt (Global)
  LangString ^Next 1066 "Tiếp tục >"
  LangString ^Back 1066 "< Quay lại"
  LangString ^Agree 1066 "Tôi Đồng Ý"
  LangString ^Cancel 1066 "Hủy bỏ"
  LangString ^Close 1066 "Đóng"
  LangString ^Install 1066 "Cài đặt"
  LangString ^Uninstall 1066 "Gỡ cài đặt"
  LangString ^Finish 1066 "Hoàn tất"

  !system "echo '---------------------------------------------------------'"
  !system "echo '   Building Professional DigiSports Setup Package       '"
  !system "echo '---------------------------------------------------------'"
!macroend

; --- Khởi tạo Trình cài đặt ---
!macro customInit
  ; Kiểm tra xem ứng dụng có đang mở không trước khi cài đặt phiên bản mới
  FindWindow $0 "" "DigiSports"
  ${If} $0 != 0
    MessageBox MB_OK|MB_ICONSTOP "Phiên bản khác của DigiSports đang chạy. Vui lòng đóng ứng dụng trước khi tiếp tục cài đặt."
    Quit
  ${EndIf}
!macroend

; --- Logic sau khi cài đặt xong ---
!macro customInstall
  ; Đăng ký thông tin vào Registry để trông chuyên nghiệp trong hệ thống
  WriteRegStr HKLM "Software\DigiSports" "Manufacturer" "DigiSports Technology"
  WriteRegStr HKLM "Software\DigiSports" "Product" "DigiSports Scoreboard"
  WriteRegStr HKLM "Software\DigiSports" "SupportEmail" "support@digisports.vn"
  WriteRegStr HKLM "Software\DigiSports" "InstallationDate" "${__DATE__}"
  WriteRegStr HKLM "Software\DigiSports" "InstallPath" "$INSTDIR"
!macroend

; --- Kiểm tra trước khi gỡ cài đặt ---
!macro customUnInit
  FindWindow $0 "" "DigiSports"
  ${If} $0 != 0
    MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "Phần mềm DigiSports đang mở. Vui lòng đóng ứng dụng trước khi thực hiện gỡ cài đặt." IDRETRY -3
    Quit
  ${EndIf}
!macroend

; --- Quy trình gỡ cài đặt (Uninstaller logic) ---
!macro customUnInstall
  DeleteRegKey HKLM "Software\DigiSports"
  
  MessageBox MB_YESNO|MB_ICONQUESTION "Quý khách có muốn xóa toàn bộ dữ liệu người dùng và lịch sử thi đấu không?$\n(Lưu ý: Dữ liệu này thường nằm trong thư mục AppData)" IDNO +2
    RMDir /r "$APPDATA\digisports"
!macroend
