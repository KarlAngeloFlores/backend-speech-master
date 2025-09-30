const { Module, ModuleContent } = require("../models/associations");
const sequelize = require("../config/db");
const { throwError } = require("../utils/util"); // adjust path
const { logInfo } = require("../utils/logs");

const moduleService = {
  /**
   * =======================
   * MODULE CRUD
   * =======================
   */
  getModules: async (includeFiles = false) => {
    try {
      const modules = await Module.findAll({
        include: includeFiles ? [{ model: ModuleContent }] : [],
        order: [["created_at", "DESC"]],
      });

      return {
        message: "Modules fetched successfully",
        data: modules,
      };
    } catch (error) {
      throw error;
    }
  },

  getModule: async (id, includeFiles = true) => {
    try {
      const module = await Module.findByPk(id, {
        include: includeFiles ? [{ model: ModuleContent }] : [],
      });

      if (!module) {
        throwError("Module not found", 404, true);
      }

      return {
        message: "Module fetched successfully",
        data: module,
      };
    } catch (error) {
      throw error;
    }
  },

  createModule: async (title, created_by) => {
    try {
      const module = await Module.create({ title, created_by });
      return {
        message: "Module created successfully",
        data: module,
      };
    } catch (error) {
      throw error;
    }
  },

  updateModule: async (id, title) => {
    const transaction = await sequelize.transaction();
    try {
      const module = await Module.findOne({ where: { id }, transaction });
      // logInfo(module);
      if (!module) {
        throwError("Module not found", 404, true);
      }

      await module.update({ title }, { transaction });
      await transaction.commit();

      return {
        message: "Module updated successfully",
        data: module,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  deleteModule: async (id) => {
    try {
      const module = await Module.findOne({ where: { id } });
      if (!module) {
        throwError("Module not found", 404, true);
      }

      await module.destroy();
      return {
        message: "Module deleted successfully",
        id,
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * =======================
   * FILE CRUD
   * =======================
   */
  getFiles: async (moduleId) => {
    try {
      const files = await ModuleContent.findAll({
        where: { module_id: moduleId },
        order: [["created_at", "DESC"]],
      });

      return {
        message: "Files fetched successfully",
        data: files,
      };
    } catch (error) {
      throw error;
    }
  },

  getFile: async (id) => {
    logInfo('ID:', id);
    try {
      const file = await ModuleContent.findOne({ where: { id } });

      if (!file) {
        throwError("File not found", 404, true);
      }

      return {
        message: "File fetched successfully",
        data: file,
      };
    } catch (error) {
      throw error;
    }
  },

  insertFile: async (moduleId, { name, file, file_type, file_size }) => {
    try {
      // Ensure the parent module exists
      const module = await Module.findByPk(moduleId);
      if (!module) {
        throwError("Module not found", 404, true);
      }

      const newFile = await ModuleContent.create({
        module_id: moduleId,
        name,
        file,
        file_type,
        file_size,
      });

      return {
        message: "File uploaded successfully",
        data: newFile,
      };
    } catch (error) {
      throw error;
    }
  },

  deleteFile: async (id) => {
    try {
      const file = await ModuleContent.findByPk(id);

      if (!file) {
        throwError("File not found", 404, true);
      }

      await file.destroy();

      return {
        message: "File deleted successfully",
        id,
      };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = moduleService;
