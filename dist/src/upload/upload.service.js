"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
let UploadService = UploadService_1 = class UploadService {
    constructor(cloudinary) {
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(UploadService_1.name);
        this.uploadDir = path.resolve(process.cwd(), 'uploads');
        const distDir = path.resolve(process.cwd(), 'dist/uploads');
        for (const dir of [this.uploadDir, distDir]) {
            if (!fs.existsSync(dir))
                fs.mkdirSync(dir, { recursive: true });
        }
    }
    async saveBase64(base64, prefix = 'photo') {
        const matches = base64.match(/^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,(.+)$/);
        let ext = 'png';
        let data;
        if (matches) {
            ext = matches[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
            data = matches[2];
        }
        else {
            data = base64;
        }
        const buffer = Buffer.from(data, 'base64');
        const filename = `${prefix}_${(0, uuid_1.v4)()}.${ext}`;
        fs.writeFileSync(path.join(this.uploadDir, filename), buffer);
        try {
            const result = await this.cloudinary.uploadFile(buffer, prefix, filename.replace(`.${ext}`, ''));
            this.logger.log(`Uploaded to Cloudinary: ${result.secure_url}`);
            return result.secure_url;
        }
        catch (err) {
            this.logger.warn(`Cloudinary upload failed, using local: ${err.message}`);
            return `/uploads/${filename}`;
        }
    }
    async saveFile(buffer, originalName) {
        const ext = path.extname(originalName) || '.png';
        const filename = `photo_${(0, uuid_1.v4)()}${ext}`;
        fs.writeFileSync(path.join(this.uploadDir, filename), buffer);
        try {
            const result = await this.cloudinary.uploadFile(buffer, 'photos', filename.replace(ext, ''));
            this.logger.log(`Uploaded to Cloudinary: ${result.secure_url}`);
            return result.secure_url;
        }
        catch (err) {
            this.logger.warn(`Cloudinary upload failed, using local: ${err.message}`);
            return `/uploads/${filename}`;
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], UploadService);
//# sourceMappingURL=upload.service.js.map