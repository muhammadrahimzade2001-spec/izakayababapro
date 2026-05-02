const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
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
const xpData = new Map(); // Mesaj başına XP için basit hafıza

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} IzaKaya'nın kapılarını Shogun olarak açtı!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --- XP SİSTEMİ ---
    let userXP = xpData.get(message.author.id) || 0;
    userXP += Math.floor(Math.random() * 5) + 5; // Her mesaj 5-10 arası XP
    xpData.set(message.author.id, userXP);

    // Seviye atlama bildirimi (Örn: her 100 XP'de bir)
    if (userXP % 100 <= 8 && userXP > 90) {
        message.reply(`🏮 **Omedetou!** (Tebrikler) Ruhun güçleniyor, seviyen arttı desu! ✨`);
    }

    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🏮 !IZAKAYA KOMUTU (Bilinmeyen Kurallar)
    if (command === "izakaya" || command === "kurallar") {
        const embed = new EmbedBuilder()
            .setTitle("🌸 IzaKaya'nın Kadim Kanunları")
            .setDescription("Burası sadece bir meyhane değil, ruhların dinlendiği bir tapınaktır. İşte kimsenin yüksek sesle söylemediği kurallar:")
            .addFields(
                { name: '🏮 Sessiz Fısıltı', value: 'Gece yarısından sonra büyük harf kullanmak ruhları rahatsız eder (Spam yasak).', inline: false },
                { name: '🎎 Onur Kodu', value: 'Bir Shinobi, diğerinin kılıcına (onuruna) dokunmaz. Hakaret yasaktır.', inline: false },
                { name: '🍵 Çay Seremonisi', value: 'Odalarımızda (Kanallarda) huzuru bozanlar, kendilerini kapının önünde bulur.', inline: false },
                { name: '⛩️ Gizemli Kural #42', value: 'Kurucunun en sevdiği animeyi bilen, özel bir rol kazanabilir... (Kimse bilmiyor).', inline: false }
            )
            .setColor("#ffb7c5")
            .setFooter({ text: "Saygılı ol ki, saygı göresin senpai." });
        return message.channel.send({ embeds: [embed] });
    }

    // 🎫 TICKET KUR (TAM ÇÖZÜM)
    if (command === "ticket-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const ticketEmbed = new EmbedBuilder()
            .setTitle("🏮 IzaKaya Destek Odası")
            .setDescription("Bir sorun mu var yoksa aramıza mı katılmak istiyorsun?\n\nAşağıdaki parşömenlere (butonlara) tıklayarak yetkililere haber verebilirsin.")
            .setColor("#2f3136")
            .setThumbnail(client.user.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('t_destek').setLabel('Destek Talebi').setStyle(ButtonStyle.Primary).setEmoji('🧧'),
            new ButtonBuilder().setCustomId('t_alim').setLabel('Köy Alımı').setStyle(ButtonStyle.Success).setEmoji('🎎')
        );

        await message.channel.send({ embeds: [ticketEmbed], components: [row] });
        return message.delete();
    }
});

// --- INTERACTION (TICKET ÇALIŞTIRICI) ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('t_')) {
        const type = interaction.customId === 't_alim' ? '🏮-basvuru-' : '🏮-destek-';
        
        try {
            const channel = await interaction.guild.channels.create({
                name: `${type}${interaction.user.username}`,
                type: 0,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                ],
            });

            const welcome = new EmbedBuilder()
                .setTitle("🏮 İşlem Odası Açıldı")
                .setDescription(`Merhaba ${interaction.user}, yetkililerimiz seninle ilgilenecektir. Beklerken bir çay iç desu! 🍵`)
                .setColor("#ffb7c5");

            const closeBtn = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('kapat').setLabel('Odayı Mühürle (Kapat)').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );

            await channel.send({ content: `@everyone`, embeds: [welcome], components: [closeBtn] });
            await interaction.reply({ content: `✅ Odan şurada açıldı Senpai: ${channel}`, ephemeral: true });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: "Bir hata oluştu kanka, yetkilerimi kontrol et!", ephemeral: true });
        }
    }

    if (interaction.customId === 'kapat') {
        await interaction.reply("Bu oda 5 saniye içinde duman olup uçacak... 👋");
        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

client.login(process.env.TOKEN);
