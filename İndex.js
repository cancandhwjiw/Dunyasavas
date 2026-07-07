const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Ayarlar ve Yetkili Rol ID
const PREFIX = ".";
const OWNER_ROLE_ID = "1523659172904960030";

// Veritabanı Dosyası (Railway'de kalıcı olması için basit bir JSON veri sistemi)
const DATA_FILE = './database.json';
let db = { users: {}, treasury: 0 };

if (fs.existsSync(DATA_FILE)) {
    try {
        db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
        console.error("Veritabanı okuma hatası, sıfırlanıyor...", e);
    }
}

function saveDB() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// Kullanıcı Verisi Şablonu
function getUserData(userId) {
    if (!db.users[userId]) {
        db.users[userId] = {
            hasCountry: false,
            countryName: "Yok",
            money: 0,
            soldiers: 0,
            buildings: { kule: 0, kale: 0, sur: 0 }
        };
    }
    return db.users[userId];
}

client.once('ready', () => {
    console.log(`${client.user.tag} aktif! Railway için hazır.`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Yetki Kontrolü Fonksiyonu
    const isOwner = message.member.roles.cache.has(OWNER_ROLE_ID) || message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // 1. .profil
    if (command === "profil") {
        const target = message.mentions.users.first() || message.author;
        const data = getUserData(target.id);

        if (!data.hasCountry) {
            return message.reply(`${target.username} adına kurulmuş bir uygarlık bulunmuyor.`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`🏛️ ${data.countryName} Uygarlığı Profili`)
            .setColor("Blurple")
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: "👑 Hükümdar", value: `${target}`, inline: true },
                { name: "🌍 Ülke Adı", value: `${data.countryName}`, inline: true },
                { name: "💰 Para", value: `${data.money} Lira`, inline: true },
                { name: "🪖 Asker Sayısı", value: `${data.soldiers} Asker`, inline: true },
                { name: "🏰 İnşa Edilenler", value: `Kule: ${data.buildings.kule} | Kale: ${data.buildings.kale} | Sur: ${data.buildings.sur}` }
            );

        return message.channel.send({ embeds: [embed] });
    }

    // 2. .ulkekur
    if (command === "ulkekur") {
        if (!isOwner) return message.reply("❌ Bu komutu sadece <@&1523659172904960030> rolüne sahip kişiler kullanabilir.");
        
        const target = message.mentions.users.first();
        const countryName = args.slice(1).join(" ");

        if (!target || !countryName) return message.reply("ℹ️ Doğru Kullanım: `.ulkekur @kullanıcı ÜlkeAdı`");

        const data = getUserData(target.id);
        data.hasCountry = true;
        data.countryName = countryName;
        saveDB();

        return message.reply(`✅ ${target} kullanıcısı için **${countryName}** uygarlığı başarıyla kuruldu!`);
    }

    // 3. .ulkesil
    if (command === "ulkesil") {
        if (!isOwner) return message.reply("❌ Bu komutu sadece <@&1523659172904960030> rolüne sahip kişiler kullanabilir.");

        const target = message.mentions.users.first();
        if (!target) return message.reply("ℹ️ Doğru Kullanım: `.ulkesil @kullanıcı`");

        if (db.users[target.id]) {
            delete db.users[target.id];
            saveDB();
            return message.reply(`🗑️ ${target} kullanıcısının uygarlığı ve tüm verileri silindi.`);
        } else {
            return message.reply("❌ Bu kullanıcının zaten bir uygarlığı yok.");
        }
    }

    // 4. .ulkelist
    if (command === "ulkelist") {
        let listStr = "";
        for (const [userId, data] of Object.entries(db.users)) {
            if (data.hasCountry) {
                listStr += `• <@${userId}> | **${data.countryName}** — 🪖 ${data.soldiers} Asker | 💰 ${data.money} Lira\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("🌍 Bilinen Tüm Uygarlıkların Listesi")
            .setColor("Gold")
            .setDescription(listStr || "Henüz kurulmuş bir uygarlık yok.")
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // 5. .hazinekle
    if (command === "hazinekle") {
        if (!isOwner) return message.reply("❌ Bu komutu sadece yetkililer kullanabilir.");
        const miktar = parseInt(args[0]);
        if (isNaN(miktar) || miktar <= 0) return message.reply("ℹ️ Doğru Kullanım: `.hazinekle miktar`");

        db.treasury = (db.treasury || 0) + miktar;
        saveDB();
        return message.reply(`💰 Merkez hazinesine **${miktar} Lira** eklendi! Güncel Hazine: \`${db.treasury} Lira\``);
    }

    // 6. .hazineçıkar
    if (command === "hazineçıkar" || command === "hazinecikar") {
        if (!isOwner) return message.reply("❌ Bu komutu sadece yetkililer kullanabilir.");
        const miktar = parseInt(args[0]);
        if (isNaN(miktar) || miktar <= 0) return message.reply("ℹ️ Doğru Kullanım: `.hazineçıkar miktar`");

        if ((db.treasury || 0) < miktar) return message.reply(`❌ Hazinede o kadar para yok! Mevcut hazine: \`${db.treasury} Lira\``);

        db.treasury -= miktar;
        saveDB();
        return message.reply(`💸 Merkez hazinesinden **${miktar} Lira** çıkartıldı! Güncel Hazine: \`${db.treasury} Lira\``);
    }

    // 7. .bal
    if (command === "bal") {
        return message.reply(`🏛️ **Merkez Hazinesi Değeri:** \`${db.treasury || 0} Lira\``);
    }

    // 8. .inşaaet
    if (command === "inşaaet" || command === "insaaet") {
        const data = getUserData(message.author.id);
        if (!data.hasCountry) return message.reply("❌ Önce bir uygarlığınızın olması gerekir.");

        const secenek = args[0]?.toLowerCase();
        const adet = parseInt(args[1]) || 1;

        if (!["kule", "kale", "sur"].includes(secenek) || adet <= 0) {
            return message.reply("ℹ️ Doğru Kullanım: `.inşaaet [kule/kale/sur] [adet]`\nFiyatlar: Kule: 50K, Kale: 100K, Sur: 250K");
        }

        const fiyatlar = { kule: 50000, kale: 100000, sur: 250000 };
        const toplamMaliyet = fiyatlar[secenek] * adet;

        if (data.money < toplamMaliyet) {
            return message.reply(`❌ Yetersiz bakiye! ${adet} adet ${secenek} için **${toplamMaliyet} Lira** gerekiyor. Sende olan: \`${data.money} Lira\``);
        }

        data.money -= toplamMaliyet;
        data.buildings[secenek] += adet;
        saveDB();

        return message.reply(`🏗️ Başarıyla **${adet}** adet **${secenek}** inşa ettiniz! Harcanan: \`${toplamMaliyet} Lira\``);
    }

    // 9. .askeral
    if (command === "askeral") {
        const data = getUserData(message.author.id);
        if (!data.hasCountry) return message.reply("❌ Önce bir uygarlığınızın olması gerekir.");

        const miktar = parseInt(args[0]);
        if (isNaN(miktar) || miktar <= 0) return message.reply("ℹ️ Doğru Kullanım: `.askeral [miktar]` (1 Asker = 10 Lira)");

        const toplamMaliyet = miktar * 10;

        if (data.money < toplamMaliyet) {
            return message.reply(`❌ Paran yetersiz! **${miktar}** asker almak için **${toplamMaliyet} Lira** gerekli. Sende olan: \`${data.money} Lira\``);
        }

        data.money -= toplamMaliyet;
        data.soldiers += miktar;
        saveDB();

        return message.reply(`🪖 Başarıyla ordunuza **${miktar}** yeni asker kattınız! Harcanan: \`${toplamMaliyet} Lira\``);
    }

    // 10. -yardim
    if (command === "yardim" || command === "yardım" || message.content === "-yardim") {
        const embed = new EmbedBuilder()
            .setTitle("📜 Uygarlık Botu Komut Listesi")
            .setColor("Green")
            .addFields(
                { name: "👥 Herkesin Kullanabileceği Komutlar", value: "`.profil [@kullanıcı]` - Uygarlık durumunu gösterir.\n`.ulkelist` - Aktif uygarlıkları listeler.\n`.inşaaet [kule/kale/sur] [adet]` - Yapı inşa eder.\n`.askeral [miktar]` - Asker satın alır (1 asker = 10 Lira)." },
                { name: "👑 Owner / Yetkili Komutları", value: "`.ulkekur @kullanıcı [İsim]` - Yeni ülke kurar.\n`.ulkesil @kullanıcı` - Ülkeyi siler.\n`.hazinekle [miktar]` - Merkez hazinesine para atar.\n`.hazineçıkar [miktar]` - Hazineden para çeker.\n`.bal` - Merkez hazinesini görür." }
            );
        return message.channel.send({ embeds: [embed] });
    }
});

// Bot Tokenini buraya girin veya Railway Environment Variables kısmına DISCORD_TOKEN olarak ekleyin.
const TOKEN = process.env.DISCORD_TOKEN || "BURAYA_BOT_TOKENINI_YAZ";
client.login(TOKEN);
