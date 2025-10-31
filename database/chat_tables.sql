-- Drop existing tables if they exist (be careful with this!)
DROP TABLE IF EXISTS chat_message;
DROP TABLE IF EXISTS chat_room;

-- Create chat_room table with INT primary key
CREATE TABLE chat_room (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trainer_id INT NOT NULL,
    trainee_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE (trainer_id, trainee_id)
);

-- Create chat_message table with room_id as INT
CREATE TABLE chat_message (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_room(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Optional: Add index for better query performance
CREATE INDEX idx_chat_room_trainer_trainee ON chat_room(trainer_id, trainee_id);
CREATE INDEX idx_chat_message_room ON chat_message(room_id);
CREATE INDEX idx_chat_message_sender ON chat_message(sender_id);
