const AdminService = require('../services/admin');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');


class AdminController {

    async getDevicesInformation(req, res){  
        try {
            const result  = await AdminService.get_information_device();
            res.status(200).json({
                success: true,
                message: "Thực hiện thành công",
                data: result
            });

        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                data: {}
            });
        }
    }

    async checkExpiredLicense (req, res) {
        try {
            const result  = await AdminService.check_expired_license();
            res.status(200).json({
                success: true,
                message: "Thực hiện thành công",
                data: result
            });

        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                data: {}
            });
        }
    }

    async getInformationSystem (req, res) {
        try {
            const result  = await AdminService.get_information_system();
            res.status(200).json({
                success: true,
                message: "Thực hiện thành công",
                data: result
            });

        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                data: {}
            });
        }
    }    
    
    async updateInformationSystem (req, res) {
        try {
            const result  = await AdminService.update_information_system(req.body);
            res.status(200).json({
                success: true,
                message: "Thực hiện thành công",
                data: result
            });

        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                data: {}
            });
        }
    }    

    async getQRActiveDevice (req, res) {
        try {
            const room_id = req.query.room_id;
            const result  = await AdminService.connect_active_device(room_id);
            res.status(200).json({
                success: true,
                message: "Thực hiện thành công",
                data: result
            });

        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                data: {}
            });
        }
    }

    async getQRRegisterReferrer (req, res) {
        try {
            const room_id = req.query.room_id;
            const result  = await AdminService.connect_register_device(room_id);
            res.status(200).json({
                success: true,
                message: "Thực hiện thành công",
                data: result
            });

        } catch (error) {
            console.log('error: ', error);
            res.status(500).json({
                success: false,
                message: "Hệ thống xử lý lỗi.",
                data: {}
            });
        }
    }
}
let instances = new AdminController();
module.exports = instances;
