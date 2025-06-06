const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "banner",
  description: "Display a user's Discord banner",
  aliases: ["userbanner", "profilebanner"],
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
      // Fetch the user with force to get the latest data including banner
      const user = await client.users.fetch(target.id, { force: true });

      if (!user.banner) {
        const embed = new EmbedBuilder()
          .setColor("#ff6b6b")
          .setTitle("🚫 No Banner Found")
          .setDescription(`**${user.tag}** doesn't have a banner set.`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
          .setFooter({
            text: "Users need Discord Nitro to set custom banners",
            iconURL: message.author.displayAvatarURL(),
          })
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      // Get banner URL in different formats
      const bannerURL = user.bannerURL({ dynamic: true, size: 4096 });
      const bannerPNG = user.bannerURL({ extension: "png", size: 4096 });
      const bannerJPG = user.bannerURL({ extension: "jpg", size: 4096 });
      const bannerWEBP = user.bannerURL({ extension: "webp", size: 4096 });

      const embed = new EmbedBuilder()
        .setColor(user.accentColor || "#5865F2")
        .setTitle(`🎨 ${user.tag}'s Banner`)
        .setDescription(`**User:** ${user}\n**ID:** ${user.id}`)
        .setImage(bannerURL)
        .addFields({
          name: "🔗 Download Links",
          value: `[PNG](${bannerPNG}) • [JPG](${bannerJPG}) • [WEBP](${bannerWEBP}) • [Auto](${bannerURL})`,
          inline: false,
        })
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Banner command error:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff6b6b")
        .setTitle("❌ Error")
        .setDescription(
          "An error occurred while fetching the banner. The user might not exist or their profile is not accessible."
        )
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  },
};
