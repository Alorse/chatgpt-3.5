CREATE TABLE `messages` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(32) NOT NULL,
  `room_id` CHAR(36) NOT NULL,
  `message_text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
);

CREATE TABLE `rooms` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(32) NOT NULL,
  `name` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
);

CREATE TABLE `users` (
  `id` CHAR(32) NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `password` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES ('0', 'AI', 'gpt@openai.com', NULL, CURRENT_TIMESTAMP);