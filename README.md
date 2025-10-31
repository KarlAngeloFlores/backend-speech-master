# 🎙️ Speech Master

An AI-powered learning platform designed to help **trainees** improve their pronunciation, listening, and comprehension skills while enabling **trainers** to manage modules, create quizzes, and monitor performance.

---

## 🌐 Live URLs

- **Backend API**: [https://backend-speech-master.onrender.com](https://backend-speech-master.onrender.com)  
- **Frontend App**: [https://speechmaster.netlify.app](https://speechmaster.netlify.app)

> ⚡ For local development:  
> - Frontend runs on `http://localhost:5173`  
> - Backend runs on `http://localhost:5000`

---

## 📂 GitHub Repositories

- **Backend**: [backend-speech-master](https://github.com/KarlAngeloFlores/backend-speech-master.git)  
- **Frontend**: [frontend-speech-master](https://github.com/KarlAngeloFlores/frontend-speech-master.git)

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, MySQL2, Sequelize  
- **Authentication**: JSON Web Token (JWT), bcrypt  
- **Email Service**: Nodemailer (development), SendGrid (production)  
- **File Handling**: Multer
- **AI Integration**: OpenAI API  
- **Other Utilities**: cors, cli-color, dotenv  

---

## 🚀 Features

### 🔐 General
- User Authentication (Sign Up / Login)  
- Role-based Authentication (Trainer / Trainee)  
- Forgot Password with Email Verification  

### 👨‍🏫 Trainer
- View Basic Analytics  
- Create Quizzes/Activities (Shoot the Word, Pronounce It Fast)  
- Manage Quizzes (Create, View Results, Delete)  
- Manage Trainees (Approve, View Performance, Delete)  
- Create Modules (PDF/Word upload) with CRUD operations  
- Notify verified trainees when new modules are created  

### 🧑‍🎓 Trainee
- Answer quizzes/activities and view results  
- Search for words, view definitions, and listen at different speeds  
- Practice scripts generated via OpenAI (real-time mic input & feedback)  
- Access modules and view trainer-provided materials  

## Installation & Setup for local (development)
> **Important:** For the backend to be fully functional, you must **run the frontend after running this.** 

>Frontend repository: **link**

>Default frontend URL: `http://localhost:5173`

### 1️⃣ Clone this repository 
> git clone **https://github.com/KarlAngeloFlores/backend-speech-master.git**

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Create MySQL Tables
### MySQL TABLES
## Execute all of this on your MySQL Platform
```
-- Create user table
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(255), -- trainee, trainer
    status VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    middle_name VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create quiz table
CREATE TABLE quiz (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(255),
    title VARCHAR(255),
    total_points INT,
    timer_seconds INT NULL,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE
);

-- Create quiz_questions table
CREATE TABLE quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT,
    question_word VARCHAR(255),
    difficulty VARCHAR(100), -- easy, medium, hard
    FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE
);

-- Create quiz_attempt table
CREATE TABLE quiz_attempt (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    quiz_id INT,
    status VARCHAR(50), -- 'not_started', 'in_progress', 'completed'
    started_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE
);

-- Create quiz_score table
CREATE TABLE quiz_score (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    quiz_id INT,
    score INT,
    taken_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE
);

-- Create module
CREATE TABLE module (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    status  varchar(255) NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE CASCADE
);

-- Upload file modules
CREATE TABLE module_contents (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    module_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    file LONGBLOB NOT NULL, -- use LONGBLOB for larger PDFs
    file_type VARCHAR(100), -- e.g., application/pdf, application/msword
    file_size INT,          -- size in bytes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES module(id) ON DELETE CASCADE
);

-- module history
CREATE TABLE module_history (
	id int primary key auto_increment,
    module_id int not null,
    action varchar(255),
    created_by int not null,
    created_at datetime default current_timestamp,
    foreign key (module_id) references module(id) on delete cascade,
    foreign key (created_by) references user(id) on delete cascade
);

-- Verification codes
CREATE TABLE verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    email VARCHAR(255) NULL,
    code_hash VARCHAR(255) NOT NULL,
    purpose ENUM('account_verification', 'password_reset') NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

```

### 4️⃣ Configure environment variables
#### Create a **.env** file in the project root:
```
# PORT
PORT=your_backend_port

# Database
DB_PORT=your_db_port
DB_USER=your_db_user
DB_PASS=your_password
DB_NAME=project_management

# JWT
JWT_SECRET=your_jwt_secret

# Email (development: nodemailer)
EMAIL_DEV=your_dev_email
EMAIL_PASS_DEV=your_dev_email_password

# Email (production: SendGrid)
EMAIL=your_verified_sendgrid_email
SENDGRID_API_KEY=your_sendgrid_api_key

# Client URL (frontend)
CLIENT_URL=your_frontend_url

```

### 5️⃣ Run development server
#### Type this on terminal on backend directory  
```
npm run dev
```
