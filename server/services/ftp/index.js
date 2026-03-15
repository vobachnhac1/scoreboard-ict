const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const FTP_CREDENTIALS_FILE = path.join(__dirname, '../../google-api/ftp_credentials.json');
const FTP_CONFIG_FILE = path.join(__dirname, '../../google-api/ftp_config.json');

class FtpService {
    constructor() {
        this.credentials = null;
        this.config = null;
        this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(FTP_CREDENTIALS_FILE)) {
                this.credentials = JSON.parse(fs.readFileSync(FTP_CREDENTIALS_FILE, 'utf8'));
            }
            if (fs.existsSync(FTP_CONFIG_FILE)) {
                this.config = JSON.parse(fs.readFileSync(FTP_CONFIG_FILE, 'utf8'));
            }
        } catch (e) {
            console.error('[FtpService] Error loading config:', e);
        }
    }

    async getClient() {
        this.loadConfig();
        if (!this.credentials) throw new Error('SFTP credentials missing');
        const sftp = new SftpClient();
        try {
            await sftp.connect({
                host: this.credentials.host,
                port: this.credentials.port || 22,
                username: this.credentials.user,
                password: this.credentials.password,
                // debug: (msg) => console.log('SFTP DEBUG:', msg)
            });
            return sftp;
        } catch (e) {
            await sftp.end();
            throw e;
        }
    }

    async testConnection() {
        console.log('[FtpService] Testing connection...');
        let sftp;
        try {
            sftp = await this.getClient();
            console.log('[FtpService] Connection test successful.');
            return true;
        } finally {
            if (sftp) await sftp.end();
        }
    }

    async uploadFile(localPath, remoteFileName, deviceUUID) {
        let sftp;
        try {
            sftp = await this.getClient();
            const remoteRoot = this.config?.ROOT_REMOTE_DIR || '/digisports_backup';
            const devicePath = path.posix.join(remoteRoot, deviceUUID);
            
            console.log(`[FtpService] Ensuring remote dir: ${devicePath}`);
            // makeDir creates directories recursively
            await sftp.mkdir(devicePath, true);
            
            const remoteFilePath = path.posix.join(devicePath, remoteFileName);
            console.log(`[FtpService] Uploading file to ${remoteFilePath}`);
            
            await sftp.put(localPath, remoteFilePath);
            
            return { success: true, path: remoteFilePath };
        } finally {
            if (sftp) await sftp.end();
        }
    }

    async listBackups(deviceUUID) {
        let sftp;
        try {
            sftp = await this.getClient();
            const remoteRoot = this.config?.ROOT_REMOTE_DIR || '/digisports_backup';
            const devicePath = path.posix.join(remoteRoot, deviceUUID);
            
            try {
                const list = await sftp.list(devicePath);
                // Filter and sort
                return list
                    .filter(f => f.type === '-' && f.name.endsWith('.sqlite'))
                    .map(f => ({
                        id: path.posix.join(devicePath, f.name),
                        name: f.name,
                        createdTime: new Date(f.modifyTime),
                        size: f.size
                    }))
                    .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
            } catch (e) {
                // Folder might not exist yet if no backups were done
                console.log(`[FtpService] No backups found in ${devicePath}`);
                return [];
            }
        } finally {
            if (sftp) await sftp.end();
        }
    }

    async downloadFile(remoteFilePath, localDestPath) {
        let sftp;
        try {
            sftp = await this.getClient();
            console.log(`[FtpService] Downloading ${remoteFilePath} to ${localDestPath}`);
            await sftp.get(remoteFilePath, localDestPath);
            return localDestPath;
        } finally {
            if (sftp) await sftp.end();
        }
    }
}

module.exports = new FtpService();
