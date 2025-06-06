const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ban",
  description: "Ban a user from the server with an optional reason",
  aliases: ["b", "hammer"],
  async execute(message, args, client) {
    if (!message.member.permissions.has("BanMembers")) {
      return message.reply(
        "❌ You need the **Ban Members** permission to use this command!"
      );
    }

    if (!message.guild.members.me.permissions.has("BanMembers")) {
      return message.reply(
        "❌ I need the **Ban Members** permission to ban users!"
      );
    }

    if (!args[0]) {
      return message.reply(
        "❌ Please mention a user or provide their ID!\nExample: `.ban @user spamming`"
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

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot ban yourself!");
    }

    if (target.id === client.user.id) {
      return message.reply("❌ I cannot ban myself!");
    }

    if (targetMember) {
      if (
        targetMember.roles.highest.position >=
        message.member.roles.highest.position
      ) {
        return message.reply(
          "❌ You cannot ban someone with equal or higher roles than you!"
        );
      }

      if (
        targetMember.roles.highest.position >=
        message.guild.members.me.roles.highest.position
      ) {
        return message.reply(
          "❌ I cannot ban someone with equal or higher roles than me!"
        );
      }

      if (!targetMember.bannable) {
        return message.reply(
          "❌ I cannot ban this user! They might have higher permissions."
        );
      }
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("🔨 You have been banned")
          .setDescription(`You have been banned from **${message.guild.name}**`)
          .addFields(
            { name: "Reason", value: reason, inline: false },
            { name: "Banned by", value: message.author.tag, inline: true }
          )
          .setTimestamp();

        await target.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`Could not send DM to ${target.tag}`);
      }

      await message.guild.members.ban(target, {
        reason: `${reason} | Banned by: ${message.author.tag}`,
        deleteMessageDays: 1,
      });

      const successEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("🔨 User Banned")
        .setDescription(`Successfully banned **${target.tag}**`)
        .addFields(
          { name: "User ID", value: target.id, inline: true },
          { name: "Reason", value: reason, inline: false },
          { name: "Banned by", value: message.author.tag, inline: true }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

      await message.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Ban command error:", error);
      await message.reply(
        "❌ An error occurred while trying to ban this user!"
      );
    }
  },
};
