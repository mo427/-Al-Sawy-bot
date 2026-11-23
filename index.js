
const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  throw new Error("Missing DISCORD_TOKEN or CLIENT_ID");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("اختبار تشغيل بوت WOS")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

client.once(Events.ClientReady, readyClient => {
  console.log(`WOS Bot is online as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("WOS Bot is working! 🛡️");
  }
});

async function startBot() {
  await rest.put(
    Routes.applicationCommands(clientId),
    { body: commands }
  );

  console.log("Slash commands registered successfully.");

  await client.login(token);
}

startBot().catch(error => {
  console.error("Bot startup failed:", error);
});