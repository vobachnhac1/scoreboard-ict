const crypto = require('crypto');
const { API_ENCRYPTION_KEY } = require('./config');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(API_ENCRYPTION_KEY.substring(0, 32));

class Encryption {
    /**
     * Encrypt data for API request
     * @param {any} data - Object or string to encrypt
     * @returns {Object} { iv, data, algo }
     */
    encryptPayload(data) {
        try {
            const text = JSON.stringify(data);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm, key, iv);

            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            return {
                iv: iv.toString('hex'),
                data: encrypted,
                algo: algorithm
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            return data;
        }
    }

    /**
     * Decrypt data from API response
     * @param {Object} payload { iv, data, algo, tag }
     * @returns {any} Decrypted object
     */
    decryptPayload(payload) {
        if (!payload || !payload.iv || !payload.data) {
            return payload;
        }

        try {
            const { iv, data, tag, algo } = payload;
            const currentAlgo = algo || (tag ? 'aes-256-gcm' : 'aes-256-cbc');

            if (currentAlgo === 'aes-256-gcm') {
                const decipher = crypto.createDecipheriv(
                    'aes-256-gcm',
                    key,
                    Buffer.from(iv, 'hex')
                );
                if (tag) {
                    decipher.setAuthTag(Buffer.from(tag, 'hex'));
                }
                let decrypted = decipher.update(data, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return JSON.parse(decrypted);
            } else {
                const decipher = crypto.createDecipheriv(
                    'aes-256-cbc',
                    key,
                    Buffer.from(iv, 'hex')
                );
                let decrypted = decipher.update(data, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return JSON.parse(decrypted);
            }
        } catch (error) {
            console.error('Decryption failed:', error);
            return payload;
        }
    }

    // Keep old methods for compatibility if needed, but update them to use config key
    encode = (input) => {
        const obj = input ?? { secret: 'vobachnhac' };
        // This old method used a fixed IV which is not recommended, 
        // but we'll keep it (updated with config key) for other parts of the app if any.
        const fixedIv = Buffer.from('abcdef9876543210');
        const cipher = crypto.createCipheriv(algorithm, key, fixedIv);
        let encrypted = cipher.update(JSON.stringify(obj), 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }

    decode = (encrypted) => {
        const fixedIv = Buffer.from('abcdef9876543210');
        const decipher = crypto.createDecipheriv(algorithm, key, fixedIv);
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        try {
            return JSON.parse(decrypted);
        } catch (e) {
            return decrypted;
        }
    }
}

const instance = new Encryption();
module.exports = instance;