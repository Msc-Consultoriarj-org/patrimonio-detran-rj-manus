CREATE TABLE `sugestoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(200) NOT NULL,
	`descricao` text NOT NULL,
	`categoria` varchar(100) NOT NULL,
	`prioridade` enum('baixa','media','alta') NOT NULL DEFAULT 'media',
	`status` enum('pendente','em_analise','aprovada','rejeitada') NOT NULL DEFAULT 'pendente',
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sugestoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `patrimonios` MODIFY COLUMN `valor` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `patrimonios` ADD `imageUrl` text;