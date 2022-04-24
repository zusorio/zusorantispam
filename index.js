import "dotenv/config"
import {WebhookClient, Client, Intents, MessageEmbed} from "discord.js";
import config from "./config.json";

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const recentMessages = [];

client.once('ready', () => {
  console.log('[zusorantispam] Ready!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  recentMessages.unshift(message);
  recentMessages.splice(100);


  const similarMessageCount =
    new Set(recentMessages
      .filter(recentMessage => recentMessage.author.id === message.author.id && recentMessage.content === message.content)
      .map(recentMessage => recentMessage.channel.id)).size;
  const containsUrl = message.content.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/)
  console.log(`[zusorantispam] ${message.id} similar message count: ${similarMessageCount} | Contains URL: ${containsUrl}`);

  if (similarMessageCount >= 4 && containsUrl) {
    const webhookClient = new WebhookClient({ url: config[message.guild.id] });


    const embed = new MessageEmbed()
      .setColor('#000000')
      .setTitle(`Automatically banned ${message.author.username}#${message.author.discriminator} (${message.author.id})`)
      .setDescription(message.content)
      .setTimestamp()
      .setFooter({ text: 'Zusor Antispam', iconURL: 'https://cdn.discordapp.com/attachments/686599248959242289/967146232491413514/black.png' });


    await webhookClient.send({embeds: [embed]});
    try {
      await message.member.ban({reason: 'Automatic Spam Ban', days: 1});
    } catch (e) {
      console.log(e);
      await webhookClient.send("I don't have the permission to ban this user\n```" + e + "```");
    }

  }
});

// Login to Discord with your client's token
await client.login(process.env.DISCORD_TOKEN);
