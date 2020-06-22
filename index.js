"use strict";
/*

    ===== Info about this file =====

    " This is the main typescript file for Queued Copy Dir.

    - Package name: queued-copy-dir
    - Author: Iannis de Zwart (https://github.com/iannisdezwart)



    ===== Table of contents =====

    1. (private function) Add Dir to Queue

    2. (exported function) qcd.sync

    3. (exported function) qcd.async

*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var path_1 = require("path");
var fs = require("fs");
var util_1 = require("util");
var fsExists = util_1.promisify(fs.exists);
var fsMkdir = util_1.promisify(fs.mkdir);
var fsCopyFile = util_1.promisify(fs.copyFile);
/* ===================
    1. (private function) Add Dir to Queue
=================== */
var addDirToQueue = function (dirPath, root, queue) {
    var files = fs.readdirSync(dirPath + '/' + root);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        // Parse paths
        var relativeFilePath = root + file + '/';
        var absoluteFilePath = path_1.resolve(dirPath + '/' + relativeFilePath);
        var stats = fs.statSync(absoluteFilePath);
        if (stats.isDirectory()) {
            // Add dir to queue
            queue.push({
                relativeFilePath: relativeFilePath,
                type: 'dir'
            });
            // Add children of dir to queue
            addDirToQueue(dirPath, relativeFilePath, queue);
        }
        else {
            // Add file to queue
            queue.push({
                relativeFilePath: relativeFilePath,
                type: 'file'
            });
        }
    }
};
/* ===================
    2. (exported function) qcd.sync
=================== */
exports.sync = function (sourceDirPath, destinationDirPath) {
    if (!fs.existsSync(sourceDirPath)) {
        throw new Error("QueuedCopyDir failed because source directory (" + sourceDirPath + ") does not exist.");
    }
    var queue = [];
    // Fill the queue
    addDirToQueue(sourceDirPath, '', queue);
    // Create the destination dir if necessary
    if (!fs.existsSync(destinationDirPath)) {
        fs.mkdirSync(destinationDirPath);
    }
    // Traverse queue
    while (queue.length > 0) {
        // Shift queue
        var item = queue.shift();
        var destinationPath = path_1.resolve(destinationDirPath + '/' + item.relativeFilePath);
        if (item.type == 'dir') {
            // Create dir
            fs.mkdirSync(destinationPath);
        }
        else {
            // Copy file
            var sourcePath = path_1.resolve(sourceDirPath + '/' + item.relativeFilePath);
            fs.copyFileSync(sourcePath, destinationPath);
        }
    }
};
/* ===================
    3. (exported function) qcd.async
=================== */
exports.async = function (sourceDirPath, destinationDirPath) { return __awaiter(void 0, void 0, void 0, function () {
    var queue, exists, item, destinationPath, sourcePath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!fs.existsSync(sourceDirPath)) {
                    throw new Error("QueuedCopyDir failed because source directory (" + sourceDirPath + ") does not exist.");
                }
                queue = [];
                // Fill the queue
                addDirToQueue(sourceDirPath, '', queue);
                return [4 /*yield*/, fsExists(destinationDirPath)];
            case 1:
                exists = _a.sent();
                if (!!exists) return [3 /*break*/, 3];
                return [4 /*yield*/, fsMkdir(destinationDirPath)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                if (!(queue.length > 0)) return [3 /*break*/, 8];
                item = queue.shift();
                destinationPath = path_1.resolve(destinationDirPath + '/' + item.relativeFilePath);
                if (!(item.type == 'dir')) return [3 /*break*/, 5];
                // Create dir
                return [4 /*yield*/, fsMkdir(destinationPath)];
            case 4:
                // Create dir
                _a.sent();
                return [3 /*break*/, 7];
            case 5:
                sourcePath = path_1.resolve(sourceDirPath + '/' + item.relativeFilePath);
                return [4 /*yield*/, fsCopyFile(sourcePath, destinationPath)];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [3 /*break*/, 3];
            case 8: return [2 /*return*/];
        }
    });
}); };
