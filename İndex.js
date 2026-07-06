
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Kurucu Rol ID'si
const OWNER_ROLE_ID = "1523659172904960030";

// Basit Veritabanı Hafızası (Bot kapanırsa sıfırlanır, Railway'de kalıcı olması için ileride MongoDB/Json eklenebilir)
const veritabanı = {};

// Bir kullanıcının verisi yoksa varsayılan değerlerle başlatır
function profiliGetir(userId, username) {
    if (!veritabanı[userId]) {
        veritabanı[userId] = {
            uygarlik: `${username} Uygarlığı`,
            asker: 0,
            para: 0,
            kale: 0,
            kule: 0,
            sur: 0
        };
    }
    return veritabanı[userId];
}

client.on('ready', () => {
    console.log(`⚔️ SAVAŞ VE STRATEJİ BOTU AKTİF: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('.')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    // Yetki Kontrol Fonksiyonu
    const yetkiliKontrol = () => message.member.roles.cache.has(OWNER_ROLE_ID) || message.member.permissions.has('Administrator');

    // 📜 .yardim
    if (cmd === 'yardim' || cmd === 'yardım') {
        const embed = new EmbedBuilder()
            .setTitle("⚔️ Uygarlık & Savaş Yönetimi Komutları")
            .setDescription("Uygarlığınızı büyütmek, ordunuzu kurmak ve yönetmek için kullanabileceğiniz komutlar:")
            .addFields(
                { name: "👤 .profil", value: "Yönettiniz uygarlığı, asker sayınızı, yapılarınızı ve hazinenizi gösterir." },
                { name: "💰 .bal", value: "Hazinenizdeki güncel para miktarını hızlıca sorgular." },
                { name: "🏗️ .inşaaet <kule/kale/sur> <miktar>", value: "Savunma yapıları inşa eder.\n• Kule: 50.000 TL\n• Kale: 100.000 TL\n• Sur: 250.000 TL" },
                { name: "🪖 .askeral <miktar>", value: "Her bir asker 10 TL olacak şekilde hazinenizden ordu toplarsınız." },
                { name: "👑 Owner Komutları (Sadece Yetkililer)", value: "• `.hazinekle @üye <miktar>`\n• `.hazineçıkar @üye <miktar>`" }
            )
            .setColor(0xd1a119)
            .setFooter({ text: 'Savaş rüzgarları esiyor...' });

        return message.reply({ embeds: [embed] });
    }

    // 👤 .profil
    if (cmd === 'profil') {
        const profil = profiliGetir(message.author.id, message.author.username);

        const embed = new EmbedBuilder()
            .setTitle(`🏰 ${profil.uygarlik}`)
            .setDescription(`<@${message.author.id}> tarafından yönetilen toprakların genel durumu:`)
            .addFields(
                { name: "💰 Hazine Dengesi", value: `\`${profil.para.toLocaleString()} TL\``, inline: true },
                { name: "🪖 Ordu Mevcudu", value: `\`${profil.asker.toLocaleString()} Asker\``, inline: true },
                { name: "🧱 Savunma Yapıları", value: `🏰 **Kale:** \`${profil.kale}\` Adet\n🏹 **Kule:** \`${profil.kule}\` Adet\n🧱 **Sur:** \`${profil.sur}\` Adet` }
            )
            .setColor(0x2f3136)
            .setThumbnail(message.author.displayAvatarURL());

        return message.reply({ embeds: [embed] });
    }

    // 💰 .bal
    if (cmd === 'bal') {
        const profil = profiliGetir(message.author.id, message.author.username);
        return message.reply(`💰 **Hazinenizdeki Mevcut Para:** \`${profil.para.toLocaleString()} TL\``);
    }

    // 🪖 .askeral
    if (cmd === 'askeral') {
        const miktar = parseInt(args[0]);
        if (!miktar || isNaN(miktar) || miktar <= 0) return message.reply("❌ Lütfen almak istediğiniz geçerli bir asker miktarı yazın! Örn: `.askeral 500`");

        const profil = profiliGetir(message.author.id, message.author.username);
        const toplamMaliyet = miktar * 10;

        if (profil.para < toplamMaliyet) {
            return message.reply(`❌ Ordu toplamak için paranız yetersiz!\n💰 İstenen: \`${toplamMaliyet.toLocaleString()} TL\`\n📉 Sizde Olan: \`${profil.para.toLocaleString()} TL\``);
        }

        profil.para -= toplamMaliyet;
        profil.asker += miktar;

        return message.reply(`🪖 Başarıyla kışlalardan \`${miktar.toLocaleString()}\` yeni asker orduya katıldı! \n💸 Harcanan: \`${toplamMaliyet.toLocaleString()} TL\``);
    }

    // 🏗️ .inşaaet
    if (cmd === 'inşaaet' || cmd === 'insaaet') {
        const yapi = args[0]?.toLowerCase();
        const miktar = parseInt(args[1]) || 1;

        if (!yapi || !['kule', 'kale', 'sur'].includes(yapi)) {
            return message.reply("❌ Geçerli bir yapı türü seçmelisiniz! Kullanım: `.inşaaet <kule/kale/sur> [miktar]`");
        }
        if (miktar <= 0 || isNaN(miktar)) return message.reply("❌ Geçerli bir inşa miktarı belirtmelisiniz!");

        const profil = profiliGetir(message.author.id, message.author.username);
        let birimMaliyet = 0;

        if (yapi === 'kule') birimMaliyet = 50000;
        if (yapi === 'kale') birimMaliyet = 100000;
        if (yapi === 'sur') birimMaliyet = 250000;

        const toplamMaliyet = birimMaliyet * miktar;

        if (profil.para < toplamMaliyet) {
            return message.reply(`❌ Hazinenizde bu yapıları inşa edecek yeterli ödenek yok!\n💰 Gereken: \`${toplamMaliyet.toLocaleString()} TL\`\n📉 Mevcut: \`${profil.para.toLocaleString()} TL\``);
        }

        profil.para -= toplamMaliyet;
        profil.yapi += miktar; // Dinamik ekleme için alt satırda kontrol ediliyor
        if (yapi === 'kule') profil.kule += miktar;
        if (yapi === 'kale') profil.kale += miktar;
        if (yapi === 'sur') profil.sur += miktar;

        return message.reply(`🧱 Tepeye ve sınırlara \`${miktar}\` adet **${yapi.toUpperCase()}** başarıyla inşa edildi!\n💸 Harcanan Ödenek: \`${toplamMaliyet.toLocaleString()} TL\``);
    }

    // 👑 OWNER: .hazinekle
    if (cmd === 'hazinekle') {
        if (!yetkiliKontrol()) return message.reply("❌ Bu komutu sadece Krallık Yöneticileri (<@&1523659172904960030>) kullanabilir!");

        const hedef = message.mentions.members.first();
        const miktar = parseInt(args[1]);

        if (!hedef || !miktar || isNaN(miktar) || miktar <= 0) {
            return message.reply("❌ Hatalı kullanım! Örn: `.hazinekle @üye 100000`");
        }

        const profil = profiliGetir(hedef.id, hedef.user.username);
        profil.para += miktar;

        return message.reply(`✅ <@${hedef.id}> üyesinin uygarlık hazinesine \`${miktar.toLocaleString()} TL\` başarıyla aktarıldı!`);
    }

    // 👑 OWNER: .hazineçıkar
    if (cmd === 'hazineçıkar' || cmd === 'hazinecikar') {
        if (!yetkiliKontrol()) return message.reply("❌ Bu komutu sadece Krallık Yöneticileri (<@&1523659172904960030>) kullanabilir!");

        const hedef = message.mentions.members.first();
        const miktar = parseInt(args[1]);

        if (!hedef || !miktar || isNaN(miktar) || miktar <= 0) {
            return message.reply("❌ Hatalı kullanım! Örn: `.hazineçıkar @üye 50000`");
        }

        const profil = profiliGetir(hedef.id, hedef.user.username);
        profil.para = Math.max(0, profil.para - miktar); // Eksiye düşmesini engeller

        return message.reply(`📉 <@${hedef.id}> üyesinin uygarlık hazinesinden \`${miktar.toLocaleString()} TL\` başarıyla el konuldu/çıkartıldı!`);
    }
});

client.login(process.env.DISCORD_TOKEN);
        
