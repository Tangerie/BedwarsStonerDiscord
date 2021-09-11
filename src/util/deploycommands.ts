import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from '@discordjs/rest';
import { Routes } from "discord-api-types/v9";
import { ApplicationCommand, Client, Guild, GuildApplicationCommandPermissionData, Permissions } from "discord.js";
import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";

import Command from "../models/command";

//Registers commands for all guilds currently joined
export async function RegisterCommandsForAllGuilds(client: Client, commands : Command[]) {
    for(const [id, guild] of client.guilds.cache) {
        RegisterCommandsForGuild(client, commands, guild);   
    }
}

//Register / Perms for a guild
export async function RegisterCommandsForGuild(client: Client, commands : Command[], guild : Guild) {
        console.log(`[${guild.name}] Registering Commands`)
        const res = await RegisterRawCommandsForGuild(client, guild.id, commands);
        
        //Fix Permission
        console.log(`[${guild.name}] Applying Permissions`);
        const fullPermissions = await CalculateAdminPermissions(guild, commands, res);

        await guild.commands.permissions.set({
            fullPermissions
        });

        console.log(`[${guild.name}] Commands Registered`);
}

//Used when admin roles are changed etc.
export async function UpdatePermissionsForGuild(guild : Guild, commands : Command[]) {
    const appCommands = [...guild.commands.cache.values()];
    const fullPermissions = await CalculateAdminPermissions(guild, commands, appCommands);

    return await guild.commands.permissions.set({
        fullPermissions
    });
}

//Calculate the perms object
async function CalculateAdminPermissions(guild : Guild, commands : Command[], appCommands : ApplicationCommand[]) : Promise<GuildApplicationCommandPermissionData[]> {
    const perms : GuildApplicationCommandPermissionData[] = [];

    const adminRoles = [...guild.roles.cache.filter(x => x.permissions.has(Permissions.FLAGS.ADMINISTRATOR)).values()];

    if(!adminRoles || adminRoles.length == 0) return perms;

    for(const cmd of commands) {
        if(cmd.admin) {
            const appCmd = appCommands.find(x => x.name == cmd.data.name);
            if(!appCmd) continue;

            perms.push({
                id: appCmd.id,
                permissions: adminRoles.map(role => {return {
                    id: role.id,
                    permission: true,
                    type: 'ROLE'
                }})
            })
        }
    }

    return perms;
}

//Send the instructions to register commands
async function RegisterRawCommandsForGuild(client : Client, guildId : string, commands : Command[]) : Promise<ApplicationCommand[]> {
    const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN as string);

    const res = await rest.put(Routes.applicationGuildCommands(client.user?.id || "", guildId), { body: commands.map(x => {
        const cmd = x.data.toJSON();

        if(x.admin) {
            /* @ts-ignore */
            cmd.default_permission = false;
        }

        return cmd;
    })}).catch(x => console.error(`Failed to set commands`));
    return res as ApplicationCommand[];
}