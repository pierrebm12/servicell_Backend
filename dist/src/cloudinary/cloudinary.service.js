"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    constructor() {
        this.logger = new common_1.Logger(CloudinaryService_1.name);
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    async uploadFile(buffer, folder, publicId) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: `servicell/${folder}`,
                public_id: publicId,
                resource_type: 'auto',
            }, (error, result) => {
                if (error) {
                    this.logger.error(`Cloudinary upload error: ${error.message}`);
                    reject(new common_1.BadRequestException('File upload failed'));
                }
                else {
                    resolve(result);
                }
            });
            const stream = stream_1.Readable.from(buffer);
            stream.pipe(uploadStream);
        });
    }
    async uploadImage(buffer, folder, publicId) {
        return this.uploadFile(buffer, folder, publicId);
    }
    async uploadPdf(buffer, folder, publicId) {
        return this.uploadFile(buffer, folder, publicId);
    }
    async deleteFile(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
        }
        catch (error) {
            this.logger.error(`Cloudinary delete error: ${error.message}`);
            throw new common_1.BadRequestException('File delete failed');
        }
    }
    getUrl(publicId, options) {
        return cloudinary_1.v2.url(publicId, {
            secure: true,
            width: options?.width,
            height: options?.height,
            crop: 'fill',
        });
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map