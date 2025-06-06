const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");
const path = require("path");

config();

const botConfig = require("./config/rift.json");

const rift = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

rift.commands = new Collection();

let mockCommand;
try {
  mockCommand = require("./commands/fun/mock.js");
} catch (error) {
  console.log("Mock command not found, auto-mocking disabled");
}

let uwulockCommand;
try {
  uwulockCommand = require("./commands/fun/uwulock.js");
} catch (error) {
  console.log("UwUlock command not found, auto-uwulocking disabled");
}

function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");

  if (!fs.existsSync(commandsPath)) {
    console.log("Commands folder not found. Creating it...");
    return;
  }

  const commandFolders = fs
    .readdirSync(commandsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);

      if ("name" in command && "execute" in command) {
        rift.commands.set(command.name, command);
        console.log(`Loaded command: ${command.name} from ${folder}/${file}`);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`
        );
      }
    }
  }
}

rift.once(Events.ClientReady, (readyClient) => {
  console.log(`Rift is online as ${readyClient.user.tag}`);
  console.log(`Using prefix: ${botConfig.prefix}`);
  loadCommands();
  console.log(`Loaded ${rift.commands.size} commands total.`);
});

rift.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (uwulockCommand && uwulockCommand.uwulockedUsers && message.guild) {
    const guildUwulockedUsers = uwulockCommand.uwulockedUsers.get(
      message.guild.id
    );

    if (guildUwulockedUsers && guildUwulockedUsers.has(message.author.id)) {
      if (
        !message.content.startsWith(botConfig.prefix) &&
        message.content.trim()
      ) {
        try {
          const webhook = await uwulockCommand.getUserWebhook(
            message.channel,
            message.author
          );

          const uwufiedText = uwulockCommand.uwufyText(message.content);

          const member = message.guild.members.cache.get(message.author.id);
          const displayName = member
            ? member.displayName
            : message.author.username;

          const deletePromise = message.delete().catch((err) => {
            console.log("Failed to delete uwulocked message:", err.message);
          });

          const sendPromise = webhook
            .send({
              content: uwufiedText,
              username: displayName,
              avatarURL: message.author.displayAvatarURL(),
            })
            .catch((err) => {
              console.error("Failed to send uwulocked message:", err.message);
            });

          await Promise.all([deletePromise, sendPromise]);

          return;
        } catch (error) {
          console.error("Error processing uwulock:", error);
          try {
            await message.delete();
          } catch (deleteError) {
            console.error(
              "Failed to delete message after uwulock error:",
              deleteError
            );
          }
        }
      }
    }
  }

  if (mockCommand && mockCommand.mockedUsers && message.guild) {
    const guildMockedUsers = mockCommand.mockedUsers.get(message.guild.id);

    if (guildMockedUsers && guildMockedUsers.has(message.author.id)) {
      if (
        !message.content.startsWith(botConfig.prefix) &&
        message.content.trim()
      ) {
        const mockedText = mockCommand.convertToMockingCase(message.content);

        try {
          await message.reply(`🧽 ${mockedText}`);
        } catch (error) {
          console.error("Error sending auto-mock:", error);
        }
      }
    }
  }

  if (!message.content.startsWith(botConfig.prefix)) return;

  const args = message.content
    .slice(botConfig.prefix.length)
    .trim()
    .split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    rift.commands.get(commandName) ||
    rift.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  try {
    await command.execute(message, args, rift);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    await message
      .reply("There was an error executing that command!")
      .catch(console.error);
  }
});

rift.login(process.env.DISCORD_TOKEN);
