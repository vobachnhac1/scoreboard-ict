import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserGuide() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState(null);

  const tabs = [
    {
      id: "overview",
      name: "Tổng quan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "setup",
      name: "Cài đặt ban đầu",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "competition",
      name: "Quản lý giải đấu",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
    {
      id: "scoring",
      name: "Chấm điểm",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "connection",
      name: "Kết nối thiết bị",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "reports",
      name: "Báo cáo",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "troubleshooting",
      name: "Xử lý sự cố",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const guides = {
    overview: {
      title: "Tổng quan hệ thống",
      sections: [
        {
          title: "Giới thiệu",
          content:
            "DIGISPORTS là phần mềm quản lý thi đấu thể thao chuyên nghiệp, hỗ trợ chấm điểm thời gian thực, quản lý kết nối thiết bị và tạo báo cáo chi tiết.",
          steps: [
            "Hệ thống chấm điểm tự động với nhiều bộ môn",
            "Kết nối đa thiết bị qua Socket.IO",
            "Báo cáo và in ấn kết quả chuyên nghiệp",
            "Quản lý giải đấu, vận động viên, trọng tài",
          ],
        },
        {
          title: "Yêu cầu hệ thống",
          content:
            "Để sử dụng phần mềm hiệu quả, hệ thống cần đáp ứng các yêu cầu sau:",
          steps: [
            "Hệ điều hành: Windows 10+, macOS 10.15+",
            "RAM: Tối thiểu 4GB (khuyến nghị 8GB)",
            "Kết nối mạng: WiFi hoặc LAN ổn định",
            "Thiết bị giám định: Tablet/Smartphone có trình duyệt web",
          ],
        },
      ],
    },
    setup: {
      title: "Cài đặt ban đầu",
      sections: [
        {
          title: "Bước 1: Cấu hình hệ thống",
          content:
            "Truy cập menu Quản lý cài đặt để thiết lập thông tin cơ bản:",
          steps: [
            "Nhập tên giải đấu, địa điểm tổ chức",
            "Upload logo giải đấu (hỗ trợ PNG, JPG)",
            "Thiết lập số lượng giám định (3, 5, 7 người)",
            "Cấu hình thời gian thi đấu mặc định",
          ],
          image: "/api/placeholder/600/300",
        },
        {
          title: "Bước 2: Tạo Room kết nối",
          content:
            "Tạo phòng kết nối để các thiết bị giám định có thể tham gia:",
          steps: [
            "Vào menu 'Quản lý kết nối'",
            "Nhấn nút 'Scan QR' để tạo mã QR",
            "Lưu lại Room ID và UUID Desktop",
            "Chia sẻ mã QR cho các thiết bị giám định",
          ],
        },
      ],
    },
    competition: {
      title: "Quản lý giải đấu",
      sections: [
        {
          title: "Tạo giải đấu mới",
          content: "Hướng dẫn tạo và quản lý giải đấu:",
          steps: [
            "Vào 'Quản lý giải đấu' → Nhấn 'Tạo mới'",
            "Nhập thông tin: Tên giải, ngày bắt đầu/kết thúc",
            "Chọn các bộ môn thi đấu (Quyền, Võ Nhạc, Đối Kháng)",
            "Thêm danh sách vận động viên và đội thi đấu",
            "Lưu và kích hoạt giải đấu",
          ],
        },
        {
          title: "Quản lý trận đấu",
          content: "Tạo và sắp xếp lịch thi đấu:",
          steps: [
            "Chọn giải đấu → Vào tab 'Trận đấu'",
            "Nhấn 'Thêm trận đấu' và chọn bộ môn",
            "Chọn vận động viên/đội tham gia",
            "Thiết lập thời gian và sân thi đấu",
            "Nhấn 'Bắt đầu' để vào màn hình chấm điểm",
          ],
        },
      ],
    },
    scoring: {
      title: "Hướng dẫn chấm điểm",
      sections: [
        {
          title: "Chấm điểm Quyền/Võ Nhạc",
          content: "Quy trình chấm điểm cho bộ môn biểu diễn:",
          steps: [
            "Nhấn F1 để mở quản lý kết nối thiết bị",
            "Đăng ký quyền giám định cho từng thiết bị (GĐ1, GĐ2...)",
            "Nhấn 'Bắt đầu' để bắt đầu trận đấu",
            "Giám định nhập điểm trên thiết bị di động",
            "Hệ thống tự động tính điểm trung bình",
            "Nhấn 'Kết thúc' để lưu kết quả",
          ],
        },
        {
          title: "Chấm điểm Đối Kháng",
          content: "Quy trình chấm điểm cho bộ môn đối kháng:",
          steps: [
            "Thiết lập cấu hình trận đấu (số hiệp, thời gian)",
            "Kết nối thiết bị giám định và phân quyền",
            "Sử dụng các nút: +1, +2, +3 điểm cho mỗi bên",
            "Ghi nhận hành động: Ngã, Cảnh cáo, Nhắc nhở",
            "Hệ thống tự động đếm thời gian và tính điểm",
            "Chọn người chiến thắng khi kết thúc",
          ],
        },
      ],
    },
    connection: {
      title: "Quản lý kết nối thiết bị",
      sections: [
        {
          title: "Kết nối thiết bị giám định",
          content: "Hướng dẫn kết nối thiết bị di động vào hệ thống:",
          steps: [
            "Đảm bảo thiết bị di động và máy chủ cùng mạng WiFi",
            "Trên máy chủ: Vào 'Quản lý kết nối' → Nhấn 'Scan QR'",
            "Trên thiết bị di động: Mở camera và quét mã QR",
            "Hoặc nhập thủ công Room ID và UUID Desktop",
            "Chờ thiết bị hiển thị trong danh sách kết nối",
            "Cấp quyền giám định cho thiết bị (GĐ1, GĐ2...)",
          ],
        },
        {
          title: "Quản lý quyền thiết bị",
          content: "Phân quyền và quản lý các thiết bị đã kết nối:",
          steps: [
            "Xem danh sách thiết bị trong bảng quản lý",
            "Nhấn 'Đăng ký' để cấp quyền giám định",
            "Chọn vai trò: Giám định 1, 2, 3... hoặc Trọng tài",
            "Sử dụng 'Tắt tất cả' để ngắt kết nối hàng loạt",
            "Nhấn 'Làm mới' để cập nhật trạng thái thiết bị",
            "IP thiết bị được mã hóa để bảo mật",
          ],
        },
        {
          title: "Xử lý sự cố kết nối",
          content: "Các bước khắc phục khi gặp vấn đề kết nối:",
          steps: [
            "Kiểm tra kết nối WiFi/LAN của cả 2 thiết bị",
            "Đảm bảo không có tường lửa chặn cổng Socket.IO",
            "Thử tắt và bật lại WiFi trên thiết bị di động",
            "Làm mới trang web trên thiết bị di động",
            "Kiểm tra Room ID và UUID Desktop có đúng không",
            "Khởi động lại ứng dụng nếu vẫn không kết nối được",
          ],
        },
      ],
    },
    reports: {
      title: "Báo cáo và in ấn",
      sections: [
        {
          title: "Xuất báo cáo kết quả",
          content: "Tạo và xuất báo cáo kết quả thi đấu:",
          steps: [
            "Vào menu 'Báo cáo' → Chọn loại báo cáo",
            "Chọn giải đấu và bộ môn cần xuất báo cáo",
            "Xem trước báo cáo trên màn hình",
            "Nhấn 'In' hoặc Ctrl+P để mở hộp thoại in",
            "Chọn 'Save as PDF' để lưu file PDF",
            "Hoặc chọn máy in để in trực tiếp",
          ],
        },
        {
          title: "Các loại báo cáo",
          content: "Hệ thống hỗ trợ nhiều loại báo cáo khác nhau:",
          steps: [
            "Báo cáo kết quả Quyền/Võ Nhạc: Điểm chi tiết từng giám định",
            "Báo cáo kết quả Đối Kháng: Điểm theo hiệp, hành động",
            "Bảng xếp hạng: Tổng hợp điểm và thứ hạng",
            "Danh sách vận động viên: Thông tin chi tiết VĐV",
            "Lịch thi đấu: Thời gian và sân thi đấu",
            "Thống kê tổng quan: Số liệu tổng hợp giải đấu",
          ],
        },
      ],
    },
    troubleshooting: {
      title: "Xử lý sự cố thường gặp",
      sections: [
        {
          title: "Sự cố về kết nối",
          content: "Giải quyết các vấn đề liên quan đến kết nối:",
          steps: [
            "Thiết bị không kết nối được: Kiểm tra WiFi, Room ID",
            "Mất kết nối giữa chừng: Kiểm tra độ ổn định mạng",
            "Không quét được QR: Thử nhập thủ công Room ID",
            "Thiết bị không hiển thị: Làm mới danh sách kết nối",
            "Lỗi Socket.IO: Khởi động lại server và client",
          ],
        },
        {
          title: "Sự cố về chấm điểm",
          content: "Xử lý các vấn đề trong quá trình chấm điểm:",
          steps: [
            "Điểm không cập nhật: Kiểm tra kết nối thiết bị giám định",
            "Điểm sai: Sử dụng chức năng sửa điểm (nếu có)",
            "Không bắt đầu được: Kiểm tra đã đăng ký đủ giám định chưa",
            "Thời gian không chạy: Làm mới trang và thử lại",
            "Lỗi tính điểm: Kiểm tra cấu hình số giám định",
          ],
        },
        {
          title: "Sự cố về dữ liệu",
          content: "Khắc phục các vấn đề liên quan đến dữ liệu:",
          steps: [
            "Mất dữ liệu: Kiểm tra database backup",
            "Không lưu được: Kiểm tra quyền ghi file",
            "Dữ liệu sai: Sử dụng chức năng import/export để sửa",
            "Không tải được giải đấu: Kiểm tra file cấu hình",
            "Lỗi database: Liên hệ quản trị viên hệ thống",
          ],
        },
        {
          title: "Liên hệ hỗ trợ",
          content: "Khi cần hỗ trợ kỹ thuật:",
          steps: [
            "Ghi lại chi tiết lỗi: Thông báo lỗi, thời điểm xảy ra",
            "Chụp màn hình lỗi nếu có thể",
            "Kiểm tra phiên bản phần mềm đang sử dụng",
            "Liên hệ qua email: support@digisports.vn",
            "Hoặc gọi hotline: 1900-xxxx (giờ hành chính)",
          ],
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                    Hướng dẫn sử dụng
                  </h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tài liệu chi tiết về cách sử dụng phần mềm DIGISPORTS
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded  shadow-xl p-4 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">
                Mục lục
              </h3>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded font-semibold transition-all duration-200 flex items-center gap-3 ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded  shadow-xl p-8">
              {guides[activeTab] && (
                <div>
                  {/* Title */}
                  <div className="mb-8">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                      {guides[activeTab].title}
                    </h2>
                    <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-6">
                    {guides[activeTab].sections.map((section, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden"
                      >
                        {/* Section Header */}
                        <button
                          onClick={() =>
                            setExpandedSection(
                              expandedSection === index ? null : index,
                            )
                          }
                          className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-left">
                              {section.title}
                            </h3>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                              expandedSection === index ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Section Content */}
                        {expandedSection === index && (
                          <div className="px-6 py-6 bg-white dark:bg-gray-800">
                            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                              {section.content}
                            </p>

                            {section.steps && (
                              <div className="space-y-3">
                                {section.steps.map((step, stepIndex) => (
                                  <div
                                    key={stepIndex}
                                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded"
                                  >
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                      {stepIndex + 1}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 flex-1">
                                      {step}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {section.image && (
                              <div className="mt-6">
                                <img
                                  src={section.image}
                                  alt={section.title}
                                  className="w-full rounded border border-gray-200 dark:border-gray-700"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
