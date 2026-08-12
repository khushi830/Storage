-- CreateTable
CREATE TABLE `Records` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `Link` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `Password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Records_Link_key`(`Link`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
