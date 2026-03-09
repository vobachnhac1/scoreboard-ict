const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_FILE = path.join(__dirname, '../../google-api/digisports-489607-22b76d2b32b0.json');
const OAUTH_CONFIG_FILE = path.join(__dirname, '../../google-api/google_oauth_credentials.json');
const TOKENS_FILE = path.join(__dirname, '../../google-api/google_drive_tokens.json');
const DRIVE_CONFIG_FILE = path.join(__dirname, '../../google-api/google_drive_config.json');

class GoogleDriveService {
    constructor() {
        this.scopes = ['https://www.googleapis.com/auth/drive'];
        this.authMode = 'service_account'; // 'service_account' or 'oauth2'
        this.rootFolderId = "DIGISPORTS_BACKUP";
        
        this.saClient = null;
        this.oauth2Client = null;
        this.drive = null;

        this.init();
    }

    init() {
        console.log('[GoogleDriveService] Initializing service...');
        // Load Config
        try {
            if (fs.existsSync(DRIVE_CONFIG_FILE)) {
                const config = JSON.parse(fs.readFileSync(DRIVE_CONFIG_FILE, 'utf8'));
                this.authMode = config.AUTH_MODE || 'service_account';
                this.rootFolderId = config.ROOT_FOLDER_ID || "DIGISPORTS_BACKUP";
                console.log(`[GoogleDriveService] Config loaded. Mode: ${this.authMode}, Root: ${this.rootFolderId}`);
            }
        } catch (e) {
            console.error('[GoogleDriveService] Error loading drive config:', e);
        }

        // Init Service Account
        try {
            if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
                const saAuth = new google.auth.GoogleAuth({
                    keyFile: SERVICE_ACCOUNT_FILE,
                    scopes: this.scopes,
                });
                this.saClient = saAuth;
                console.log('[GoogleDriveService] Service Account client initialized.');
            }
        } catch (e) {
            console.error('[GoogleDriveService] Error init SA:', e);
        }

        // Init OAuth2
        try {
            if (fs.existsSync(OAUTH_CONFIG_FILE)) {
                const config = JSON.parse(fs.readFileSync(OAUTH_CONFIG_FILE, 'utf8'));
                if (config.client_id && config.client_secret) {
                    this.oauth2Client = new google.auth.OAuth2(
                        config.client_id,
                        config.client_secret,
                        config.redirect_uri || 'http://localhost:6789/api/sync/cloud/callback'
                    );

                    if (fs.existsSync(TOKENS_FILE)) {
                        const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
                        this.oauth2Client.setCredentials(tokens);
                        console.log('[GoogleDriveService] OAuth2 tokens loaded from file.');
                        
                        this.oauth2Client.on('tokens', (newTokens) => {
                            console.log('[GoogleDriveService] OAuth2 tokens refreshed.');
                            const currentTokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
                            fs.writeFileSync(TOKENS_FILE, JSON.stringify({ ...currentTokens, ...newTokens }));
                        });
                    }
                }
            }
        } catch (e) {
            console.error('[GoogleDriveService] Error init OAuth2:', e);
        }

