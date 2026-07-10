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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
let VersionsController = class VersionsController {
    getLatest() {
        return {
            latestVersionCode: Number(process.env.LATEST_VERSION_CODE) || 1,
            latestVersion: process.env.LATEST_VERSION_NAME || '1.0.0',
            apkUrl: process.env.APK_URL || '',
            forceUpdate: process.env.FORCE_UPDATE === 'true',
            updateMessage: process.env.UPDATE_MESSAGE || '',
        };
    }
};
exports.VersionsController = VersionsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VersionsController.prototype, "getLatest", null);
exports.VersionsController = VersionsController = __decorate([
    (0, common_1.Controller)('versions')
], VersionsController);
//# sourceMappingURL=versions.controller.js.map