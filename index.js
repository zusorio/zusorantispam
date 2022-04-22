import "dotenv/config"
import {WebhookClient, Client, Intents, MessageEmbed} from "discord.js";


const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_URL });

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
  console.log(similarMessageCount);
  const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  const containsUrl = regexp.test(message.content.toLowerCase());

  if (similarMessageCount >= 4 && containsUrl) {

    const embed = new MessageEmbed()
      .setColor('#000000')
      .setTitle(`Automatically banned ${message.author.username}#${message.author.discriminator} (${message.author.id})`)
      .setDescription(message.content)
      .setTimestamp()
      .setFooter({ text: 'Zusor Antispam', iconURL: 'https://cdn.discordapp.com/attachments/686599248959242289/967146232491413514/black.png' });


    await webhookClient.send({embeds: [embed]});
    // await message.member.ban({reason: 'Automatic Spam Ban', days: 1});

  }
});

// Login to Discord with your client's token
await client.login(process.env.DISCORD_TOKEN);
