CREATE TABLE `patrimonio_historico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patrimonioId` int NOT NULL,
	`userId` int NOT NULL,
	`tipoAcao` enum('criacao','edicao','exclusao','movimentacao') NOT NULL,
	`campoAlterado` varchar(100),
	`valorAnterior` text,
	`valorNovo` text,
	`descricaoAcao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patrimonio_historico_id` PRIMARY KEY(`id`)
);
