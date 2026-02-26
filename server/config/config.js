const os = require('os');
const si = require('systeminformation');


// Khởi tạo cấu hình
InitProject = () => {
    // lấy maccaddress | license
    try {
        const networkInterfaces = os.networkInterfaces();
        let macAddress = null;
        for (const name of Object.keys(networkInterfaces)) {
            if(macAddress) break;
            const netInterface = networkInterfaces[name];
            if (netInterface) {
            for (const iface of netInterface) {
            if(macAddress) break;
                if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
                macAddress = iface.mac
                }
            }
            }
        }  
        return macAddress;
    } catch (error) {
        return null;
    }
};

getMacAddress = () => {
    // lấy maccaddress | license
    try {
        const networkInterfaces = os.networkInterfaces();
        let macAddress = null;
        for (const name of Object.keys(networkInterfaces)) {
            if(macAddress) break;
            const netInterface = networkInterfaces[name];
            if (netInterface) {
            for (const iface of netInterface) {
            if(macAddress) break;
                if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
                macAddress = iface.mac
                }
            }
            }
        }  
        return macAddress;
    } catch (error) {
        return null;
    }
};

getUUID = async ()=>{
    try {
        const data = await si.uuid()
        return data.hardware
    } catch (error) {
        return null
    }
}

getIP = async ()=>{
    try {
        const networkInterfaces = os.networkInterfaces();
        let ip = null
        for (const iface of Object.values(networkInterfaces)) {
            for (const info of iface) {
              if (info.family === 'IPv4' && !info.internal) {
                ip = info.address
              }
            }
          }
        return ip;
    } catch (error) {
        return null
    }
}

module.exports = {
    getIP: getIP,
    getUUID: getUUID,
    InitProject: InitProject,
    getMacAddress: getMacAddress,
};