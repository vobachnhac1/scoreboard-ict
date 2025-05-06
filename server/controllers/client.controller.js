const ClientService = require('../services/client');

class ClientController {

    async clientCheckActive (req, res) {
        try {
            const result  = await ClientService.verify_active(req.body);
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

    async clientRegisterReferrer (req, res) {
        try {
            const result  = await ClientService.register_referrer(req.body);
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
            const result  = await ClientService.get_config_system();
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
let instances = new ClientController();
module.exports = instances;
