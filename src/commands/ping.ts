import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction } from "discord.js";
import Command from "../models/command";

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong!")


export const admin = true;

export async function execute(interaction : CommandInteraction) {
    interaction.reply({content: "Pong!"});
}