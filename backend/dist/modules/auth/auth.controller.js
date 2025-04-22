"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const catch_errors_1 = require("../../common/utils/catch-errors");
const cookie_1 = require("../../common/utils/cookie");
const auth_validator_1 = require("../../common/validators/auth.validator");
const http_config_1 = require("../../config/http.config");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
class AuthController {
    constructor(authService) {
        this.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const body = auth_validator_1.registerSchema.parse({
                ...req.body,
            });
            const { user } = await this.authService.register(body);
            return res.status(http_config_1.HTTPSTATUS.CREATED).json({
                message: "User registered successfully",
                data: user,
            });
        });
        this.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userAgent = req.headers["user-agent"];
            const body = auth_validator_1.loginSchema.parse({
                ...req.body,
                userAgent,
            });
            const { user, accessToken, refreshToken, mfaRequired } = await this.authService.login(body);
            if (mfaRequired) {
                return res.status(http_config_1.HTTPSTATUS.OK).json({
                    message: "Verify MFA authentication",
                    mfaRequired,
                    user,
                });
            }
            return (0, cookie_1.setAuthenticationCookies)({
                res,
                accessToken,
                refreshToken,
            })
                .status(http_config_1.HTTPSTATUS.OK)
                .json({
                message: "User login successfully",
                mfaRequired,
                user,
            });
        });
        this.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                throw new catch_errors_1.UnauthorizedException("Missing refresh token");
            }
            const { accessToken, newRefreshToken } = await this.authService.refreshToken(refreshToken);
            if (newRefreshToken) {
                res.cookie("refreshToken", newRefreshToken, (0, cookie_1.getRefreshTokenCookieOptions)());
            }
            return res
                .status(http_config_1.HTTPSTATUS.OK)
                .cookie("accessToken", accessToken, (0, cookie_1.getAccessTokenCookieOptions)())
                .json({
                message: "Refresh access token successfully",
            });
        });
        this.verifyEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { code } = auth_validator_1.verificationEmailSchema.parse(req.body);
            await this.authService.verifyEmail(code);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: "Email verified successfully",
            });
        });
        this.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const email = auth_validator_1.emailSchema.parse(req.body.email);
            await this.authService.forgotPassword(email);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: "Password reset email sent",
            });
        });
        this.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const body = auth_validator_1.resetPasswordSchema.parse(req.body);
            await this.authService.resePassword(body);
            return (0, cookie_1.clearAuthenticationCookies)(res).status(http_config_1.HTTPSTATUS.OK).json({
                message: "Reset Password successfully",
            });
        });
        this.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const sessionId = req.sessionId;
            if (!sessionId) {
                throw new catch_errors_1.NotFoundException("Session is invalid.");
            }
            await this.authService.logout(sessionId);
            return (0, cookie_1.clearAuthenticationCookies)(res).status(http_config_1.HTTPSTATUS.OK).json({
                message: "User logout successfully",
            });
        });
        this.authService = authService;
    }
}
exports.AuthController = AuthController;