        this.updateDriveClient();
    }

    updateDriveClient() {
        if (this.authMode === 'oauth2' && this.oauth2Client && this.oauth2Client.credentials.access_token) {
            this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
            console.log('[GoogleDriveService] Switched to OAuth2 Drive client.');
        } else if (this.saClient) {
            this.drive = google.drive({ version: 'v3', auth: this.saClient });
            console.log('[GoogleDriveService] Switched to Service Account Drive client.');
        } else {
            console.warn('[GoogleDriveService] No valid authentication found. Drive client is NULL.');
            this.drive = null;
        }
    }

    isAuthenticated() {
        const authed = this.authMode === 'oauth2' 
            ? (this.oauth2Client && this.oauth2Client.credentials && !!this.oauth2Client.credentials.access_token)
            : !!this.drive;
        console.log(`[GoogleDriveService] Check Auth Status: ${authed} (Mode: ${this.authMode})`);
        return authed;
    }

    getAuthUrl() {
        console.log('[GoogleDriveService] Generating OAuth2 Auth URL...');
        if (!this.oauth2Client) throw new Error('OAuth2 config missing');
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.scopes,
            prompt: 'consent'
        });
    }

    async authorize(code) {
        console.log('[GoogleDriveService] Exchanging code for tokens...');
        if (!this.oauth2Client) throw new Error('OAuth2 config missing');
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens));
        console.log('[GoogleDriveService] Tokens saved successfully.');
        this.updateDriveClient();
        return tokens;
    }

    async getRootFolderId() {
        console.log(`[GoogleDriveService] Resolving Root Folder: ${this.rootFolderId}...`);
        if (!this.drive) throw new Error('Google Drive client not initialized');

        const isLikelyId = /^[a-zA-Z0-9_-]{10,}$/.test(this.rootFolderId);
        if (isLikelyId) {
            try {
                const res = await this.drive.files.get({ 
                    fileId: this.rootFolderId, 
                    fields: 'id, trashed',
                    supportsAllDrives: true 
                });
                if (res.data && !res.data.trashed) {
                    console.log(`[GoogleDriveService] Root Folder (ID mode) found: ${res.data.id}`);
                    return res.data.id;
                }
            } catch (e) {
                console.log(`[GoogleDriveService] Root Folder ID ${this.rootFolderId} not reachable, trying as Name...`);
            }
        }

        // Tìm theo tên
        const query = `name = '${this.rootFolderId}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const response = await this.drive.files.list({ 
            q: query, 
            fields: 'files(id, name)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        if (response.data.files.length > 0) {
            console.log(`[GoogleDriveService] Root Folder (Name mode) found: ${response.data.files[0].id}`);
            return response.data.files[0].id;
        }

        if (this.authMode === 'service_account') {
            console.error(`[GoogleDriveService] Root Folder NOT FOUND for SA: ${this.rootFolderId}`);
            throw new Error(`Service Account không tìm thấy thư mục "${this.rootFolderId}". Hãy đảm bảo đã Share quyền Editor cho nó.`);
        }

        console.log(`[GoogleDriveService] Creating new Root Folder: ${this.rootFolderId}...`);
        const folder = await this.drive.files.create({
            resource: { name: this.rootFolderId, mimeType: 'application/vnd.google-apps.folder' },
            fields: 'id',
        });
        return folder.data.id;
    }

    async findOrCreateFolder(folderName, parentId = null) {
        console.log(`[GoogleDriveService] Locating folder "${folderName}" in parent ${parentId || 'Root'}...`);
        const effectiveParentId = parentId || await this.getRootFolderId();
        const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false and '${effectiveParentId}' in parents`;

        const response = await this.drive.files.list({ 
            q: query, 
            fields: 'files(id, name)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        if (response.data.files.length > 0) {
            console.log(`[GoogleDriveService] Folder "${folderName}" already exists: ${response.data.files[0].id}`);
            return response.data.files[0].id;
        }

        console.log(`[GoogleDriveService] Creating folder "${folderName}"...`);
        const folder = await this.drive.files.create({
            resource: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [effectiveParentId],
            },
            fields: 'id',
            supportsAllDrives: true
        });
        console.log(`[GoogleDriveService] Folder "${folderName}" created with ID: ${folder.data.id}`);
        return folder.data.id;
    }

    async uploadFile(filePath, fileName, parentId) {
        console.log(`[GoogleDriveService] Starting upload: ${fileName} to parent ${parentId}...`);
        const fileMetadata = { name: fileName, parents: [parentId] };
        const media = { mimeType: 'application/x-sqlite3', body: fs.createReadStream(filePath) };
        const response = await this.drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
            supportsAllDrives: true
        });
        console.log(`[GoogleDriveService] Upload complete! File ID: ${response.data.id}`);
        return response.data;
    }

    async listBackups(deviceUUID) {
        try {
            const deviceFolderId = await this.findOrCreateFolder(deviceUUID);
            const response = await this.drive.files.list({
                q: `'${deviceFolderId}' in parents and trashed = false`,
                fields: 'files(id, name, createdTime, size)',
                orderBy: 'createdTime desc',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            });
            return response.data.files;
        } catch (error) {
            console.error('Error listing backups:', error);
            throw error;
        }
    }

    async downloadFile(fileId, destPath) {
        const dest = fs.createWriteStream(destPath);
        const response = await this.drive.files.get(
            { fileId: fileId, alt: 'media', supportsAllDrives: true },
            { responseType: 'stream' }
        );
        return new Promise((resolve, reject) => {
            response.data
                .on('end', () => resolve(destPath))
                .on('error', (err) => reject(err))
                .pipe(dest);
        });
    }
}

module.exports = new GoogleDriveService();
