const { Module, ModuleContent, User } = require("../models/associations");
const sequelize = require("../config/db");
const { throwError } = require("../utils/util"); // adjust path
const { logInfo } = require("../utils/logs");
const emailService = require("./email.service");
const sgMail = require("@sendgrid/mail");

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

createModule: async (title, description, created_by) => {
  try {
    // 1. Create module
    const module = await Module.create({ title, description, created_by });

    // 2. Get all verified trainees
    const users = await User.findAll({
      where: { status: "verified", role: "trainee" },
      attributes: ["email"],
    });

    if (users && users.length > 0) {
      const emails = users.map((u) => ({ email: u.email })); //fix

      const subject = "📘 New Training Module Available";
      const message = `
        A new training module has been created: <strong>${module.title}</strong>.<br><br>
        ${module.description || "No description provided."}<br><br>
        Please log in to your account to view and start the module.
      `;

      // 3. Bulk send (all in BCC)
      await sgMail.send({
        from: process.env.EMAIL,
        personalizations: [
          {
            to: process.env.EMAIL, // 👈 required "to" (even if unused)
            bcc: emails,           // 👈 SendGrid expects objects here
          },
        ],
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border-radius: 12px; background: #ffffff; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">
              ${subject}
            </h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
              ${message}
            </p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #888; text-align: center; margin: 0 0 6px 0;">
              This is an automated email. Please do not reply.
            </p>
            <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Projexlify. All rights reserved.
            </p>
          </div>
        `,
      });
    }

    return {
      message: "Module created successfully",
      data: module,
    };
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    throw error;
  }
},

  updateModule: async (id, title, description) => {
    const transaction = await sequelize.transaction();
    try {
      const module = await Module.findOne({ where: { id }, transaction });
      // logInfo(module);
      if (!module) {
        throwError("Module not found", 404, true);
      }

      await module.update({ title, description }, { transaction });
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
