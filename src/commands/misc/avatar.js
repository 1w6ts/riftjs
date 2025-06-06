const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "avatar",
  description: "Display a user's Discord avatar",
  aliases: ["av", "pfp", "profilepic"],
  async execute(message, args, client) {
    let target = message.author;

    // Check if a user was mentioned or ID provided
    if (args[0]) {
      if (message.mentions.users.first()) {
        target = message.mentions.users.first();
      } else {
        try {
          target = await client.users.fetch(args[0]);
        } catch (error) {
          return message.reply(
            "❌ Could not find that user! Please mention them or provide a valid ID."
          );
        }
      }
    }

    try {
      // Fetch the user with force to get the latest data
      const user = await client.users.fetch(target.id, { force: true });

      // Get global avatar URLs in different formats
      const globalAvatarURL = user.displayAvatarURL({
        dynamic: true,
        size: 4096,
      });
      const globalPNG = user.displayAvatarURL({ extension: "png", size: 4096 });
      const globalJPG = user.displayAvatarURL({ extension: "jpg", size: 4096 });
      const globalWEBP = user.displayAvatarURL({
        extension: "webp",
        size: 4096,
      });

      const embed = new EmbedBuilder()
        .setColor(user.accentColor || "#5865F2")
        .setTitle(`🖼️ ${user.tag}'s Avatar`)
        .setDescription(`**User:** ${user}\n**ID:** ${user.id}`)
        .setImage(globalAvatarURL)
        .addFields({
          name: "🔗 Global Avatar Downloads",
          value: `[PNG](${globalPNG}) • [JPG](${globalJPG}) • [WEBP](${globalWEBP}) • [Auto](${globalAvatarURL})`,
          inline: false,
        });

      // Check if user is in the guild and has a server-specific avatar
      const member = message.guild.members.cache.get(user.id);
      if (member && member.avatar) {
        const serverAvatarURL = member.displayAvatarURL({
          dynamic: true,
          size: 4096,
        });
        const serverPNG = member.displayAvatarURL({
          extension: "png",
          size: 4096,
        });
        const serverJPG = member.displayAvatarURL({
          extension: "jpg",
          size: 4096,
        });
        const serverWEBP = member.displayAvatarURL({
          extension: "webp",
          size: 4096,
        });

        embed.addFields({
          name: "🏠 Server Avatar Downloads",
          value: `[PNG](${serverPNG}) • [JPG](${serverJPG}) • [WEBP](${serverWEBP}) • [Auto](${serverAvatarURL})`,
          inline: false,
        });

        // Add a thumbnail showing the server avatar if different
        embed.setThumbnail(serverAvatarURL);
      }

      embed
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Avatar command error:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff6b6b")
        .setTitle("❌ Error")
        .setDescription(
          "An error occurred while fetching the avatar. The user might not exist or their profile is not accessible."
        )
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  },
};
