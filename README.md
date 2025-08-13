# Grand Family Bot – Ein einfacher und Starker Familien Bot

Ein leistungsstarkes, modulares Ticketsystem für Discord mit Bestellabwicklung, Verifizierung, Zahlungsmethoden und Creator-Management.

## 🚀 Features

- 🧾 Automatisierte Event Reminder
- 🌌 Prototyp eines Ankündigungs Systems

## 🧱 Projektstruktur

```
grand_fam_bot/
├── .env                  # Umgebungsvariablen (Token, DB-Zugang, IDs)
├── src/
│   ├── index.js          # Haupt-Entry
│   ├── settings.json     # Variablen [OUTDATET]
│   ├── util/             # Util
│   ├── img/              # Bilder
│   ├── commands/         # Slash Commands
│   └── handler/          # Interaktionen, Buttons, Modals
├── package.json          # Projekt Variablen
├── package-lock.json     # Projekt Variablen
└── README.md
```

## ⚙️ Installation

1. Repository klonen
```bash
git clone https://github.com/Mizuzy/GrandRP-Fam-Bot
cd tekknine_v3
```

2. Abhängigkeiten installieren
```bash
npm install
```

3. `.env` Datei anlegen:
```ini
TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=BOT_ID

DB_HOST=DB_HOST
DB_USER=DB_USER
DB_PASSWORD=DB_PW        
DB_NAME=grand_fam_bot

GUILD_ID=1234567890

PERMISSION_ROLES=1234567890
EV_PING_ROLE=1234567890
BUSINESS_PING_ROLE=1234567890
OP_EV_PING_ROLE=1234567890
MITGLIEDER_PING_ROLE=1234567890

EV_ANKUENDIGUNG=1234567890
BUSINESS_REMINDER=1234567890
ANKUENDIGUNGEN=1234567890
fuenfundzwanzigerEVENT_VOICE=1234567890
vierzigerEVENT_CALL=1234567890
WARTEHALLE_CALL=1234567890
EKZ_KCALL=1234567890
```

4. Log Ordner und File erstellen
```bash
grand_fam_bot/
├── logs/
└── └── logs.log          #Log File
```

5. Bot starten
```bash
node src/index.js
```

## ✅ Admin Slash-Commands

| Befehl | Beschreibung |
|--------|--------------|
| `/bizconfig` | Konfigurator des nächsten Bizwar |
| `/fort_y_config` | Konfigurator des nächsten 40er Events |
| `/config` | Ein allg. Konfigurierungs Command |

## 📞 Kontakt

Support über Discord: [Cavara Hub](https://discord.gg/cavarahub)