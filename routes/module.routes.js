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
router.post("/", auth, checkRole("trainer"), moduleController.createModule);
router.get("/:id/:content", auth, moduleController.getModule); // both accessible by trainer and trainee
router.get("/", auth, moduleController.getModules);             // both accessible by trainer and trainee
router.get("/history/:id", moduleController.getModuleHistory); // both accessible by trainer and trainee
router.patch("/", auth, checkRole("trainer"), moduleController.updateModule);
router.patch("/archive/:id", auth, checkRole("trainer"), moduleController.archiveModule);
router.patch("/restore/:id", auth, checkRole("trainer"), moduleController.restoreModule);
router.delete("/:id", auth, checkRole("trainer"), moduleController.deleteModule); // fixed `:id`


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
