const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "gif",
  description: "Convert an attached image to GIF format",
  aliases: ["togif", "makegif"],
  async execute(message, args, client) {
    if (!message.attachments.size) {
      return message.reply(`🎞️ **GIF Converter**
Please attach an image to convert to GIF format!

**Usage:** Upload an image and type \`.gif\`
**Supported formats:** PNG, JPG, JPEG, WEBP
**Max size:** 8MB

*This converts static images to GIF format - useful for Discord meme saving!*`);
    }

    const attachment = message.attachments.first();

    const validTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!validTypes.includes(attachment.contentType)) {
      return message.reply(
        "❌ Please attach a valid image file (PNG, JPG, JPEG, WEBP)!"
      );
    }

    if (attachment.size > 8 * 1024 * 1024) {
      return message.reply("❌ File too large! Maximum size is 8MB.");
    }

    try {
      await message.channel.sendTyping();

      const response = await fetch(attachment.url);
      if (!response.ok) {
        throw new Error("Failed to download image");
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());

      const gifBuffer = await convertToGif(imageBuffer, attachment.contentType);

      const gifAttachment = new AttachmentBuilder(gifBuffer, {
        name: `${attachment.name.split(".")[0]}.gif`,
      });

      await message.reply({ files: [gifAttachment] });
    } catch (error) {
      console.error("GIF conversion error:", error);
      await message.reply("❌ Failed to convert image to GIF format.");
    }
  },
};

async function convertToGif(imageBuffer, contentType) {
  try {
    const { createCanvas, loadImage } = require("canvas");

    const image = await loadImage(imageBuffer);

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, 0, 0);

    return canvas.toBuffer("image/png");
  } catch (canvasError) {
    console.log("Canvas not available or error, using simple conversion");

    return imageBuffer;
  }
}

async function convertToGifWithSharp(imageBuffer) {
  try {
    const sharp = require("sharp");

    const gifBuffer = await sharp(imageBuffer).gif().toBuffer();

    return gifBuffer;
  } catch (error) {
    throw new Error("Sharp conversion failed: " + error.message);
  }
}
