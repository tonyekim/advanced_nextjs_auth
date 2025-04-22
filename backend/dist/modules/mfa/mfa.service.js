"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaService = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const catch_errors_1 = require("../../common/utils/catch-errors");
const session_model_1 = __importDefault(require("../../database/models/session.model"));
const jwt_1 = require("../../common/utils/jwt");
class MfaService {
    async generateMFASetup(req) {
        const user = req.user;
        if (!user) {
            throw new catch_errors_1.UnauthorizedException("User not authorized");
        }
        if (user.userPreferences.enable2FA) {
            return {
                message: "MFA already enabled",
            };
        }
        let secretKey = user.userPreferences.twoFactorSecret;
        if (!secretKey) {
            const secret = speakeasy_1.default.generateSecret({ name: "Squeezy" });
            secretKey = secret.base32;
            user.userPreferences.twoFactorSecret = secretKey;
            await user.save();
        }
        const url = speakeasy_1.default.otpauthURL({
            secret: secretKey,
            label: `${user.name}`,
            issuer: "squeezy.com",
            encoding: "base32",
        });
        const qrImageUrl = await qrcode_1.default.toDataURL(url);
        return {
            message: "Scan the QR code or use the setup key.",
            secret: secretKey,
            qrImageUrl,
        };
    }
    async verifyMFASetup(req, code, secretKey) {
        const user = req.user;
        if (!user) {
            throw new catch_errors_1.UnauthorizedException("User not authorized");
        }
        if (user.userPreferences.enable2FA) {
            return {
                message: "MFA is already enabled",
                userPreferences: {
                    enable2FA: user.userPreferences.enable2FA,
                },
            };
        }
        const isValid = speakeasy_1.default.totp.verify({
            secret: secretKey,
            encoding: "base32",
            token: code,
        });
        if (!isValid) {
            throw new catch_errors_1.BadRequestException("Invalid MFA code. Please try again.");
        }
        user.userPreferences.enable2FA = true;
        await user.save();
        return {
            message: "MFA setup completed successfully",
            userPreferences: {
                enable2FA: user.userPreferences.enable2FA,
            },
        };
    }
    async revokeMFA(req) {
        const user = req.user;
        if (!user) {
            throw new catch_errors_1.UnauthorizedException("User not authorized");
        }
        if (!user.userPreferences.enable2FA) {
            return {
                message: "MFA is not enabled",
                userPreferences: {
                    enable2FA: user.userPreferences.enable2FA,
                },
            };
        }
        user.userPreferences.twoFactorSecret = undefined;
        user.userPreferences.enable2FA = false;
        await user.save();
        return {
            message: "MFA revoke successfully",
            userPreferences: {
                enable2FA: user.userPreferences.enable2FA,
            },
        };
    }
    async verifyMFAForLogin(code, email, userAgent) {
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new catch_errors_1.NotFoundException("User not found");
        }
        if (!user.userPreferences.enable2FA &&
            !user.userPreferences.twoFactorSecret) {
            throw new catch_errors_1.UnauthorizedException("MFA not enabled for this user");
        }
        const isValid = speakeasy_1.default.totp.verify({
            secret: user.userPreferences.twoFactorSecret,
            encoding: "base32",
            token: code,
        });
        if (!isValid) {
            throw new catch_errors_1.BadRequestException("Invalid MFA code. Please try again.");
        }
        //sign access token & refresh token
        const session = await session_model_1.default.create({
            userId: user._id,
            userAgent,
        });
        const accessToken = (0, jwt_1.signJwtToken)({
            userId: user._id,
            sessionId: session._id,
        });
        const refreshToken = (0, jwt_1.signJwtToken)({
            sessionId: session._id,
        }, jwt_1.refreshTokenSignOptions);
        return {
            user,
            accessToken,
            refreshToken,
        };
    }
}
exports.MfaService = MfaService;
