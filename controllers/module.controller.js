const moduleService = require("../services/module.service");
const { logError, logSuccess, logInfo } = require("../utils/logs");
const {
  sendSuccess,
  sendError,
  getFriendlyErrorMessage,
} = require("../utils/util");

const moduleController = {
  /**
   * =======================
   * MODULE CRUD
   * =======================
   */
  getModules: async (req, res) => {
    try {
      const { includeFiles } = req.query; // ?includeFiles=true
      const result = await moduleService.getModules(includeFiles === "true");
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  getModule: async (req, res) => {
      logInfo('FETCHED MODULE')
    try {
      const { id } = req.params;
      const { includeFiles } = req.query;
      const result = await moduleService.getModule(id, includeFiles !== "false");
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  getAvailableModules: async (req, res) => {
    try {
      const result = await moduleService.getAvailableModules();
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  getModuleHistory: async (req, res) => {
    try {
      const { id } = req.params;
      console.log('MODULE HISTORY ID:', id);
      const result = await moduleService.getModuleHistory(id);
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  createModule: async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, category } = req.body;

      const result = await moduleService.createModule(title, category, userId);
      logSuccess(result.message);
      sendSuccess(res, 201, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  archiveModule: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await moduleService.archiveModule(id);
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  restoreModule: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await moduleService.restoreModule(id);
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  updateModule: async (req, res) => {
    try {
      const { id, title, category } = req.body;
      const result = await moduleService.updateModule(id, title, category);
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  deleteModule: async (req, res) => {
    
    try {
      const { id } = req.params;
      const result = await moduleService.deleteModule(id);
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

  /**
   * =======================
   * FILE CRUD
   * =======================
   */
  getFiles: async (req, res) => {
    try {
      const { moduleId } = req.params;
      const result = await moduleService.getFiles(moduleId);
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },

getFile: async (req, res) => {

logInfo('FETCHED FILE')
  try {
    const { id } = req.params;
    const result = await moduleService.getFile(id);

    if (!result.data) {
      return res.status(404).json({ message: "File not found" });
    }

    res.setHeader("Content-Type", result.data.file_type);
    res.setHeader("Content-Disposition", `inline; filename="${result.data.name}"`);
    return res.send(result.data.file); // send buffer
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

insertFile: async (req, res) => {
  try {
    const { moduleId } = req.params;

    if (!req.file) {
      throwError("No file uploaded", 400, true);
    }

    const { originalname, mimetype, size, buffer } = req.file;

    const result = await moduleService.insertFile(moduleId, {
      name: originalname,
      file: buffer,          // 👈 saved as Buffer
      file_type: mimetype,
      file_size: size,
    });

    logSuccess(result.message);
    sendSuccess(res, 201, result);
  } catch (error) {
    logError(error.message);
    const status = error.statusCode || 500;
    sendError(res, status, getFriendlyErrorMessage(error));
  }
},


  deleteFile: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await moduleService.deleteFile(id);
      logSuccess(result.message);
      sendSuccess(res, 200, result);
    } catch (error) {
      logError(error.message);
      const status = error.statusCode || 500;
      sendError(res, status, getFriendlyErrorMessage(error));
    }
  },
};

module.exports = moduleController;
