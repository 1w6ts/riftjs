const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "kick",
  description: "Kick a user from the server with an optional reason",
  aliases: ["k", "boot"],
  async execute(message, args, client) {
    if (!message.member.permissions.has("KickMembers")) {
      return message.reply(
        "❌ You need the **Kick Members** permission to use this command!"
      );
    }

    if (!message.guild.members.me.permissions.has("KickMembers")) {
      return message.reply(
        "❌ I need the **Kick Members** permission to kick users!"
      );
    }

    if (!args[0]) {
      return message.reply(
        "❌ Please mention a user or provide their ID!\nExample: `.kick @user being disruptive`"
      );
    }

    let target;
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

    const targetMember = message.guild.members.cache.get(target.id);

    if (!targetMember) {
      return message.reply("❌ That user is not in this server!");
    }

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot kick yourself!");
    }

    if (target.id === client.user.id) {
      return message.reply("❌ I cannot kick myself!");
    }

    if (
      targetMember.roles.highest.position >=
      message.member.roles.highest.position
    ) {
      return message.reply(
        "❌ You cannot kick someone with equal or higher roles than you!"
      );
    }

    if (
      targetMember.roles.highest.position >=
      message.guild.members.me.roles.highest.position
    ) {
      return message.reply(
        "❌ I cannot kick someone with equal or higher roles than me!"
      );
    }

    if (!targetMember.kickable) {
      return message.reply(
        "❌ I cannot kick this user! They might have higher permissions."
      );
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("#ff9900")
          .setTitle("👢 You have been kicked")
          .setDescription(`You have been kicked from **${message.guild.name}**`)
          .addFields(
            { name: "Reason", value: reason, inline: false },
            { name: "Kicked by", value: message.author.tag, inline: true }
          )
          .setTimestamp();

        await target.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`Could not send DM to ${target.tag}`);
      }

      await targetMember.kick(`${reason} | Kicked by: ${message.author.tag}`);

      const successEmbed = new EmbedBuilder()
        .setColor("#ff9900")
        .setTitle("👢 User Kicked")
        .setDescription(`Successfully kicked **${target.tag}**`)
        .addFields(
          { name: "User ID", value: target.id, inline: true },
          { name: "Reason", value: reason, inline: false },
          { name: "Kicked by", value: message.author.tag, inline: true }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

      await message.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Kick command error:", error);
      await message.reply(
        "❌ An error occurred while trying to kick this user!"
      );
    }
  },
};
