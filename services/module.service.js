const { Module, ModuleContent, User, ModuleHistory } = require("../models/associations");
const sequelize = require("../config/db");
const { throwError } = require("../utils/util"); // adjust path
const { logInfo } = require("../utils/logs");
const emailService = require("./email.service");
const sgMail = require("@sendgrid/mail");
const { Op } = require("sequelize");

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

  getAvailableModules: async () => {
    try {
      const modules = await Module.findAll({
        where: { status: "published" },
        order: [["created_at", "DESC"]],
      });

      return {
        message: "Available modules fetched successfully",
        data: modules,
      };
    } catch (error) {
      throw error;
    }
  },

  getModuleHistory: async (moduleId) => {
    //connects to user model to get user info
    try {
      const history = await ModuleHistory.findAll({
        where: { module_id: moduleId },
        order: [["created_at", "DESC"]],

        //make the User = user smaller
        include: [{ model: User, attributes: ["email"] }],
      });

      return {
        message: "Module history fetched successfully",
        data: history,
      };
    } catch (error) {
      console.log(error)
      throw error;
    }
  },

createModule: async (title, category, created_by) => {
  const transaction = await sequelize.transaction();
  try {
    const frontend_url = process.env.CLIENT_URL;

    //module title should be unique
    const existingModule = await Module.findOne({ where: { title } });
    if (existingModule) {
      throwError("Module with this title already exists", 400, true);
    }

    const module = await Module.create({ title, category, created_by }, { transaction });

    await ModuleHistory.create({
      module_id: module.id,
      action: "created",
      created_by,
    }, { transaction });

    const users = await User.findAll({
      where: { status: "verified", role: "trainee" },
      attributes: ["email"],
    }, { transaction });

    // if (users && users.length > 0) {
    //   const emails = users.map((u) => ({ email: u.email }));

    //   const subject = "📘 New Training Module Available";
    //   const message = `
    //     A new module has been created: <strong>${module.title}</strong>.<br><br>
    //     ${module.description || "No description provided."}<br><br>
    //     Please log in to your account to view and start the module.
    //   `;

      // const emailPromises = emails.map((user) =>
      //   emailService
      //     .sendNotification(user.email, subject, message)
      //     .catch((err) =>
      //       logInfo(`Failed to send email to ${user.email}: ${err.message}`)
      //     )
      // );
      // await Promise.all(emailPromises);


      /**
       * @BREAK
       */
      // await sgMail.send({
      //   from: process.env.EMAIL,
      //   personalizations: [
      //     {
      //       to: process.env.EMAIL,
      //       bcc: emails,
      //     },
      //   ],
      //   subject,
      //   html: `
      //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border-radius: 12px; background: #ffffff; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      //       <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">
      //         ${subject}
      //       </h2>
      //       <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
      //         ${message}
      //       </p>
      //       <div style="text-align: center; margin: 30px 0;">
      //         <a href="${frontend_url}" style="background: #3498db; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; display: inline-block;">
      //           Visit Site
      //         </a>
      //       </div>
      //       <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
      //       <p style="font-size: 14px; color: #888; text-align: center; margin: 0 0 6px 0;">
      //         This is an automated email. Please do not reply.
      //       </p>
      //       <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">
      //         © ${new Date().getFullYear()} Projexlify. All rights reserved.
      //       </p>
      //     </div>
      //   `,
      // });
      
    // }

    await transaction.commit();

    return {
      message: "Module created successfully",
      data: module,
    };
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    await transaction.rollback();
    throw error;
  }
},

  updateModule: async (id, title, category) => {
    const transaction = await sequelize.transaction();
    try {
      const existingTitle = await Module.findOne({ where: { title, id: { [Op.ne]: id } } }, { transaction });
      if (existingTitle) {
        throwError("Module with this title already exists", 400, true);
      }

      const module = await Module.findOne({ where: { id }, transaction });
      // logInfo(module);
      if (!module) {
        throwError("Module not found", 404, true);
      }
      
      await module.update({ title, category }, { transaction });
      await ModuleHistory.create({
        module_id: module.id,
        action: "updated",
        created_by: module.created_by,
        changes: { title, category },
      }, { transaction });

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

  archiveModule: async (id) => {
    const transaction = await sequelize.transaction();
    try {
      const module = await Module.findOne({ where: { id } });
      if (!module) {
        throwError("Module not found", 404, true);
      }
      await module.update({ status: "archived" }, { transaction });
      await ModuleHistory.create({
        module_id: module.id,
        action: `archived: ${module.title}`,
        created_by: module.created_by,
      }, { transaction });

      await transaction.commit();
      return {
        message: "Module archived successfully",
        data: module,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  restoreModule: async (id) => {
    const transaction = await sequelize.transaction();
    try {
      const module = await Module.findOne({ where: { id } });
      if (!module) {
        throwError("Module not found", 404, true);
      }
      await module.update({ status: "published" }, { transaction });
      await ModuleHistory.create({
        module_id: module.id,
        action: `restored: ${module.title}`,
        created_by: module.created_by,
      }, { transaction });

      await transaction.commit();
      return {
        message: "Module restored successfully",
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
    const transaction = await sequelize.transaction();
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
      } , { transaction });

      await ModuleHistory.create({
        module_id: module.id,
        action: `file_uploaded: ${name}`,
        created_by: module.created_by,
      }, { transaction });

      await transaction.commit();

      return {
        message: "File uploaded successfully",
        data: newFile,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

deleteFile: async (id, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const file = await ModuleContent.findByPk(id);

    if (!file) {
      throwError("File not found", 404, true);
    }

    await ModuleHistory.create({
      module_id: file.module_id,
      action: `file_deleted: ${file.name}`,
      created_by: userId, // ✅ correct user reference
    }, { transaction });

    await file.destroy({ transaction });

    await transaction.commit();

    return {
      message: "File deleted successfully",
      id,
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
},

};

module.exports = moduleService;
