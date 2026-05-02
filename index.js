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
const xpData = new Map(); // XP'leri geçici olarak tutar (Bot kapanınca sıfırlanır)

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} IzaKaya'da göreve başladı!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --- 🌸 XP SİSTEMİ ---
    let userXP = xpData.get(message.author.id) || 0;
    userXP += Math.floor(Math.random() * 5) + 5; 
    xpData.set(message.author.id, userXP);
    if (userXP % 150 === 0) { // Her 150 XP'de bir tebrik eder
        message.reply("🏮 **Omedetou!** Ruhun güçleniyor, IzaKaya'da saygınlığın arttı desu! ✨");
    }

    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- 🏮 KURALLAR & IZAKAYA ---
    if (command === "izakaya" || command === "kurallar") {
        const embed = new EmbedBuilder()
            .setTitle("🌸 IzaKaya'nın Kadim Kanunları")
            .setDescription("Burası sadece bir mekan değil, bir aile ocağıdır senpai!")
            .addFields(
                { name: '🏮 Sessiz Fısıltı', value: 'Spam yapmak ruhları huzursuz eder.', inline: true },
                { name: '🎎 Onur Kodu', value: 'Saygısızlık yapan samuray kapının önüne konur.', inline: true },
                { name: '🍵 Çay Seremonisi', value: 'Herkesle barış içinde sohbet et desu!', inline: true }
            )
            .setColor("#ffb7c5")
            .setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // --- 🎫 TICKET KUR (KESİN ÇÖZÜM) ---
    if (command === "ticket-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const ticketEmbed = new EmbedBuilder()
            .setTitle("🏮 IzaKaya İşlem Odası")
            .setDescription("Bir sorun mu var veya ekibe mi katılmak istiyorsun?\nAşağıdaki butona basarak özel oda açabilirsin!")
            .setColor("#ffb7c5");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('izakaya_ticket')
                .setLabel('Destek Talebi Aç')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🧧')
        );

        await message.channel.send({ embeds: [ticketEmbed], components: [row] });
        return message.delete().catch(() => {});
    }

    // --- 🧹 TEMİZLE ---
    if (command === "temizle") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const miktar = parseInt(args[0]) || 10;
        await message.channel.bulkDelete(miktar, true);
        message.channel.send(`✨ **${miktar}** mesaj süpürüldü!`).then(m => setTimeout(() => m.delete(), 3000));
    }
});

// --- 🖱️ BUTON ETKİLEŞİMLERİ ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'izakaya_ticket') {
        try {
            const channel = await interaction.guild.channels.create({
                name: `🏮-${interaction.user.username}`,
                type: 0, // Metin kanalı
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
                ],
            });

            const welcome = new EmbedBuilder()
                .setTitle("🏮 Hoş Geldin Senpai!")
                .setDescription("Yetkililerimiz birazdan seninle ilgilenecek. Beklerken sakin ol desu! 🍵")
                .setColor("#ffb7c5");

            const closeBtn = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('kapat').setLabel('Odayı Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await channel.send({ content: `${interaction.user} | @everyone`, embeds: [welcome], components: [closeBtn] });
            await interaction.reply({ content: `✅ Odan açıldı kanka: ${channel}`, ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Oda oluşturulamadı! Botun 'Kanalları Yönet' yetkisi eksik.", ephemeral: true });
        }
    }

    if (interaction.customId === 'kapat') {
        await interaction.reply("Bu oda 5 saniye içinde yok edilecek... Sayonara! 👋");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

client.login(process.env.TOKEN);
