const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('IzaKaya Shogun Aktif! 🏮'));
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

// Deprecation uyarısını çözen yeni hazır olma olayı
client.on('ready', () => {
    console.log(`✅ ${client.user.tag} IzaKaya kapılarını açtı!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🎫 TICKET KUR KOMUTU
    if (command === "ticket-kur") {
        // Yetki Kontrolü
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("Senpai, bu komutu sadece Shogunlar (Adminler) kullanabilir! ❌");
        }

        try {
            const ticketEmbed = new EmbedBuilder()
                .setTitle("🏮 IzaKaya Destek Merkezi")
                .setDescription("Bir sorun mu var? Aşağıdaki butonlara basarak odayı açabilirsin.")
                .setColor("#ffb7c5")
                .setFooter({ text: "IzaKaya Yönetimi" });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('t_destek').setLabel('Destek Al').setStyle(ButtonStyle.Primary).setEmoji('🧧'),
                new ButtonBuilder().setCustomId('t_alim').setLabel('Köy Alımı').setStyle(ButtonStyle.Success).setEmoji('🎎')
            );

            await message.channel.send({ embeds: [ticketEmbed], components: [row] });
            await message.delete(); // Komut mesajını siler
        } catch (error) {
            console.error("HATA:", error);
            message.channel.send("❌ Mesaj gönderilemedi! Botun bu kanalda 'Mesaj Gönder' ve 'Bağlantı Yerleştir' yetkisi olduğundan emin ol.");
        }
    }
});

// BUTONLARIN ÇALIŞMASINI SAĞLAYAN KISIM
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('t_')) {
        try {
            const channel = await interaction.guild.channels.create({
                name: `🏮-${interaction.user.username}`,
                type: 0,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
                ],
            });

            const embed = new EmbedBuilder()
                .setTitle("🌸 Hoş Geldin Senpai!")
                .setDescription("Yetkililer birazdan burada olacak desu. Beklerken çayını iç! 🍵")
                .setColor("#ffb7c5");

            const closeBtn = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('kapat').setLabel('Mühürle (Kapat)').setStyle(ButtonStyle.Danger)
            );

            await channel.send({ content: `${interaction.user} | @everyone`, embeds: [embed], components: [closeBtn] });
            await interaction.reply({ content: `✅ Odan açıldı: ${channel}`, ephemeral: true });
        } catch (e) {
            await interaction.reply({ content: "❌ Oda oluşturulamadı! Botun 'Kanalları Yönet' yetkisi eksik.", ephemeral: true });
        }
    }

    if (interaction.customId === 'kapat') {
        await interaction.reply("Oda 5 saniye içinde kapatılıyor... Sayonara! 👋");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

client.login(process.env.TOKEN);
