const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('IzaKaya Shogun 7/24 Aktif! 🏮'));
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
const xpData = new Map();

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} IzaKaya'da göreve başladı!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --- 🌸 XP SİSTEMİ ---
    let userXP = xpData.get(message.author.id) || 0;
    userXP += Math.floor(Math.random() * 5) + 5; 
    xpData.set(message.author.id, userXP);
    if (userXP === 100) { 
        message.reply("🏮 **Omedetou!** Seviye atladın senpai! ✨");
    }

    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 🎫 YENİ TICKET KOMUTU: !talep-oluştur ---
    if (command === "talep-oluştur" || command === "destek-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("Bu parşömeni sadece Shogunlar açabilir! ❌");
        }

        const embed = new EmbedBuilder()
            .setTitle("🏮 IzaKaya Yardım Talebi")
            .setDescription("Bir maruzatın mı var senpai? Aşağıdaki mühre basarak özel bir görüşme odası açabilirsin.")
            .setColor("#ffb7c5")
            .setFooter({ text: "IzaKaya Güvenlik Sistemi" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('izakaya_ticket')
                .setLabel('Talep Aç')
                .setStyle(ButtonStyle.Danger) // Daha dikkat çekici kırmızı buton
                .setEmoji('🧧')
        );

        try {
            await message.channel.send({ embeds: [embed], components: [row] });
            await message.delete();
        } catch (err) {
            console.log("Mesaj gönderilemedi, yetkileri kontrol et kanka!");
        }
    }

    // --- 🏮 DİĞER KOMUTLAR ---
    if (command === "izakaya") {
        message.channel.send("🏮 **IzaKaya**, samimiyetin ve animenin buluştuğu noktadır. Kurallar için **!kurallar** yazabilirsin desu!");
    }

    if (command === "kurallar") {
        const ruleEmbed = new EmbedBuilder()
            .setTitle("📜 Köy Kanunları")
            .setDescription("1. Saygı esastır.\n2. Spam ruhu kirletir.\n3. Eğlenmek zorunludur! ✨")
            .setColor("#ffb7c5");
        message.channel.send({ embeds: [ruleEmbed] });
    }
});

// --- 🖱️ ETKİLEŞİMLER ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'izakaya_ticket') {
        // Kanal oluşturma
        try {
            const ticketChannel = await interaction.guild.channels.create({
                name: `talep-${interaction.user.username}`,
                type: 0,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
                ],
            });

            const welcome = new EmbedBuilder()
                .setTitle("🌸 Özel Oda Hazır")
                .setDescription(`Hoş geldin ${interaction.user}. Sorununu buraya yazabilirsin. Kapatmak için aşağıdaki butona bas.`)
                .setColor("#ffb7c5");

            const close = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('kapat').setLabel('Odayı Kapat').setStyle(ButtonStyle.Secondary)
            );

            await ticketChannel.send({ embeds: [welcome], components: [close] });
            await interaction.reply({ content: `✅ Kanalın açıldı: ${ticketChannel}`, ephemeral: true });

        } catch (e) {
            console.error(e);
            await interaction.reply({ content: "❌ Oda açılamadı, yetkim yok!", ephemeral: true });
        }
    }

    if (interaction.customId === 'kapat') {
        await interaction.reply("Oda mühürleniyor... 👋");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
