const { User, VerificationCode } = require("../models/associations");
const bcrypt = require("bcrypt");
const { generateToken, throwError, generateVerificationCode, verifyToken } = require("../utils/util");
const emailService = require("./email.service");

const authService = {
    login: async (email, password) => {
        try {
            
            const user = await User.findOne({ where: { email} });

            if(!user) {
                throwError('User not found', 404, true);
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if(!passwordMatch) {
                throwError('Invalid credentials', 401, true);
            }

            console.log(user.status);
            
            const accessToken = generateToken({ id: user.id, email: user.email, role: user.role, status: user.status }, "1h");
            return { accessToken, 
                role: user.role, 
                status: user.status, 
                message: 'Logged in successfully' };
            
        } catch (error) {
            throw error;
        }
    },

    register: async (email, first_name, last_name, middle_name) => {
        try {
            
            const existingUser = await User.findOne({ where: { email }, attributes: ['email'] });

            if(existingUser) {
                throwError('User already exists', 409, true);
            }

            const token = generateToken({email, first_name, last_name, middle_name}, "15m");

            const verificationCode = generateVerificationCode();
            const hashedCode = await bcrypt.hash(verificationCode.toString(), 10);
            const expires_at = new Date(Date.now() + 15 * 60 * 1000);
            const purpose = "account_verification";
            
            //delete old codes and insert new one
        
            await VerificationCode.destroy({
                where: { email, purpose }
            });
            
            await VerificationCode.create({ email, code_hash: hashedCode, purpose, expires_at });

            //send email

            const subject = "Registration verification code - Speech Master";
            await emailService.sendVerificationCode(email, verificationCode, subject);
            
            return {
                message: "Sent email verification code",
                token
            };
            
        } catch (error) {
            throw error;
        }
    },

    registerAndVerify: async (token, password, code) => {
        try {
            
            if (!token || !password || !code) {
                throwError('Missing credentials', 400, true);
            }

            let decoded;
  
            try {
                decoded = verifyToken(token);
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    throwError('Verification token expired. Please register again.', 401, true);
                }
                throwError('Invalid verification token', 401, true);
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const { email, first_name, last_name, middle_name } = decoded;

            const purpose = 'account_verification';
            const record = await VerificationCode.findOne({ where: { email, purpose } });

            if (new Date(record.expires_at) < new Date()) {
                throwError('Verification code expired', 400, true);
            }

            const isMatchCode = await bcrypt.compare(code.toString(), record.code_hash);

            if(!isMatchCode) {
                throwError('Invalid verification code', 400, true);
            };

            await VerificationCode.destroy({ where: { email, purpose } });
            const data = await User.create({ email, password: hashedPassword, role: 'trainee', status: 'pending', first_name, last_name, middle_name });

            return {
                message: 'Successful registration',
                data
            }

        } catch (error) {
            throw error;
        }
    },

        resendVerificationCode: async (email, purpose) => {
            
            try {
                
            const record = await VerificationCode.findOne({ where: { email, purpose } });

            if(record) {
                await record.destroy();
            }
            
            const newCode = generateVerificationCode();
            const hashedCode = await bcrypt.hash(newCode.toString(), 10);
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            await VerificationCode.create({ 
                email, 
                code_hash: hashedCode, 
                purpose, 
                expires_at: expiresAt 
            });

            await emailService.sendVerificationCode(email, newCode, "Resent verification code");

            return {
                message: 'Verification code resent successfully'
            }
           
            } catch (error) {
                throw error;
            }
        },

        forgotPassword: async (email) => {
            try {
                
                const existingUser = await User.findOne({ where: { email }, attributes: { exclude: ['password'] } });

                if(!existingUser) {
                    throwError('Email is not registered', 404, true);
                }

                const passVerificationCode = generateVerificationCode();
                const hashedCode = await bcrypt.hash(passVerificationCode.toString(), 10);

                const purpose = 'password_reset';
                const expires_at = new Date(Date.now() + 15 * 60 * 1000);

                //delete old code -> insert new code -> send code email
                await VerificationCode.destroy({ where: { email, purpose } });
                await VerificationCode.create({ email, code_hash: hashedCode, purpose, expires_at });

                const subject = 'Forgot password - Verfication code'
                await emailService.sendVerificationCode(email, passVerificationCode, subject);
                
                return {
                    message: 'Sent email verification code', 
                }

            } catch (error) {
                throw error;      
            }
        },

        verifyResetPassword: async (email, code) => {
            try {
                
            if(!email || !code) {
                throwError('Missing credentials', 400, true);
            };
            
            const purpose = 'password_reset';
            const record = await VerificationCode.findOne({ where: { email, purpose }});
            
            if(!record) {
                throwError('No verification code found', 404, true);
            }
            
            if (new Date(record.expires_at) < new Date()) {
                    throwError('Verification code expired', 400, true);
            }

            const isMatchCode = await bcrypt.compare(code.toString(), record.code_hash);
            if(!isMatchCode) {
                throwError('Invalid verification code', 400, true);
            };

            await VerificationCode.destroy({ where: { email, purpose }});

            return {
                message: 'Successful verification code',
                success: true
            }

            } catch (error) {
                throw error;
            } 
        },

                confirmNewPassword: async (email, newPassword, confirmPassword) => {
            try {
                
                const existingUser = await User.findOne({ where: { email } });

                if(!existingUser) {
                    throwError('User not found', 404, true);
                };

                if(!newPassword || !confirmPassword) {
                    throwError('Missing credentials', 400, true);
                };

                if (newPassword !== confirmPassword) {
                    throwError('Passwords do not match.', 400, true);
                }

                const passwordIsMatch = await bcrypt.compare(newPassword, existingUser.password);
                if(passwordIsMatch) {
                    throwError('Password cannot be the same as your current password.', 400, true);
                }

                const hashedPassword = await bcrypt.hash(newPassword, 10);
                const result = await User.update(
                    { password: hashedPassword }, 
                    { where: { email } }
                );

                const loginPageURL = process.env.CLIENT_URL; //frontend url
                await emailService.sendNotification(email, 'Forgot password', `Your password has been changed successfully. Try logging it again ${loginPageURL}`);

                return {
                    message: 'Changed password successfully'
                };

            } catch (error) {
                throw error;
            }
        },
}

module.exports = authService;