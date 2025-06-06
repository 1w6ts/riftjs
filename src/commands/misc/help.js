const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const botConfig = require("../../config/rift.json");

module.exports = {
  name: "help",
  description: "Shows all available commands",
  aliases: ["h", "commands"],
  async execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🎮 Rift Commands")
      .setDescription("Here are all available commands:")
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp();

    const commandsPath = path.join(__dirname, "..");
    const commandFolders = fs
      .readdirSync(commandsPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith(".js"));

      if (commandFiles.length > 0) {
        const commands = commandFiles
          .map((file) => {
            const command = require(path.join(folderPath, file));
            return `\`${command.name}\` - ${
              command.description || "No description"
            }`;
          })
          .join("\n");

        embed.addFields({
          name: `📁 ${folder.toUpperCase()}`,
          value: commands,
          inline: false,
        });
      }
    }

    embed.setFooter({
      text: `Use ${botConfig.prefix}<command> to run a command`,
      iconURL: message.author.displayAvatarURL(),
    });

    await message.reply({ embeds: [embed] });
  },
};
