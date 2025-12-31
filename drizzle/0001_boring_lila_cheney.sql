CREATE TABLE `patrimonios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`descricao` text NOT NULL,
	`categoria` varchar(100) NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`localizacao` varchar(200) NOT NULL,
	`numeroSerie` varchar(100),
	`dataAquisicao` timestamp NOT NULL,
	`responsavel` varchar(200) NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patrimonios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `mustChangePassword` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);