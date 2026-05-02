const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('IzaKaya Bot Aktif! 🏮'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = "!";

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} IzaKaya kapılarını açtı!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // TICKET KURULUM
    if (command === "ticket-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.reply("Senpai, yetkin yok desu!");

        const embed = new EmbedBuilder()
            .setTitle("🏮 IZAKAYA DESTEK MERKEZİ")
            .setDescription("Aramıza katılmak mı istiyorsun yoksa bir sorun mu var?\n\nButonlara basarak seninle ilgilenecek yetkililere ulaşabilirsin! ✨")
            .setColor("#ffb7c5");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('t_alim').setLabel('Shinobi Alımı').setStyle(ButtonStyle.Success).setEmoji('🎎'),
            new ButtonBuilder().setCustomId('t_oneri').setLabel('Öneri/Şikayet').setStyle(ButtonStyle.Primary).setEmoji('📜')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }
});

// BUTON TIKLAMA İŞLEMCİSİ (Burası çalışmasını sağlar)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('t_')) {
        // Kanal oluşturma yetkisi kontrolü
        await interaction.guild.channels.create({
            name: `oda-${interaction.user.username}`,
            type: 0,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] }
            ]
        }).then(async (c) => {
            const embed = new EmbedBuilder()
                .setTitle("🌸 Hoş Geldin Senpai!")
                .setDescription("Yetkililerimiz birazdan seninle ilgilenecek. Lütfen sabırla bekle desu!")
                .setColor("#ffb7c5");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('kapat').setLabel('Odayı Kapat').setStyle(ButtonStyle.Danger)
            );

            await c.send({ content: `${interaction.user} | @everyone`, embeds: [embed], components: [row] });
            await interaction.reply({ content: `✅ Odan açıldı: ${c}`, ephemeral: true });
        });
    }

    if (interaction.customId === 'kapat') {
        await interaction.reply("Oda 5 saniye sonra kapatılıyor... Sayonara! 👋");
        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

client.login(process.env.TOKEN);
