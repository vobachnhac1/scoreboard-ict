const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const AES_KEY='0123456789abcdef0123456789abcdef';//      # 32 ký tự hex (256 bit)
const AES_IV='abcdef9876543210';//    # 16 ký tự hex (128 bit)
const key = AES_KEY; 
const iv  = AES_IV; 

const QRCode = require('qrcode');


class Encryption {
    encode = (input) =>{
        // Encode
        const obj = input ?? { secret: 'vobachnhac' };
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(JSON.stringify(obj), 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }
    decode = (encrypted ) =>{
        // Decode
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        console.log(JSON.parse(decrypted));
        return decrypted;
    }

    generateQR = async (data) =>{
        const encrypted = this.encode(data);
        const qrBase64 = await QRCode.toDataURL(encrypted);
        return qrBase64
    }
}
const intance = new Encryption()
module.exports = intance