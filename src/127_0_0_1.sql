CREATE DATABASE IF NOT EXISTS `grand_fam_bot` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `grand_fam_bot`;

-- --------------------------------------------------------
-- Tabelle: config
-- --------------------------------------------------------
CREATE TABLE `config` (
  `ID` int(11) NOT NULL,
  `config` text DEFAULT NULL,
  `setconfig` int(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `config` (`ID`, `config`, `setconfig`) VALUES
(1, 'send_bizwar', 1),
(2, 'send_RPTicket', 1),
(3, 'send_waffenfabrik', 1),
(4, 'send_giesserei', 1),
(5, 'send_cayo', 1),
(6, 'send_ekz', 1),
(7, 'send_bank/flugzeugtreager', 1),
(8, 'send_hafen', 1),
(9, 'send_waffenkomponente', 1),
(10, 'send_hotel', 1),
(11, 'send_weinberge', 1),
(12, 'send_40', 1);

ALTER TABLE `config`
  ADD PRIMARY KEY (`ID`);

ALTER TABLE `config`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

-- --------------------------------------------------------
-- Tabelle: embedcontent
-- --------------------------------------------------------
CREATE TABLE `embedcontent` (
  `ID` int(11) NOT NULL,
  `event` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `header` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `embedcontent` (`ID`, `event`, `content`, `header`) VALUES
(1, '40', '⚡️ **Prio**                 ${prio}\n🔫 **Abgesägte**     ❌\n-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ \n📞 **Call**                https://discord.com/channels/1397954631883161630/${process.env.vierzigerEVENT_CALL}\n-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ \n- **Information:**\n> Um ${timeKey}:30 ausgerüstet an der Event-Zone', '# 40er ${timeKey}:40'),
(2, 'bizwar', '⚡️ **Prio**                  ${prio}\n🔫 **Abgesägte**     ❌❌\n-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ \n📞 **Call**                https://discord.com/channels/1397954631883161630/${process.env.fuenfundzwanzigerEVENT_VOICE}\n-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ \n- **Information:**\n> Um ${timeKey}:30 ausgerüstet an der Event-Zone', '# Bizwar ${timeKey+1}:05');

ALTER TABLE `embedcontent`
  ADD PRIMARY KEY (`ID`);

ALTER TABLE `embedcontent`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- --------------------------------------------------------
-- Tabelle: events
-- --------------------------------------------------------
CREATE TABLE `events` (
  `ID` int(11) NOT NULL,
  `Event` text DEFAULT NULL,
  `Prio` text DEFAULT NULL,
  `MapID` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `events` (`ID`, `Event`, `Prio`, `MapID`) VALUES
(1, 'forty', 'Medium', NULL),
(2, 'bizwar', '🔴 High', NULL),
(3, '40', '🟡 Medium', NULL);

ALTER TABLE `events`
  ADD PRIMARY KEY (`ID`);

ALTER TABLE `events`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

-- --------------------------------------------------------
-- Tabelle: maps
-- --------------------------------------------------------
CREATE TABLE `maps` (
  `ID` int(11) NOT NULL,
  `MAP` text DEFAULT NULL,
  `IMG` text DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `maps` (`ID`, `MAP`, `IMG`, `event`) VALUES
(1, 'Hafen', 'https://cdn.discordapp.com/attachments/1198425174018625566/1399348229560074320/40er-hafen.png?ex=6888ac18&is=68875a98&hm=07e1b83ddc8dce232e23b22016da907265448ed64a6ea607f74159742c338bed&', 'bizwar'),
(4, 'Hafen', 'https://cdn.discordapp.com/attachments/1399306835508596848/1399359927977246762/40er-hafen.png?ex=68895fbd&is=68880e3d&hm=163b5c76fbcefc99c3465ebdbccbbcc2c8f81e20c631dde2347ddd47451f7828&', '40'),
(5, 'Baustelle', 'https://cdn.discordapp.com/attachments/1399306835508596848/1399359994167562300/40er-baustelle.png?ex=6888b70d&is=6887658d&hm=1b9a3ec230e03ac927f47b498ae87b520faa1735eaa9202b1c6a79faf6701850&', '40'),
(6, 'Theater', 'https://cdn.discordapp.com/attachments/1399306835508596848/1399479392366759946/40er-theater.png?ex=68892640&is=6887d4c0&hm=20d1e9e7b162a049e6744d4f2bab9b1777ac2ed2daab72df92a05ee53ddf863c&', '40'),
(7, 'Filmstudios', 'https://cdn.discordapp.com/attachments/1399306835508596848/1399359994167562300/40er-baustelle.png?ex=68895fcd&is=68880e4d&hm=3201adacc1c41ddfd4fba0ed00ea3a26c961bd43838fafef264a6647c030fd93&', '40'),
(8, 'Feuerwehr', 'https://cdn.discordapp.com/attachments/1399777446169018429/1401182114107621417/clear.png?ex=688f5808&is=688e0688&hm=4e32c56822c9271d84f42592eb00f19e9af1ea14416410fcd6cfaf959fa3ee7d&', '40'),
(9, 'Öl Felder', 'https://cdn.discordapp.com/attachments/1399777446169018429/1401182114107621417/clear.png?ex=688f5808&is=688e0688&hm=4e32c56822c9271d84f42592eb00f19e9af1ea14416410fcd6cfaf959fa3ee7d&', '40'),
(10, 'Famwar', 'https://cdn.discordapp.com/attachments/1399777446169018429/1401182114107621417/clear.png?ex=688f5808&is=688e0688&hm=4e32c56822c9271d84f42592eb00f19e9af1ea14416410fcd6cfaf959fa3ee7d&', '40'),
(11, 'Flugzeugfriedhof', 'https://cdn.discordapp.com/attachments/1399777446169018429/1401182114107621417/clear.png?ex=688f5808&is=688e0688&hm=4e32c56822c9271d84f42592eb00f19e9af1ea14416410fcd6cfaf959fa3ee7d&', '40'),
(12, 'E-Werke', 'https://cdn.discordapp.com/attachments/1399777446169018429/1401182114107621417/clear.png?ex=688f5808&is=688e0688&hm=4e32c56822c9271d84f42592eb00f19e9af1ea14416410fcd6cfaf959fa3ee7d&', '40');

ALTER TABLE `maps`
  ADD PRIMARY KEY (`ID`);

ALTER TABLE `maps`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
-- --------------------------------------------------------

COMMIT;

-- Charset-Settings zurücksetzen
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;