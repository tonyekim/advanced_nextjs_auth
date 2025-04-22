"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaController = void 0;
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const http_config_1 = require("../../config/http.config");
const mfa_validator_1 = require("../../common/validators/mfa.validator");
const cookie_1 = require("../../common/utils/cookie");
class MfaController {
    constructor(mfaService) {
        this.generateMFASetup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { secret, qrImageUrl, message } = await this.mfaService.generateMFASetup(req);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message,
                secret,
                qrImageUrl,
            });
        });
        this.verifyMFASetup = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { code, secretKey } = mfa_validator_1.verifyMfaSchema.parse({
                ...req.body,
            });
            const { userPreferences, message } = await this.mfaService.verifyMFASetup(req, code, secretKey);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: message,
                userPreferences: userPreferences,
            });
        });
        this.revokeMFA = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { message, userPreferences } = await this.mfaService.revokeMFA(req);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message,
                userPreferences,
            });
        });
        this.verifyMFAForLogin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { code, email, userAgent } = mfa_validator_1.verifyMfaForLoginSchema.parse({
                ...req.body,
                userAgent: req.headers["user-agent"],
            });
            const { accessToken, refreshToken, user } = await this.mfaService.verifyMFAForLogin(code, email, userAgent);
            return (0, cookie_1.setAuthenticationCookies)({
                res,
                accessToken,
                refreshToken,
            })
                .status(http_config_1.HTTPSTATUS.OK)
                .json({
                message: "Verified & login successfully",
                user,
            });
        });
        this.mfaService = mfaService;
    }
}
exports.MfaController = MfaController;
