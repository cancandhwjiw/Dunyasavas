const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = ".";

client.once('ready', () => {
    console.log(`${client.user.tag} aktif ve sunucu kurulumuna hazır!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // .kur komutu
    if (command === "kur") {
        // Sadece yönetici yetkisi olanlar kurabilsin
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın!");
        }

        const guild = message.guild;
        message.channel.send("🔄 Ultra League sunucu yapısı kuruluyor, lütfen bekleyin...");

        // Kurulacak kategori ve kanal şeması
        const sunucuYapisi = [
            {
                kategori: "Ultra League",
                kanallar: [
                    { ad: "🎪・takımlar", tip: ChannelType.GuildText },
                    { ad: "・Kayıt odasi", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Bilgilendirme",
                kanallar: [
                    { ad: "📣・duyuru", tip: ChannelType.GuildText },
                    { ad: "📦・sistemler", tip: ChannelType.GuildText },
                    { ad: "📚・kurallar", tip: ChannelType.GuildText },
                    { ad: "💎・anılar", tip: ChannelType.GuildText },
                    { ad: "🎭・rol-bilgi", tip: ChannelType.GuildText },
                    { ad: "🔮・rol-alma", tip: ChannelType.GuildText },
                    { ad: "🚀・booster", tip: ChannelType.GuildText },
                    { ad: "📈・seviye", tip: ChannelType.GuildText },
                    { ad: "✨・yetkili-alım", tip: ChannelType.GuildText },
                    { ad: "✨・spiker-alım", tip: ChannelType.GuildText },
                    { ad: "🎙️・spiker-sonuçları", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Diğer Kanallar",
                kanallar: [
                    { ad: "🔔・güncelleme", tip: ChannelType.GuildText },
                    { ad: "🚀・booster-bilgi", tip: ChannelType.GuildText },
                    { ad: "🛒・Market", tip: ChannelType.GuildText },
                    { ad: "🗳️・oy ver", tip: ChannelType.GuildText },
                    { ad: "🎉event", tip: ChannelType.GuildText },
                    { ad: "🎊 çekiliş", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Genel",
                kanallar: [
                    { ad: "・Sohnet", tip: ChannelType.GuildText },
                    { ad: "・Medya", tip: ChannelType.GuildText },
                    { ad: "🤖・medya", tip: ChannelType.GuildText },
                    { ad: "💡・istek-şikayet", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Eğlence Kanalları",
                kanallar: [
                    { ad: "💵・owo", tip: ChannelType.GuildText },
                    { ad: "🏆・turnuva", tip: ChannelType.GuildText },
                    { ad: "💫・bil-kazan", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Antrenman",
                kanallar: [
                    { ad: "🎽・antrenman", tip: ChannelType.GuildText },
                    { ad: "🥅・penaltı-antrenman", tip: ChannelType.GuildText },
                    { ad: "🎽・antrenman-bilgi", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "7. Değer İsteme & Bütçe İsteme",
                kanallar: [
                    { ad: "📊・değer-bütçe-kasma", tip: ChannelType.GuildText },
                    { ad: "💸・değer-bütçe-isteme", tip: ChannelType.GuildText },
                    { ad: "🔍・değer-bütçe-bildiri", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Sosyal Medya",
                kanallar: [
                    { ad: "🌐・twitter", tip: ChannelType.GuildText },
                    { ad: "📷・instagram", tip: ChannelType.GuildText },
                    { ad: "🎵・tiktok", tip: ChannelType.GuildText },
                    { ad: "📰・ultra-haber", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "efsane",
                kanallar: [
                    { ad: "💰・en-değerli-futbolcular", tip: ChannelType.GuildText },
                    { ad: "💰・en-değerli-takımlar", tip: ChannelType.GuildText },
                    { ad: "🏛️・müze", tip: ChannelType.GuildText },
                    { ad: "⭐・efsaneler", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Ultra Lig",
                kanallar: [
                    { ad: "🏆・puan-durumu", tip: ChannelType.GuildText },
                    { ad: "📅・fikstür", tip: ChannelType.GuildText },
                    { ad: "📝・maç-sonuçları", tip: ChannelType.GuildText },
                    { ad: "⚽・gol-krallığı", tip: ChannelType.GuildText },
                    { ad: "⚽・asist-krallığı", tip: ChannelType.GuildText },
                    { ad: "🏥・sakatlıklar", tip: ChannelType.GuildText },
                    { ad: "🟥・cezalılar", tip: ChannelType.GuildText },
                    { ad: "🥅・kadrolar", tip: ChannelType.GuildText },
                    { ad: "👑・sezonun-oyuncusu", tip: ChannelType.GuildText },
                    { ad: "👑・haftanın-oyuncusu", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Ultra Cup",
                kanallar: [
                    { ad: "📅・fikstür", tip: ChannelType.GuildText },
                    { ad: "📝・maç-sonuçları", tip: ChannelType.GuildText },
                    { ad: "⚽・gol-krallığı", tip: ChannelType.GuildText },
                    { ad: "⚽・asist-krallığı", tip: ChannelType.GuildText },
                    { ad: "🟥・cezalılar", tip: ChannelType.GuildText },
                    { ad: "🥅・kadrolar-cup", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Ultra Süper Cup",
                kanallar: [
                    { ad: "📅・fikstür", tip: ChannelType.GuildText },
                    { ad: "🔍・maç-sonuçları", tip: ChannelType.GuildText },
                    { ad: "👑・krallıklar", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Maç Kanalları",
                kanallar: [
                    { ad: "📺・bein-sports", tip: ChannelType.GuildText },
                    { ad: "🏟️・bein-tribün", tip: ChannelType.GuildVoice }, // Ses kanalı olarak ayarlandı
                    { ad: "📺・exxen-spor", tip: ChannelType.GuildText },
                    { ad: "🏟️・exxen-tribün", tip: ChannelType.GuildVoice } // Ses kanalı olarak ayarlandı
                ]
            },
            {
                kategori: "Transfer",
                kanallar: [
                    { ad: "🚧・transfer-kuralları", tip: ChannelType.GuildText },
                    { ad: "✅・kap", tip: ChannelType.GuildText },
                    { ad: "🔍・takım-arama", tip: ChannelType.GuildText },
                    { ad: "💷・transfer-masası", tip: ChannelType.GuildText },
                    { ad: "📋・kap-bilgi", tip: ChannelType.GuildText }
                ]
            },
            {
                kategori: "Ticketlar",
                kanallar: [
                    { ad: "🎫・ticket", tip: ChannelType.GuildText }
                ]
            }
        ];

        try {
            // Döngüyle sırayla kategorileri ve kanalları oluşturuyoruz
            for (const veri of sunucuYapisi) {
                const kategoriKanali = await guild.channels.create({
                    name: veri.kategori,
                    type: ChannelType.GuildCategory
                });

                for (const kanal of veri.kanallar) {
                    await guild.channels.create({
                        name: kanal.ad,
                        type: kanal.tip,
                        parent: kategoriKanali.id
                    });
                }
            }

            return message.channel.send("🎉 **Kurulum Başarıyla Tamamlandı!** Tüm kategoriler ve kanallar eksiksiz şekilde oluşturuldu.");
        } catch (error) {
            console.error("Kanal oluşturma hatası:", error);
            return message.channel.send("❌ Kanallar oluşturulurken bir hata meydana geldi. Bot yetkilerini kontrol edin.");
        }
    }
});

// Eski hali: const TOKEN = process.env.DISCORD_TOKEN || "BURAYA_BOT_TOKENINI_YAZ";
// Yeni hali (Tokenini tırnakların içine yapıştır):
const TOKEN = "MTA5Mjg3MzM... (buraya kendi botunun uzun token kodunu yapıştır)";
client.login(TOKEN);
