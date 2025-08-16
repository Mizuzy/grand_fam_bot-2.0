require("dotenv").config(); 

const {
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    MessageFlags,
    ButtonBuilder, ButtonStyle, ActionRowBuilder
} = require('discord.js');
const db = require('../utils/mysql'); 
const cron = require("node-cron"); 
const fs = require("fs"); 
const path = require("path"); 

async function createEmbed(guildName,) {
    
    const components = [
        new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Web Panel - Account Erstellung"),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("Klicke auf „Account erstellen“, um einen Web-Panel-Account zu erstellen."),
            )
            .addActionRowComponents(
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Primary)
                            .setLabel("Account erstellen")
                            .setEmoji({
                                name: "👤",
                            })
                            .setCustomId("2996c20240ef4c7d88d0efbd62a1bbf9"),
                    ),
            ),
];

    return components;
}


module.exports = async function handleWelcome(client, member) {

try {
        const components  = await createEmbed(
            member.guild.name
        );

        await member.send({
            components: components,
            flags: MessageFlags.IsComponentsV2,
        });

        console.log(`DM an ${member.user.tag} erfolgreich geschickt.`);
    } catch (err) {
        console.error(`Konnte keine DM an ${member.user.tag} schicken:`, err.message);
    }

};

function addEntry(user, pww, ICID) {
    return db.execute(
        "INSERT INTO user (user, pww, ICID) VALUES (?, ?, ?)",
        [user, pww, ICID]
    );
}
