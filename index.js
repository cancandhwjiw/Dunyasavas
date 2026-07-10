const { PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'kur',
    description: 'Sunucu kanallarını otomatik olarak kurar.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısın!');
        }

        const guild = message.guild;
        message.channel.send('⏳ Sunucu kurulumu başlatılıyor, lütfen bekleyin...');

        try {
            // 1. Ultra League
            const catUltraLeague = await guild.channels.create({ name: '🎪 Ultra League', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '🎪・takımlar', type: ChannelType.GuildText, parent: catUltraLeague });
            await guild.channels.create({ name: '・Kayıt odasi', type: ChannelType.GuildText, parent: catUltraLeague });

            // 2. Bilgilendirme
            const catBilgi = await guild.channels.create({ name: 'Bilgilendirme', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '📣・duyuru', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '📦・sistemler', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '📚・kurallar', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '💎・anılar', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '🎭・rol-bilgi', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '🔮・rol-alma', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '🚀・booster', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '📈・seviye', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '✨・yetkili-alım', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '✨・spiker-alım', type: ChannelType.GuildText, parent: catBilgi });
            await guild.channels.create({ name: '🎙️・spiker-sonuçları', type: ChannelType.GuildText, parent: catBilgi });

            // 3. Diğer Kanallar
            const catDiger = await guild.channels.create({ name: 'Diğer Kanallar', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '🔔・güncelleme', type: ChannelType.GuildText, parent: catDiger });
            await guild.channels.create({ name: '🚀・booster-bilgi', type: ChannelType.GuildText, parent: catDiger });
            await guild.channels.create({ name: '🛒・Market', type: ChannelType.GuildText, parent: catDiger });
            await guild.channels.create({ name: '🗳️・oy ver', type: ChannelType.GuildText, parent: catDiger });
            await guild.channels.create({ name: '🎉・event', type: ChannelType.GuildText, parent: catDiger });
            await guild.channels.create({ name: '🎊・çekiliş', type: ChannelType.GuildText, parent: catDiger });

            // 4. Genel
            const catGenel = await guild.channels.create({ name: 'Genel', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '・Sohbet', type: ChannelType.GuildText, parent: catGenel });
            await guild.channels.create({ name: '・Medya', type: ChannelType.GuildText, parent: catGenel });
            await guild.channels.create({ name: '🤖・bot-komut', type: ChannelType.GuildText, parent: catGenel });
            await guild.channels.create({ name: '💡・istek-şikayet', type: ChannelType.GuildText, parent: catGenel });

            // 5. Eğlence Kanalları
            const catEglence = await guild.channels.create({ name: 'Eğlence Kanalları', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '💵・owo', type: ChannelType.GuildText, parent: catEglence });
            await guild.channels.create({ name: '🏆・turnuva', type: ChannelType.GuildText, parent: catEglence });
            await guild.channels.create({ name: '💫・bil-kazan', type: ChannelType.GuildText, parent: catEglence });

            // 6. Antrenman
            const catAntrenman = await guild.channels.create({ name: 'Antrenman', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '🎽・antrenman', type: ChannelType.GuildText, parent: catAntrenman });
            await guild.channels.create({ name: '🥅・penaltı-antrenman', type: ChannelType.GuildText, parent: catAntrenman });
            await guild.channels.create({ name: '🎽・antrenman-bilgi', type: ChannelType.GuildText, parent: catAntrenman });

            // 7. Değer İsteme & Bütçe İsteme
            const catDegerButce = await guild.channels.create({ name: '7. Değer İsteme & Bütçe İsteme', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '📊・değer-bütçe-kasma', type: ChannelType.GuildText, parent: catDegerButce });
            await guild.channels.create({ name: '💸・değer-bütçe-isteme', type: ChannelType.GuildText, parent: catDegerButce });
            await guild.channels.create({ name: '🔍・değer-bütçe-bildiri', type: ChannelType.GuildText, parent: catDegerButce });

            // 8. Sosyal Medya
            const catSosyal = await guild.channels.create({ name: 'Sosyal Medya', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '🌐・twitter', type: ChannelType.GuildText, parent: catSosyal });
            await guild.channels.create({ name: '📷・instagram', type: ChannelType.GuildText, parent: catSosyal });
            await guild.channels.create({ name: '🎵・tiktok', type: ChannelType.GuildText, parent: catSosyal });
            await guild.channels.create({ name: '📰・ultra-haber', type: ChannelType.GuildText, parent: catSosyal });

            // 9. Efsane
            const catEfsane = await guild.channels.create({ name: 'efsane', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '💰・en-değerli-futbolcular', type: ChannelType.GuildText, parent: catEfsane });
            await guild.channels.create({ name: '💰・en-değerli-takımlar', type: ChannelType.GuildText, parent: catEfsane });
            await guild.channels.create({ name: '🏛️・müze', type: ChannelType.GuildText, parent: catEfsane });
            await guild.channels.create({ name: '⭐・efsaneler', type: ChannelType.GuildText, parent: catEfsane });

            // 10. Ultra Lig
            const catUltraLig = await guild.channels.create({ name: 'Ultra Lig', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '🏆・puan-durumu', type: ChannelType.GuildText, parent: catUltraLig });
            await guild.channels.create({ name: '📅・fikstür', type: ChannelType.GuildText, parent: catUltraLig });
            await guild.channels.create({ name: '📝・maç-sonuçları', type: ChannelType.GuildText, parent: catUltraLig });
            await guild.channels.create({ name: '⚽・gol-krallığı', type: ChannelType.GuildText, parent: catUltraLig });
            await guild.channels.create({ name: '⚽・asist-krallığı', type: ChannelType.GuildText, parent: catUltraLig });
            await guild.channels.create({ name: '🏥・sakatlıklar', type: ChannelType.GuildText, parent: catUltraLig });
            await guild.channels.create({ name: '🟥・cezalılar', type: ChannelType.GuildText, parent: catUltraLig });
            await guild.channels.create({ name: '🥅・kadrolar', type: ChannelType.GuildText, parent: catUltraLig });
            await guild.channels.create({ name: '👑・sezonun-oyuncusu', type: ChannelType.GuildText, parent: catUltraLig });
            await guild.channels.create({ name: '👑・haftanın-oyuncusu', type: ChannelType.GuildText, parent: catUltraLig });

            // 11. Ultra Cup
            const catUltraCup = await guild.channels.create({ name: 'Ultra Cup', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '📅・fikstür', type: ChannelType.GuildText, parent: catUltraCup });
            await guild.channels.create({ name: '📝・maç-sonuçları', type: ChannelType.GuildText, parent: catUltraCup });
            await guild.channels.create({ name: '⚽・gol-krallığı', type: ChannelType.GuildText, parent: catUltraCup });
            await guild.channels.create({ name: '⚽・asist-krallığı', type: ChannelType.GuildText, parent: catUltraCup });
            await guild.channels.create({ name: '🟥・cezalılar', type: ChannelType.GuildText, parent: catUltraCup });
            await guild.channels.create({ name: '🥅・kadrolar-cup', type: ChannelType.GuildText, parent: catUltraCup });

            // 12. Ultra Süper Cup
            const catSuperCup = await guild.channels.create({ name: 'Ultra Süper Cup', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '📅・fikstür', type: ChannelType.GuildText, parent: catSuperCup });
            await guild.channels.create({ name: '🔍・maç-sonuçları', type: ChannelType.GuildText, parent: catSuperCup });
            await guild.channels.create({ name: '👑・krallıklar', type: ChannelType.GuildText, parent: catSuperCup });

            // 13. Maç Kanalları
            const catMacKanallari = await guild.channels.create({ name: 'Maç Kanalları', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '📺・bein-sports', type: ChannelType.GuildText, parent: catMacKanallari });
            await guild.channels.create({ name: '🏟️・bein-tribün', type: ChannelType.GuildVoice, parent: catMacKanallari });
            await guild.channels.create({ name: '📺・exxen-spor', type: ChannelType.GuildText, parent: catMacKanallari });
            await guild.channels.create({ name: '🏟️・exxen-tribün', type: ChannelType.GuildVoice, parent: catMacKanallari });

            // 14. Transfer
            const catTransfer = await guild.channels.create({ name: 'Transfer', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '🚧・transfer-kuralları', type: ChannelType.GuildText, parent: catTransfer });
            await guild.channels.create({ name: '✅・kap', type: ChannelType.GuildText, parent: catTransfer });
            await guild.channels.create({ name: '🔍・takım-arama', type: ChannelType.GuildText, parent: catTransfer });
            await guild.channels.create({ name: '💷・transfer-masası', type: ChannelType.GuildText, parent: catTransfer });
            await guild.channels.create({ name: '📋・kap-bilgi', type: ChannelType.GuildText, parent: catTransfer });

            // 15. Ticketlar
            const catTicket = await guild.channels.create({ name: 'Ticketlar', type: ChannelType.GuildCategory });
            await guild.channels.create({ name: '🎫・ticket', type: ChannelType.GuildText, parent: catTicket });

            message.channel.send('✅ **Sunucu şablonu başarıyla kuruldu!**');
        } catch (error) {
            console.error(error);
            message.channel.send('❌ Kanallar oluşturulurken bir hata meydana geldi.');
        }
    },
};
                
