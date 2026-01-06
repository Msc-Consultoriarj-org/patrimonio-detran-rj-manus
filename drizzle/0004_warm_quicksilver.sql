ALTER TABLE `users` ADD `detranLogin` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_detranLogin_unique` UNIQUE(`detranLogin`);