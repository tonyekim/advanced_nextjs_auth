"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_module_1 = require("./session.module");
const sessionRoutes = (0, express_1.Router)();
sessionRoutes.get("/all", session_module_1.sessionController.getAllSession);
sessionRoutes.get("/", session_module_1.sessionController.getSession);
sessionRoutes.delete("/:id", session_module_1.sessionController.deleteSession);
exports.default = sessionRoutes;
