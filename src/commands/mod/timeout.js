const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "timeout",
  description: "Timeout a user for a specified duration",
  aliases: ["mute", "to"],
  async execute(message, args, client) {
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply(
        "❌ You need the **Timeout Members** permission to use this command!"
      );
    }

    if (!message.guild.members.me.permissions.has("ModerateMembers")) {
      return message.reply(
        "❌ I need the **Timeout Members** permission to timeout users!"
      );
    }

    if (!args[0]) {
      return message.reply(`⏰ **Timeout Command Usage**
\`.timeout @user <duration> [reason]\`
\`.timeout @user 10m Spamming\`
\`.timeout @user 1h Being disruptive\`

**Duration formats:**
• \`10s\` = 10 seconds
• \`5m\` = 5 minutes  
• \`2h\` = 2 hours
• \`1d\` = 1 day
• \`1w\` = 1 week

**Maximum:** 28 days`);
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
      return message.reply("❌ You cannot timeout yourself!");
    }

    if (target.id === client.user.id) {
      return message.reply("❌ I cannot timeout myself!");
    }

    if (
      targetMember.roles.highest.position >=
      message.member.roles.highest.position
    ) {
      return message.reply(
        "❌ You cannot timeout someone with equal or higher roles than you!"
      );
    }

    if (
      targetMember.roles.highest.position >=
      message.guild.members.me.roles.highest.position
    ) {
      return message.reply(
        "❌ I cannot timeout someone with equal or higher roles than me!"
      );
    }

    if (!targetMember.moderatable) {
      return message.reply(
        "❌ I cannot timeout this user! They might have higher permissions."
      );
    }

    if (
      targetMember.communicationDisabledUntil &&
      targetMember.communicationDisabledUntil > new Date()
    ) {
      return message.reply("❌ This user is already timed out!");
    }

    const durationArg = args[1];
    if (!durationArg) {
      return message.reply(
        "❌ Please provide a duration!\nExample: `.timeout @user 10m Reason`"
      );
    }

    const duration = parseDuration(durationArg);
    if (!duration) {
      return message.reply(
        "❌ Invalid duration format!\nUse: `10s`, `5m`, `2h`, `1d`, `1w` (max 28 days)"
      );
    }

    if (duration > 28 * 24 * 60 * 60 * 1000) {
      return message.reply("❌ Maximum timeout duration is 28 days!");
    }

    if (duration < 5000) {
      return message.reply("❌ Minimum timeout duration is 5 seconds!");
    }

    const reason = args.slice(2).join(" ") || "No reason provided";

    try {
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("#ff9900")
          .setTitle("⏰ You have been timed out")
          .setDescription(
            `You have been timed out in **${message.guild.name}**`
          )
          .addFields(
            { name: "Duration", value: formatDuration(duration), inline: true },
            { name: "Reason", value: reason, inline: false },
            { name: "Timed out by", value: message.author.tag, inline: true }
          )
          .setTimestamp();

        await target.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`Could not send DM to ${target.tag}`);
      }

      await targetMember.timeout(
        duration,
        `${reason} | Timed out by: ${message.author.tag}`
      );

      const successEmbed = new EmbedBuilder()
        .setColor("#ff9900")
        .setTitle("⏰ User Timed Out")
        .setDescription(`Successfully timed out **${target.tag}**`)
        .addFields(
          { name: "User ID", value: target.id, inline: true },
          { name: "Duration", value: formatDuration(duration), inline: true },
          {
            name: "Expires",
            value: `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`,
            inline: true,
          },
          { name: "Reason", value: reason, inline: false },
          { name: "Timed out by", value: message.author.tag, inline: true }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

      await message.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Timeout command error:", error);
      await message.reply(
        "❌ An error occurred while trying to timeout this user!"
      );
    }
  },
};

function parseDuration(duration) {
  const regex = /^(\d+)([smhdw])$/i;
  const match = duration.match(regex);

  if (!match) return null;

  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks > 0) return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
}
