"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const http_config_1 = require("../../config/http.config");
const catch_errors_1 = require("../../common/utils/catch-errors");
const zod_1 = require("zod");
class SessionController {
    constructor(sessionService) {
        this.getAllSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            const sessionId = req.sessionId;
            const { sessions } = await this.sessionService.getAllSession(userId);
            const modifySessions = sessions.map((session) => ({
                ...session.toObject(),
                ...(session.id === sessionId && {
                    isCurrent: true,
                }),
            }));
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: "Retrieved all session successfully",
                sessions: modifySessions,
            });
        });
        this.getSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const sessionId = req?.sessionId;
            if (!sessionId) {
                throw new catch_errors_1.NotFoundException("Session ID not found. Please log in.");
            }
            const { user } = await this.sessionService.getSessionById(sessionId);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: "Session retrieved successfully",
                user,
            });
        });
        this.deleteSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const sessionId = zod_1.z.string().parse(req.params.id);
            const userId = req.user?.id;
            await this.sessionService.deleteSession(sessionId, userId);
            return res.status(http_config_1.HTTPSTATUS.OK).json({
                message: "Session remove successfully",
            });
        });
        this.sessionService = sessionService;
    }
}
exports.SessionController = SessionController;
