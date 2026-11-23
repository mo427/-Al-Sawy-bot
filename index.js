

const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

// Environment Variables
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
  throw new Error("Missing DISCORD_TOKEN or CLIENT_ID in environment variables.");
}

// Discord Client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("اختبار اتصال البوت"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("عرض أوامر الصاوي بوت"),

  new SlashCommandBuilder()
    .setName("hero")
    .setDescription("معلومات عن أبطال Whiteout Survival")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("اسم البطل")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("bear")
    .setDescription("إرشادات فعالية Bear Trap"),

  new SlashCommandBuilder()
    .setName("svs")
    .setDescription("إرشادات معركة SvS"),

  new SlashCommandBuilder()
    .setName("formation")
    .setDescription("مساعدة في تجهيز التشكيلات")
    .addStringOption(option =>
      option.setName("event")
        .setDescription("نوع الفعالية")
        .setRequired(true)
        .addChoices(
          { name: "Bear Trap", value: "bear" },
          { name: "Sunfire Castle", value: "sunfire" },
          { name: "Crazy Joe", value: "crazyjoe" }
        )
    )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

// Bot Ready
client.once(Events.ClientReady, readyClient => {
  console.log(`✅ Al-Sawy Bot Online: ${readyClient.user.tag}`);
});

// Interaction Handler
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const command = interaction.commandName;

    if (command === "ping") {
      return interaction.reply("🟢 الصاوي بوت شغال تمام!");
    }

    if (command === "help") {
      const embed = new EmbedBuilder()
        .setColor(0xD4AF37)
        .setTitle("🛡️ الصاوي بوت | مركز قيادة IKN")
        .setDescription(
          "**أوامر البوت:**\n\n" +
          "`/ping` اختبار التشغيل\n" +
          "`/hero` البحث عن بطل\n" +
          "`/bear` إرشادات Bear Trap\n" +
          "`/svs` إرشادات SvS\n" +
          "`/formation` تجهيز التشكيلات"
        )
        .setFooter({ text: "Al-Sawy Bot | Whiteout Survival" });

      return interaction.reply({ embeds: [embed] });
    }

    if (command === "hero") {
      const name = interaction.options.getString("name");

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(`🔎 البحث عن البطل: ${name}`)
            .setDescription(
              "تم استلام اسم البطل.\n\n" +
              "قاعدة بيانات الأبطال التفصيلية لم تُربط بعد.\n" +
              "لن نخترع مهارات أو أرقامًا غير مؤكدة."
            )
        ]
      });
    }

    if (command === "bear") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xE67E22)
            .setTitle("🐻 Bear Trap | مركز التحليل")
            .setDescription(
              "إرشادات عامة:\n\n" +
              "• استخدم أبطال Joiner المناسبين لمهارات التجمع.\n" +
              "• فرّق بين مهارات قائد التجمع ومهارات المنضمين.\n" +
              "• راجع عدد القوات وسعة المسيرة قبل الإرسال.\n" +
              "• لا تفترض أن كل المهارات تتراكم دون اختبار."
            )
        ]
      });
    }

    if (command === "svs") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xC0392B)
            .setTitle("⚔️ SvS | مركز قيادة المعركة")
            .setDescription(
              "قبل المشاركة:\n\n" +
              "• حدد هل أنت قائد Rally أم Joiner.\n" +
              "• اختر أبطال الهجوم أو الدفاع حسب المهمة.\n" +
              "• نسّق توقيت التجمعات مع أعضاء التحالف.\n" +
              "• لا تخلط بين أبطال القيادة وأبطال الانضمام."
            )
        ]
      });
    }

    if (command === "formation") {
      const event = interaction.options.getString("event");

      const eventNames = {
        bear: "Bear Trap",
        sunfire: "Sunfire Castle",
        crazyjoe: "Crazy Joe"
      };

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle(`📊 تجهيز التشكيلة: ${eventNames[event]}`)
            .setDescription(
              "لتجهيز تشكيلة دقيقة، نحتاج معرفة:\n\n" +
              "• مستويات القوات.\n" +
              "• عدد المشاة والرماة ورماة الرمح.\n" +
              "• هل أنت قائد أم Joiner.\n" +
              "• الأبطال المتاحون لديك."
            )
        ]
      });
    }

  } catch (error) {
    console.error("Command Error:", error);

    const reply = {
      content: "حدث خطأ أثناء تنفيذ الأمر. حاول مرة أخرى.",
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(console.error);
    } else {
      await interaction.reply(reply).catch(console.error);
    }
  }
});

// Register Commands and Start Bot
async function startBot() {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log("Slash commands registered successfully.");

    await client.login(token);

  } catch (error) {
    console.error("Bot startup failed:", error);
    process.exit(1);
  }
}

startBot();


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