const express = require("express");
const auth = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");
const moduleController = require("../controllers/module.controller");
const upload = require("../middlewares/upload");


const router = express.Router();

/**
 * =======================
 * MODULES CRUD
 * =======================
 */
router.get("/available/modules", auth, moduleController.getAvailableModules); // trainee only - MUST come first
router.get("/:id/history", auth, moduleController.getModuleHistory); // more specific - comes before generic
router.get("/:id/:content", auth, moduleController.getModule); // generic - comes last
router.get("/", auth, moduleController.getModules);
router.post("/", auth, checkRole("trainer"), moduleController.createModule);
router.patch("/", auth, checkRole("trainer"), moduleController.updateModule);
router.patch("/archive/:id", auth, checkRole("trainer"), moduleController.archiveModule);
router.patch("/restore/:id", auth, checkRole("trainer"), moduleController.restoreModule);
router.delete("/:id", auth, checkRole("trainer"), moduleController.deleteModule);


/**
 * =======================
 * FILES CRUD
 * =======================
 */
router.get("/:moduleId/files", auth, moduleController.getFiles);           // list all files in a module
router.get("/files/single/:id", auth, moduleController.getFile);                    // get single file
router.post("/:moduleId/files", auth, checkRole("trainer"), upload.single("file"), moduleController.insertFile); // upload file to module
router.delete("/files/:id", auth, checkRole("trainer"), moduleController.deleteFile);     // delete file

module.exports = router;
