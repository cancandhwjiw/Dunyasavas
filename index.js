co            
    const { Client, GatewayIntentBits, ChannelType, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Bot hazır olduğunda konsola log atar
client.on('ready', () => {
    console.log(`🚀 Sunucu Kurucu Bot Aktif: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('.')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (cmd === 'kur') {
        // Yetki kontrolü (Yönetici yetkisi gerekir)
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın!');
        }

        const beklemeEmbed = new EmbedBuilder()
            .setTitle('🏗️ Sunucu Kurulumu Başladı')
            .setDescription('Kategoriler ve kanallar sırasıyla oluşturuluyor. Lütfen işlem bitene kadar bekleyin...')
            .setColor(0xf1c40f);

        const bildirimMesaj = await message.channel.send({ embeds: [beklemeEmbed] });

        // Kurulacak tüm şema yapısı
        const sunucuYapisi = [
            {
                kategori: "Ultra League",
                kanallar: ["🎪・takımlar", "・Kayıt odasi"]
            },
            {
                kategori: "Bilgilendirme",
                kanallar: [
                    "📣・duyuru", "📦・sistemler", "📚・kurallar", "💎・anılar", 
                    "🎭・rol-bilgi", "🔮・rol-alma", "🚀・booster", "📈・seviye", 
                    "✨・yetkili-alım", "✨・spiker-alım", "🎙️・spiker-sonuçları"
                ]
            },
            {
                kategori: "Diğer Kanallar",
                kanallar: ["🔔・güncelleme", "🚀・booster-bilgi", "🛒・Market", "🗳️・oy ver", "🎉event", "🎊 çekiliş"]
            },
            {
                kategori: "Genel",
                kanallar: ["・Sohnet", "Medya", "🤖・medya", "💡・istek-şikayet"]
            },
            {
                kategori: "Eğlence Kanalları",
                kanallar: ["💵・owo", "🏆・turnuva", "💫・bil-kazan"]
            },
            {
                kategori: "Antrenman",
                kanallar: ["🎽・antrenman", "🥅・penaltı-antrenman", "🎽・antrenman-bilgi"]
            },
            {
                kategori: "7. Değer İsteme & Bütçe İsteme",
                kanallar: ["📊・değer-bütçe-kasma", "💸・değer-bütçe-isteme", "🔍・değer-bütçe-bildiri"]
            },
            {
                kategori: "Sosyal Medya",
                kanallar: ["🌐・twitter", "📷・instagram", "🎵・tiktok", "📰・ultra-haber"]
            },
            {
                kategori: "efsane",
                kanallar: ["💰・en-değerli-futbolcular", "💰・en-değerli-takımlar", "🏛️・müze", "⭐・efsaneler"]
            },
            {
                kategori: "Ultra Lig",
                kanallar: [
                    "🏆・puan-durumu", "📅・fikstür", "📝・maç-sonuçları", "⚽・gol-krallığı", 
                    "⚽・asist-krallığı", "🏥・sakatlıklar", "🟥・cezalılar", "🥅・kadrolar", 
                    "👑・sezonun-oyuncusu", "👑・haftanın-oyuncusu"
                ]
            },
            {
                kategori: "Ultra Cup",
                kanallar: ["📅・fikstür", "📝・maç-sonuçları", "⚽・gol-krallığı", "⚽・asist-krallığı", "🟥・cezalılar", "🥅・kadrolar-cup"]
            },
            {
                kategori: "Ultra Süper Cup",
                kanallar: ["📅・fikstür", "🔍・maç-sonuçları", "👑・krallıklar"]
            },
            {
                kategori: "Maç Kanalları",
                kanallar: ["📺・bein-sports", "🏟️・bein-tribün", "📺・exxen-spor", "🏟️・exxen-tribün"]
            },
            {
                kategori: "Transfer",
                kanallar: ["🚧・transfer-kuralları", "✅・kap", "🔍・takım-arama", "💷・transfer-masası", "📋・kap-bilgi"]
            },
            {
                kategori: "Ticketlar",
                kanallar: ["🎫・ticket"]
            }
        ];

        try {
            // Döngü ile sırayla kategorileri ve içindeki kanalları oluşturuyoruz
            for (const s of sunucuYapisi) {
                const category = await message.guild.channels.create({
                    name: s.kategori,
                    type: ChannelType.GuildCategory
                });

                for (const kanalIsmi of s.kanallar) {
                    await message.guild.channels.create({
                        name: kanalIsmi,
                        type: ChannelType.GuildText,
                        parent: category.id
                    });
                }
            }

            const tamamlandiEmbed = new EmbedBuilder()
                .setTitle('✅ Kurulum Tamamlandı')
                .setDescription('İstediğin tüm Ultra League kategorileri ve kanalları başarıyla kuruldu!')
                .setColor(0x2ecc71);

            await bildirimMesaj.edit({ embeds: [tamamlandiEmbed] });

        } catch (error) {
            console.error("Kurulum hatası:", error);
            message.channel.send("❌ Kanallar oluşturulurken bir hata meydana geldi! Botun `Kanalları Yönet` yetkisi olduğundan emin olun.");
        }
    }
});

// Railway veya yerel ortamdaki token ile giriş
client.login(process.env.DISCORD_TOKEN);
    
