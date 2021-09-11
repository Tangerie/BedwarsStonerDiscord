import dotenv from 'dotenv';
import fs from "fs";

import { Client, CommandInteraction, Intents, Interaction } from 'discord.js';
import { RegisterCommandsForAllGuilds } from './util/deploycommands';
import Command from './models/command';

//Load .env file
dotenv.config();

//#region Token Checks
if(process.env.DISCORD_TOKEN == undefined || process.env.DISCORD_TOKEN == "") {
    console.error("No Discord Token in .env");
    process.exit();
}

if(process.env.HYPIXEL_TOKEN == undefined || process.env.HYPIXEL_TOKEN == "") {
    console.error("No Hypixel Token in .env");
    process.exit();
}
//#endregion

const client = new Client({intents: [Intents.FLAGS.GUILDS] });

//#region Event Registration
client.once('ready', onReady);

client.on('interactionCreate', onInteractionCreate);
//#endregion


function LoadCommands() : Map<string, Command>  {
    const cmds = new Map<string, Command>();

    const files = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith(".js"));
    
    for(const file of files) {
        const cmd = require(`${__dirname}/commands/${file}`) as Command;

        cmds.set(cmd.data.name.toLowerCase(), cmd);
    }

    return cmds;
}

const commands : Map<string, Command> = LoadCommands();

async function onReady() {
    console.log("Bot Ready");
    
    RegisterCommandsForAllGuilds(client, [...commands.values()]);
}

async function onInteractionCreate(interaction : Interaction) {
    if(interaction.isCommand()) {
        const cmdInter = interaction as CommandInteraction;

        const cmd = commands.get(interaction.commandName);

        if(!cmd) return;

        try {
            await cmd.execute(cmdInter);
        } catch {
            await cmdInter.reply({ content: 'There was an error while executing this command', ephemeral: true })
        }
        
    } else {

    }
}

client.login(process.env.DISCORD_TOKEN);