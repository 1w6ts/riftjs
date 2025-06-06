const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "lovecalc",
  description: "Calculate love percentage between two people",
  aliases: ["lc"],
  async execute(message, args, client) {
    if (args.length < 2) {
      return message.reply(
        "💕 Please provide two names or mention two users!\nExample: `.lovecalc @user1 @user2` or `.lovecalc John Jane`"
      );
    }

    let person1, person2;

    const mentions = message.mentions.users;
    if (mentions.size >= 2) {
      const mentionArray = Array.from(mentions.values());
      person1 = mentionArray[0].username;
      person2 = mentionArray[1].username;
    } else if (mentions.size === 1) {
      person1 = mentions.first().username;
      person2 = args.find((arg) => !arg.startsWith("<@")) || args[1];
    } else {
      person1 = args[0];
      person2 = args.slice(1).join(" ");
    }

    const combined = (person1 + person2).toLowerCase().replace(/[^a-z]/g, "");
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const percentage = Math.abs(hash) % 101;

    let loveMessage, color, emoji;

    if (percentage >= 90) {
      loveMessage = "Perfect match! You're soulmates! 💕";
      color = "#ff1493";
      emoji = "💖";
    } else if (percentage >= 75) {
      loveMessage = "Great chemistry! Love is in the air! 💕";
      color = "#ff69b4";
      emoji = "💕";
    } else if (percentage >= 60) {
      loveMessage = "Good compatibility! There's potential here! 💗";
      color = "#ff7fbd";
      emoji = "💗";
    } else if (percentage >= 40) {
      loveMessage = "It could work with some effort! 💛";
      color = "#ffd700";
      emoji = "💛";
    } else if (percentage >= 25) {
      loveMessage = "Friendship might be better... 💙";
      color = "#87ceeb";
      emoji = "💙";
    } else {
      loveMessage = "Not meant to be... 💔";
      color = "#696969";
      emoji = "💔";
    }

    // Create love meter visual
    const filledHearts = Math.floor(percentage / 10);
    const emptyHearts = 10 - filledHearts;
    const loveMeter = "💖".repeat(filledHearts) + "🤍".repeat(emptyHearts);

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} Love Calculator ${emoji}`)
      .setDescription(`**${person1}** + **${person2}**`)
      .addFields(
        { name: "Love Percentage", value: `**${percentage}%**`, inline: true },
        { name: "Love Meter", value: loveMeter, inline: false },
        { name: "Result", value: loveMessage, inline: false }
      )
      .setFooter({
        text: "Love calculations are for fun only! 💕",
        iconURL: message.author.displayAvatarURL(),
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
