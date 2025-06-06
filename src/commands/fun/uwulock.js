const { EmbedBuilder } = require("discord.js");

const uwulockedUsers = new Map();
const userWebhooks = new Map();

module.exports = {
  name: "uwulock",
  description: "Toggle uwulock for a user",
  aliases: ["uwu"],
  async execute(message, args, client) {
    const guildId = message.guild.id;

    if (!uwulockedUsers.has(guildId)) {
      uwulockedUsers.set(guildId, new Set());
    }

    if (message.mentions.users.size > 0) {
      const targetUser = message.mentions.users.first();
      const guildUwulockedUsers = uwulockedUsers.get(guildId);

      if (targetUser.id === message.author.id) {
        return message.reply("❌ You can't uwulock yourself, silly!");
      }

      if (targetUser.bot) {
        return message.reply("❌ Can't uwulock bots!");
      }

      if (guildUwulockedUsers.has(targetUser.id)) {
        guildUwulockedUsers.delete(targetUser.id);
        await cleanupUserWebhooks(targetUser.id, message.guild);

        const embed = new EmbedBuilder()
          .setColor("#00ff00")
          .setTitle("💜 UwU-Lock Disabled")
          .setDescription(
            `**${targetUser.tag}** has been fweed fwom the uwu pwison! 🔓\n*All their uwu webhooks have been deleted.*`
          )
          .setThumbnail(targetUser.displayAvatarURL())
          .setFooter({
            text: `Disabled by ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL(),
          })
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      guildUwulockedUsers.add(targetUser.id);

      const embed = new EmbedBuilder()
        .setColor("#ff69b4")
        .setTitle("💜 UwU-Lock Enabled")
        .setDescription(
          `**${targetUser.tag}** has been sentenced to the uwu pwison! 🔒\n*All their messages will be uwufied.*`
        )
        .setThumbnail(targetUser.displayAvatarURL())
        .setFooter({
          text: `Enabled by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    return message.reply(`💜 **UwU-Lock Command**
Lock someone in uwu prison! Their messages will be uwufied.

**Usage:** \`.uwulock @user\`
**Example:** \`.uwulock @BadUser\`

*Use the command again to disable uwulock.*`);
  },
};

function uwufyText(text) {
  let uwufied = text
    .replace(/r/g, "w")
    .replace(/R/g, "W")
    .replace(/l/g, "w")
    .replace(/L/g, "W")
    .replace(/n([aeiou])/g, "ny$1")
    .replace(/N([aeiou])/g, "Ny$1")
    .replace(/N([AEIOU])/g, "NY$1")
    .replace(/ove/g, "uv")
    .replace(/OVE/g, "UV")
    .replace(/th/g, "d")
    .replace(/TH/g, "D")
    .replace(/Th/g, "D")
    .replace(/([bcdfghjklmnpqrstvwxyz])/gi, (match) => {
      return Math.random() < 0.1 ? `${match}-${match}` : match;
    });

  const uwuExpressions = [" UwU", " OwO", " >w<", " ^w^", " :3", " >:3"];
  if (Math.random() < 0.7) {
    uwufied +=
      uwuExpressions[Math.floor(Math.random() * uwuExpressions.length)];
  }

  return uwufied;
}

async function getUserWebhook(channel, user) {
  if (!userWebhooks.has(channel.id)) {
    userWebhooks.set(channel.id, new Map());
  }

  const channelWebhooks = userWebhooks.get(channel.id);

  if (channelWebhooks.has(user.id)) {
    return channelWebhooks.get(user.id);
  }

  const webhook = await channel.createWebhook({
    name: `${user.username}'s UwU Webhook`,
    avatar: user.displayAvatarURL(),
  });

  channelWebhooks.set(user.id, webhook);
  return webhook;
}

async function cleanupUserWebhooks(userId, guild) {
  try {
    const cleanupPromises = [];

    for (const [channelId, webhookMap] of userWebhooks.entries()) {
      if (webhookMap.has(userId)) {
        const webhook = webhookMap.get(userId);
        cleanupPromises.push(
          webhook.delete("User unuwulocked").catch((err) => {
            console.log(
              `Failed to delete webhook in channel ${channelId}:`,
              err.message
            );
          })
        );
        webhookMap.delete(userId);
      }
    }

    await Promise.all(cleanupPromises);
    console.log(`Cleaned up webhooks for user ${userId}`);
  } catch (error) {
    console.error("Error cleaning up user webhooks:", error);
  }
}

module.exports.uwulockedUsers = uwulockedUsers;
module.exports.uwufyText = uwufyText;
module.exports.getUserWebhook = getUserWebhook;
module.exports.cleanupUserWebhooks = cleanupUserWebhooks;
