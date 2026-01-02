const db = require('../services/init-config');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/logos');
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique: timestamp + random + extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// Filter chỉ cho phép upload ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp, svg)'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

class LogoController {
  // Middleware upload
  static uploadMiddleware = upload.single('logo');

  // Lấy tất cả logos
  static async getAllLogos(req, res) {
    try {
      const logos = await db.getAllLogos();
      return res.json({
        success: true,
        data: logos || []
      });
    } catch (error) {
      console.error('Error getting logos:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách logos'
      });
    }
  }

  // Thêm logo mới
  static async createLogo(req, res) {
    try {
      const { url, position } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL là bắt buộc'
        });
      }

      const result = await db.insertLogo({
        url,
        position: position || 0
      });

      return res.json({
        success: true,
        message: 'Thêm logo thành công',
        data: result
      });
    } catch (error) {
      console.error('Error creating logo:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi thêm logo'
      });
    }
  }

  // Cập nhật logo
  static async updateLogo(req, res) {
    try {
      const { id } = req.params;
      const { url, position } = req.body;

      const result = await db.updateLogo(id, {
        url,
        position
      });

      return res.json({
        success: true,
        message: 'Cập nhật logo thành công',
        data: result
      });
    } catch (error) {
      console.error('Error updating logo:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật logo'
      });
    }
  }

  // Xóa logo
  static async deleteLogo(req, res) {
    try {
      const { id } = req.params;

      await db.deleteLogo(id);

      return res.json({
        success: true,
        message: 'Xóa logo thành công'
      });
    } catch (error) {
      console.error('Error deleting logo:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa logo'
      });
    }
  }

  // Sắp xếp lại logos
  static async reorderLogos(req, res) {
    try {
      const { logos } = req.body;

      if (!Array.isArray(logos)) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ'
        });
      }

      // Cập nhật position cho từng logo
      for (const logo of logos) {
        await db.updateLogo(logo.id, { position: logo.position });
      }

      return res.json({
        success: true,
        message: 'Sắp xếp logos thành công'
      });
    } catch (error) {
      console.error('Error reordering logos:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi sắp xếp logos'
      });
    }
  }

  // Upload logo từ file
  static async uploadLogo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Không có file được upload'
        });
      }

      // Tạo URL cho file đã upload
      const fileUrl = `http://localhost:6789/uploads/logos/${req.file.filename}`;

      // Lấy position từ body hoặc mặc định
      const position = req.body.position || 0;

      // Lưu vào database
      const result = await db.insertLogo({
        url: fileUrl,
        position: position
      });

      return res.json({
        success: true,
        message: 'Upload logo thành công',
        data: {
          ...result,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      // Xóa file nếu có lỗi
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads/logos', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      console.error('Error uploading logo:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi upload logo'
      });
    }
  }

  // Xóa file logo khỏi server
  static async deleteLogoFile(filename) {
    try {
      const filePath = path.join(__dirname, '../uploads/logos', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Đã xóa file:', filename);
      }
    } catch (error) {
      console.error('Lỗi khi xóa file:', error);
    }
  }
}

module.exports = LogoController;

