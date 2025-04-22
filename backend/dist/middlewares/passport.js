"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const jwt_strategy_1 = require("../common/strategies/jwt.strategy");
const intializePassport = () => {
    (0, jwt_strategy_1.setupJwtStrategy)(passport_1.default);
};
intializePassport();
exports.default = passport_1.default;
