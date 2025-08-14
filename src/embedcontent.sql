-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 13. Aug 2025 um 20:01
-- Server-Version: 10.4.32-MariaDB
-- PHP-Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `grand_fam_bot`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `embedcontent`
--

CREATE TABLE `embedcontent` (
  `ID` int(11) NOT NULL,
  `event` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `header` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `embedcontent`
--

INSERT INTO `embedcontent` (`ID`, `event`, `content`, `header`) VALUES
(1, '40', '⚡️ **Prio**                 ${prio}\n🔫 **Abgesägte**     ❌\n-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ \n📞 **Call**                https://discord.com/channels/1397954631883161630/${process.env.vierzigerEVENT_CALL}\n-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ \n- **Information:**\n> Um ${timeKey}:30 ausgerüstet an der Event-Zone', '# 40er ${timeKey}:40'),
(2, 'bizwar', '⚡️ **Prio**                  ${prio}\n🔫 **Abgesägte**     ❌❌\n-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ \n📞 **Call**                https://discord.com/channels/1397954631883161630/${process.env.fuenfundzwanzigerEVENT_VOICE}\n-#  ⠀ ⠀ ⠀ ⠀ ⠀ ⠀ \n- **Information:**\n> Um ${timeKey}:30 ausgerüstet an der Event-Zone', '# Bizwar ${timeKey+1}:05');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `embedcontent`
--
ALTER TABLE `embedcontent`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `embedcontent`
--
ALTER TABLE `embedcontent`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
