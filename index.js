// ... (Önceki kodların üst kısmı aynı kalsın)

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // TICKET KURULUM KOMUTU
    if (command === "ticket-kur") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const embed = new EmbedBuilder()
            .setTitle("🏮 IZAKAYA DESTEK MERKEZİ")
            .setDescription("Bir sorun mu var Senpai? Ya da aramıza mı katılmak istiyorsun?\n\nAşağıdaki butonlardan sana uygun olanı seç, senin için özel bir oda açalım!")
            .setColor("#ffb7c5")
            .setFooter({ text: "IzaKaya Yönetimi" });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('t_alim').setLabel('Shinobi Alımı').setStyle(ButtonStyle.Success).setEmoji('🎎'),
            new ButtonBuilder().setCustomId('t_oneri').setLabel('Öneri / Şikayet').setStyle(ButtonStyle.Primary).setEmoji('📜'),
            new ButtonBuilder().setCustomId('t_destek').setLabel('Genel Destek').setStyle(ButtonStyle.Secondary).setEmoji('🍵')
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});

// TICKET BUTON ETKİLEŞİMLERİ
client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    if (i.customId.startsWith('t_')) {
        const kanalAdı = `${i.customId}-${i.user.username}`;
        
        // Kanalı oluştur
        const c = await i.guild.channels.create({
            name: kanalAdı,
            type: 0, // Metin kanalı
            permissionOverwrites: [
                { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, // Herkese kapat
                { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, // Kullanıcıya aç
                // Buraya yetkili rolünün ID'sini de ekleyebilirsin
            ],
        });

        const embed = new EmbedBuilder()
            .setTitle("🏮 Hoş Geldin Senpai!")
            .setDescription(`Merhaba ${i.user}, seninle ilgilenecek bir yetkili birazdan burada olacak desu! ✨\n\n**Konu:** ${i.component.label}`)
            .setColor("#ffb7c5");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Odayı Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await c.send({ embeds: [embed], components: [row] });
        await i.reply({ content: `✅ Senin için bir oda açtım: ${c}`, ephemeral: true });
    }

    if (i.customId === 'ticket_kapat') {
        await i.reply("Bu oda 5 saniye içinde yok edilecek desu... Sayonara! 👋");
        setTimeout(() => i.channel.delete(), 5000);
    }
});
