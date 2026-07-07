const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Kurucu Rol ID (Senin belirttiğin rol)
const OWNER_ROLE_ID = "1523659172904960030";

// Geçici Hafıza (Veritabanı mantığı)
const userData = new Map();

function getProfile(userId) {
    if (!userData.has(userId)) {
        userData.set(userId, {
            ulkeadi: "Kurulmamış",
            para: 100000,
            asker: 0,
            kale: 0,
            kule: 0,
            sur: 0
        });
    }
    return userData.get(userId);
}

client.on('ready', () => {
    console.log(`🛡️ Bot ${client.user.tag} olarak giriş yaptı!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('.')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. .ulkekur Komutu
    if (command === 'ulkekur') {
        if (!message.member.roles.cache.has(OWNER_ROLE_ID)) {
            return message.reply("❌ **Hata:** Bu komutu sadece **Kurucular** kullanabilir!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("❌ **Hata:** Lütfen ülke kurulacak üyeyi etiketleyin!");

        const ulkeAdi = args.slice(1).join(" ");
        if (!ulkeAdi) return message.reply("❌ **Hata:** Lütfen kurulacak ülkenin adını yazın!");

        userData.set(member.id, {
            ulkeadi: ulkeAdi,
            para: 100000,
            asker: 0,
            kale: 0,
            kule: 0,
            sur: 0
        });

        const embed = new EmbedBuilder()
            .setTitle("👑 Yeni Bir Çağ Başlıyor!")
            .setDescription(`🏰 ${member} liderliğinde **${ulkeAdi}** şanlı uygarlığı resmen kuruldu!\n💰 Başlangıç Hazinesi olarak \`100.000 TL\` teslim edildi.`)
            .setColor(0x34495e)
            .setFooter({ text: "⚔️ Ordunu kurmaya başlamak için .askeral yazabilirsin!" });

        return message.channel.send({ embeds: [embed] });
    }

    // 2. .profil Komutu
    if (command === 'profil') {
        const data = getProfile(message.author.id);

        const embed = new EmbedBuilder()
            .setTitle(`👑 ${message.author.username} Uygarlığı ve Şanlı Toprakları 👑`)
            .setDescription(
                `🏰 **Ülke Adı:** ${data.ulkeadi}\n\n` +
                `⚔️ **Yönetilen toprakların son durumu ve askeri güç raporu:**\n\n` +
                `💰 **Hazine Durumu:** ${data.para} TL\n` +
                `🪖 **Aktif Ordu Gücü:** ${data.asker} Asker\n\n` +
                `────────────────────\n` +
                `🏰 **Merkezi Kale:** ${data.kale} Adet\n` +
                `🏹 **Savunma Kuleleri:** ${data.kule} Adet\n` +
                `🧱 **Sınır Surları:** ${data.sur} Adet\n` +
                `────────────────────`
            )
            .setColor(0x34495e)
            .setFooter({ text: "🛡️ Topraklarını genişletmek ve ordunu güçlendirmek için komutları kullan!" });

        return message.channel.send({ embeds: [embed] });
    }

    // 3. .askeral Komutu
    if (command === 'askeral') {
        const miktar = parseInt(args[0]);
        if (!miktar || miktar <= 0 || isNaN(miktar)) {
            return message.reply("❌ **Hata:** Lütfen geçerli bir miktar girin! Örn: `.askeral 10`");
        }

        const data = getProfile(message.author.id);
        const maliyet = miktar * 10;

        if (data.para < maliyet) {
            return message.reply(`❌ **Hata:** Yeterli altınınınız yok! Gereken: \`${maliyet} TL\` | Sizde Olan: \`${data.para} TL\``);
        }

        data.para -= maliyet;
        data.asker += miktar;

        return message.channel.send(`⚔️ **Kışladan Sesler Yükseliyor!**\n\n🪖 Başarıyla **${miktar}** adet asker ordunuza katıldı!\n💰 Güncel durum için \`.profil\` yazabilirsiniz.`);
    }

    // 4. .sifirla Komutu
    if (command === 'sifirla') {
        if (!message.member.roles.cache.has(OWNER_ROLE_ID)) {
            return message.reply("❌ **Hata:** Bu komutu sadece **Kurucular** kullanabilir!");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("❌ **Hata:** Lütfen sıfırlanacak üyeyi etiketleyin!");

        if (userData.has(member.id)) {
            userData.delete(member.id);
        }

        return message.channel.send(`🔄 ${member} kullanıcısının ülkesi, parası ve tüm askeri verileri başarıyla sıfırlandı!`);
    }

    // 5. -yardim Komutu (Önek olarak çizgi kullanıldığı için ayrıca kontrol ettik)
    if (message.content.toLowerCase() === '-yardim') {
        const embed = new EmbedBuilder()
            .setTitle("📜 Krallık & Strateji Yönetim Rehberi")
            .setDescription(
                "**⚔️ Temel Komutlar:**\n" +
                "• `.profil` ➔ Ülke ve ordu durumu.\n" +
                "• `.askeral <miktar>` ➔ Asker eğitir (tanesi 10 TL).\n\n" +
                "**👑 Yetkili Komutları:**\n" +
                "• `.ulkekur @üye [Ülke Adı]`\n" +
                "• `.sifirla @üye`"
            )
            .setColor(0xd1a119);

        return message.channel.send({ embeds: [embed] });
    }
});

// Railway Variables kısmından gelen TOKEN ile botu başlatır
client.login(process.env.TOKEN);
                                           
