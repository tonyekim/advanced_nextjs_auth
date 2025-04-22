"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const app_config_1 = require("./config/app.config");
const database_1 = __importDefault(require("./database/database"));
const errorHandler_1 = require("./middlewares/errorHandler");
const http_config_1 = require("./config/http.config");
const asyncHandler_1 = require("./middlewares/asyncHandler");
const catch_errors_1 = require("./common/utils/catch-errors");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const passport_1 = __importDefault(require("./middlewares/passport"));
const jwt_strategy_1 = require("./common/strategies/jwt.strategy");
const session_routes_1 = __importDefault(require("./modules/session/session.routes"));
const mfa_routes_1 = __importDefault(require("./modules/mfa/mfa.routes"));
const app = (0, express_1.default)();
const BASE_PATH = app_config_1.config.BASE_PATH;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: app_config_1.config.APP_ORIGIN,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.get("/", (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    // throw new Error("Error occured while");
    throw new catch_errors_1.BadRequestException("Bad request", "AUTH_EMAIL_ALREADY_EXISTS" /* ErrorCode.AUTH_EMAIL_ALREADY_EXISTS */);
    res.status(http_config_1.HTTPSTATUS.OK).json({
        message: "Hello Subscribers!!!",
    });
}));
app.use(`${BASE_PATH}/auth`, auth_routes_1.default);
app.use(`${BASE_PATH}/mfa`, mfa_routes_1.default);
app.use(`${BASE_PATH}/session`, jwt_strategy_1.authenticateJWT, session_routes_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(app_config_1.config.PORT, async () => {
    console.log(`Server listening on port ${app_config_1.config.PORT} in ${app_config_1.config.NODE_ENV}`);
    await (0, database_1.default)();
});
