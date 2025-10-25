CREATE TABLE `quotationItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quotationId` int NOT NULL,
	`product` varchar(255) NOT NULL,
	`description` text,
	`specimen` varchar(255),
	`format` varchar(255),
	`pack` varchar(255),
	`quantity` int NOT NULL DEFAULT 1,
	`baseUsdFinished` varchar(20) NOT NULL,
	`baseRmbFinished` varchar(20) NOT NULL,
	`baseUsdBulk` varchar(20),
	`baseRmbBulk` varchar(20),
	`markupPercentage` varchar(20) NOT NULL DEFAULT '0.10',
	`finalUsdFinished` varchar(20) NOT NULL,
	`finalRmbFinished` varchar(20) NOT NULL,
	`finalUsdBulk` varchar(20),
	`finalRmbBulk` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quotationItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`customerName` varchar(255),
	`quotationNumber` varchar(100) NOT NULL,
	`exchangeRate` varchar(20) NOT NULL DEFAULT '7.1',
	`taxRate` varchar(20) NOT NULL DEFAULT '0.13',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotations_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotations_quotationNumber_unique` UNIQUE(`quotationNumber`)
);
