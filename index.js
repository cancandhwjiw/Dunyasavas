const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const PREFIX = ".";
const OWNER_ROLE_ID = "1523659172904960030";

const DATA_FILE = './database.json';
let db = { users: {}, treasury: 0 };

if (fs.existsSync(DATA_FILE)) {
    try {
        db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
        console.error("Veritabanı okuma hatası:", e);
    }
}

function saveDB() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// Aktif savaşları takip etmek için geçici hafıza
const activeWars = new Map();

function getUserData(userId) {
    if (!db.users[userId]) {
        db.users[userId] = {
            hasCountry: false,
            countryName: "Yok",
            money: 0,
            soldiers: 0,
            nukes: 0,
            missiles: 0,
            buildings: { kule: 0, kale: 0, sur: 0 }
        };
    }
    // Yeni eklenen alanların eski verilerde hata vermemesi için kontrol
    if (db.users[userId].nukes === undefined) db.users[userId].nukes = 0;
    if (db.users[userId].missiles === undefined) db.users[userId].missiles = 0;
    return db.users[userId];
}

// Ülke adına göre kullanıcı ID'sini bulan yardımcı fonksiyon
function findUserByCountry(countryName) {
    for (const [userId, data] of Object.entries(db.users)) {
        if (data.hasCountry && data.countryName.toLowerCase() === countryName.toLowerCase()) {
            return userId;
        }
    }
    return null;
}

client.once('ready', () => {
    console.log(`${client.user.tag} aktif ve savaşa hazır!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const isOwner = message.member?.roles.cache.has(OWNER_ROLE_ID) || message.member?.permissions.has(PermissionsBitField.Flags.Administrator);

    // 1. .profil
    if (command === "profil") {
        const target = message.mentions.users.first() || message.author;
        const data = getUserData(target.id);

        if (!data.hasCountry) {
            return message.reply(`❌ ${target.username} adına kurulmuş bir uygarlık bulunmuyor.`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`🏛️ ${data.countryName} Uygarlığı Profili`)
            .setColor("Blurple")
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: "👑 Hükümdar", value: `${target}`, inline: true },
                { name: "🌍 Ülke Adı", value: `${data.countryName}`, inline: true },
                { name: "💰 Para", value: `${data.money.toLocaleString()} Lira`, inline: true },
                { name: "🪖 Asker Sayısı", value: `${data.soldiers.toLocaleString()} / 2.000.000`, inline: true },
                { name: "☢️ Nükleer Güç", value: `${data.nukes} Adet`, inline: true },
                { name: "🚀 Füze Sayısı", value: `${data.missiles} Adet`, inline: true },
                { name: "🏰 İnşa Edilenler", value: `Kule: ${data.buildings.kule} | Kale: ${data.buildings.kale} | Sur: ${data.buildings.sur}` }
            );

        return message.channel.send({ embeds: [embed] });
    }

    // 2. .ulkekur
    if (command === "ulkekur") {
        if (!isOwner) return message.reply("❌ Bu komutu sadece yetkililer kullanabilir.");
        const target = message.mentions.users.first();
        const countryName = args.slice(1).join(" ");

        if (!target || !countryName) return message.reply("ℹ️ Kullanım: `.ulkekur @kullanıcı ÜlkeAdı`");

        const data = getUserData(target.id);
        data.hasCountry = true;
        data.countryName = countryName;
        saveDB();

        return message.reply(`✅ ${target} için **${countryName}** uygarlığı kuruldu!`);
    }

    // 3. .ulkesil
    if (command === "ulkesil") {
        if (!isOwner) return message.reply("❌ Bu komutu sadece yetkililer kullanabilir.");
        const target = message.mentions.users.first();
        if (!target) return message.reply("ℹ️ Kullanım: `.ulkesil @kullanıcı`");

        if (db.users[target.id]) {
            delete db.users[target.id];
            saveDB();
            return message.reply(`🗑️ ${target} kullanıcısının uygarlığı silindi.`);
        }
        return message.reply("❌ Uygarlık bulunamadı.");
    }

    // 4. .hazinekle (Sorunlar Giderildi)
    if (command === "hazinekle") {
        if (!isOwner) return message.reply("❌ Bu komutu sadece yetkililer kullanabilir.");
        
        // Eğer bir kullanıcı etiketlendiyse: .hazinekle @kullanıcı miktar
        const target = message.mentions.users.first();
        let miktarIdx = target ? 1 : 0;
        let miktarStr = args[miktarIdx];

        if (!miktarStr) return message.reply("ℹ️ Kullanım: `.hazinekle miktar` veya `.hazinekle @kullanıcı miktar`");

        // "k" veya "m" kısaltma desteği (Örn: 10m, 50k)
        let miktar = parseFloat(miktarStr);
        if (miktarStr.toLowerCase().endsWith('m')) miktar *= 1000000;
        else if (miktarStr.toLowerCase().endsWith('k')) miktar *= 1000;

        if (isNaN(miktar) || miktar <= 0) return message.reply("❌ Geçersiz miktar girdiniz.");

        if (target) {
            const data = getUserData(target.id);
            if (!data.hasCountry) return message.reply("❌ Bu kullanıcının uygarlığı yok.");
            data.money += miktar;
            saveDB();
            return message.reply(`💰 ${target} uygarlığına **${miktar.toLocaleString()} Lira** eklendi!`);
        } else {
            db.treasury = (db.treasury || 0) + miktar;
            saveDB();
            return message.reply(`💰 Merkez hazinesine **${miktar.toLocaleString()} Lira** eklendi! Güncel: \`${db.treasury.toLocaleString()} Lira\``);
        }
    }

    // 5. .hazineçıkar / .hazinecikar
    if (command === "hazineçıkar" || command === "hazinecikar") {
        if (!isOwner) return message.reply("❌ Bu komutu sadece yetkililer kullanabilir.");
        let miktarStr = args[0];
        if (!miktarStr) return message.reply("ℹ️ Kullanım: `.hazineçıkar miktar`");

        let miktar = parseFloat(miktarStr);
        if (miktarStr.toLowerCase().endsWith('m')) miktar *= 1000000;
        else if (miktarStr.toLowerCase().endsWith('k')) miktar *= 1000;

        if (isNaN(miktar) || miktar <= 0) return message.reply("❌ Geçersiz miktar.");
        if ((db.treasury || 0) < miktar) return message.reply(`❌ Hazinede o kadar para yok! Mevcut: \`${db.treasury.toLocaleString()} Lira\``);

        db.treasury -= miktar;
        saveDB();
        return message.reply(`💸 Hazineden **${miktar.toLocaleString()} Lira** çıkarıldı! Kalan: \`${db.treasury.toLocaleString()} Lira\``);
    }

    // 6. .bal
    if (command === "bal") {
        return message.reply(`🏛️ **Merkez Hazinesi Değeri:** \`${(db.treasury || 0).toLocaleString()} Lira\``);
    }

    // 7. .askeral
    if (command === "askeral") {
        const data = getUserData(message.author.id);
        if (!data.hasCountry) return message.reply("❌ Önce bir uygarlığınızın olması gerekir.");

        let miktarStr = args[0];
        if (!miktarStr) return message.reply("ℹ️ Kullanım: `.askeral miktar` (1 Asker = 10 Lira)");

        let miktar = parseInt(miktarStr);
        if (miktarStr.toLowerCase().endsWith('m')) miktar *= 1000000;
        else if (miktarStr.toLowerCase().endsWith('k')) miktar *= 1000;

        if (isNaN(miktar) || miktar <= 0) return message.reply("❌ Geçersiz miktar.");

        if (data.soldiers + miktar > 2000000) {
            return message.reply(`❌ Sınır ihlali! En fazla **2.000.000** askere sahip olabilirsiniz. Mevcut askeriniz: \`${data.soldiers.toLocaleString()}\``);
        }

        const maliyet = miktar * 10;
        if (data.money < maliyet) {
            return message.reply(`❌ Paran yetersiz! **${miktar.toLocaleString()}** asker için **${maliyet.toLocaleString()} Lira** gerekiyor. Sende olan: \`${data.money.toLocaleString()} Lira\``);
        }

        data.money -= maliyet;
        data.soldiers += miktar;
        saveDB();
        return message.reply(`🪖 Ordunuza **${miktar.toLocaleString()}** yeni asker katıldı! Harcanan: \`${maliyet.toLocaleString()} Lira\``);
    }

    // 8. .nükleerekle / .nukleerekle (10M Lira)
    if (command === "nükleerekle" || command === "nukleerekle") {
        const data = getUserData(message.author.id);
        if (!data.hasCountry) return message.reply("❌ Önce bir uygarlığınızın olması gerekir.");

        const adet = parseInt(args[0]) || 1;
        const maliyet = adet * 10000000; // 10M

        if (data.money < maliyet) {
            return message.reply(`❌ Paran yetersiz! ${adet} adet Nükleer için **${maliyet.toLocaleString()} Lira** gerekli.`);
        }

        data.money -= maliyet;
        data.nukes += adet;
        saveDB();
        return message.reply(`☢️ Başarıyla **${adet}** adet Nükleer Silah envantere eklendi!`);
    }

    // 9. .füzeekle / .fuzeekle (2M Lira)
    if (command === "füzeekle" || command === "fuzeekle") {
        const data = getUserData(message.author.id);
        if (!data.hasCountry) return message.reply("❌ Önce bir uygarlığınızın olması gerekir.");

        const adet = parseInt(args[0]) || 1;
        const maliyet = adet * 2000000; // 2M

        if (data.money < maliyet) {
            return message.reply(`❌ Paran yetersiz! ${adet} adet Füze için **${maliyet.toLocaleString()} Lira** gerekli.`);
        }

        data.money -= maliyet;
        data.missiles += adet;
        saveDB();
        return message.reply(`🚀 Başarıyla **${adet}** adet Savunma/Saldırı Füzesi envantere eklendi!`);
    }

    // 10. .inşaaet
    if (command === "inşaaet" || command === "insaaet") {
        const data = getUserData(message.author.id);
        if (!data.hasCountry) return message.reply("❌ Önce bir uygarlığınızın olması gerekir.");

        const secenek = args[0]?.toLowerCase();
        const adet = parseInt(args[1]) || 1;

        if (!["kule", "kale", "sur"].includes(secenek) || adet <= 0) {
            return message.reply("ℹ️ Kullanım: `.inşaaet [kule/kale/sur] [adet]`\nFiyatlar: Kule: 50K, Kale: 100K, Sur: 250K");
        }

        const fiyatlar = { kule: 50000, kale: 100000, sur: 250000 };
        const toplamMaliyet = fiyatlar[secenek] * adet;

        if (data.money < toplamMaliyet) {
            return message.reply(`❌ Yetersiz bakiye! Maliyet: **${toplamMaliyet.toLocaleString()} Lira**`);
        }

        data.money -= toplamMaliyet;
        data.buildings[secenek] += adet;
        saveDB();
        return message.reply(`🏗️ **${adet}** adet **${secenek}** inşa edildi!`);
    }

    // 11. .ulkelist
    if (command === "ulkelist") {
        let listStr = "";
        for (const [userId, data] of Object.entries(db.users)) {
            if (data.hasCountry) {
                listStr += `• <@${userId}> | **${data.countryName}** — 🪖 ${data.soldiers.toLocaleString()} Asker | ☢️ ${data.nukes} Nükleer\n`;
            }
        }
        const embed = new EmbedBuilder()
            .setTitle("🌍 Aktif Uygarlıklar")
            .setColor("Gold")
            .setDescription(listStr || "Henüz uygarlık yok.")
            .setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // 12. Gelişmiş .savasilan (DM Onaylı Savaş Sistemi)
    if (command === "savasilan" || command === "savaşilan") {
        const ulke1_adi = args[0];
        const vs = args[1]?.toLowerCase();
        const ulke2_adi = args[2];

        if (!ulke1_adi || vs !== "vs" || !ulke2_adi) {
            return message.reply("ℹ️ Kullanım: `.savasilan [SaldıranÜlke] vs [SavunanÜlke]`\nÖrnek: `.savasilan Roma vs Osmanlı`");
        }

        const baskan1_id = findUserByCountry(ulke1_adi);
        const baskan2_id = findUserByCountry(ulke2_adi);

        if (!baskan1_id || !baskan2_id) {
            return message.reply("❌ Belirtilen ülkelerden biri veya ikisi sistemde bulunamadı!");
        }

        if (activeWars.has(message.guild.id)) {
            return message.reply("❌ Bu sunucuda zaten aktif devam eden bir savaş var!");
        }

        try {
            const baskan1 = await client.users.fetch(baskan1_id);
            const baskan2 = await client.users.fetch(baskan2_id);

            message.channel.send(`⚔️ **Savaş İlanı Talebi!** **${ulke1_adi}** ve **${ulke2_adi}** başkanlarının DM kutusuna onay mesajı gönderildi. İki başkanın da 60 saniye içinde onaylaması gerekiyor!`);

            let baskan1_onay = false;
            let baskan2_onay = false;

            // DM Onay Mesajları
            const dmEmbed = new EmbedBuilder()
                .setTitle("⚔️ SAVAŞ ONAYI")
                .setDescription(`**${ulke1_adi} vs ${ulke2_adi}** savaşı başlatılmak isteniyor. Onaylıyorsanız lütfen **evet** yazın. Reddetmek için **hayır** yazın.`)
                .setColor("Red");

            const msg1 = await baskan1.send({ embeds: [dmEmbed] });
            const msg2 = await baskan2.send({ embeds: [dmEmbed] });

            const filtre = m => m.content.toLowerCase() === 'evet' || m.content.toLowerCase() === 'hayır';

            const col1 = msg1.channel.createMessageCollector({ filter: filtre, time: 60000, max: 1 });
            const col2 = msg2.channel.createMessageCollector({ filter: filtre, time: 60000, max: 1 });

            col1.on('collect', m => {
                if (m.content.toLowerCase() === 'evet') { baskan1_onay = true; m.reply("✅ Onayınız alındı, diğer başkan bekleniyor."); }
                else m.reply("❌ Savaşı reddettiniz.");
            });

            col2.on('collect', m => {
                if (m.content.toLowerCase() === 'evet') { baskan2_onay = true; m.reply("✅ Onayınız alındı, diğer başkan bekleniyor."); }
                else m.reply("❌ Savaşı reddettiniz.");
            });

            // 60 Saniye sonra kontrolleri yap ve savaşı başlat
            setTimeout(() => {
                if (baskan1_onay && baskan2_onay) {
                    message.channel.send(`🚀 **SAVAŞ BAŞLADI!** **${ulke1_adi}** vs **${ulke2_adi}** savaşı resmi olarak başladı. Savaş tam **10 dakika** sürecektir! Tüm askeri ve nükleer güçler devreye giriyor!`);
                    
                    // Savaş mekaniği ve zamanlayıcıyı kur
                    const warTimeout = setTimeout(() => {
                        // Savaş bittiğinde kazananı rastgele ordu gücüne göre hesapla
                        const p1 = getUserData(baskan1_id);
                        const p2 = getUserData(baskan2_id);

                        // Asker (x1), Füze (x1000), Nükleer (x10000) güç hesaplaması
                        const guc1 = p1.soldiers + (p1.missiles * 1000) + (p1.nukes * 10000) + 1;
                        const guc2 = p2.soldiers + (p2.missiles * 1000) + (p2.nukes * 10000) + 1;

                        const toplamGuc = guc1 + guc2;
                        const sans = Math.random() * toplamGuc;

                        let kazanan_adi, kaybeden_adi, kazanan_data, kaybeden_data;
                        if (sans <= guc1) {
                            kazanan_adi = ulke1_adi; kaybeden_adi = ulke2_adi;
                            kazanan_data = p1; kaybeden_data = p2;
                        } else {
                            kazanan_adi = ulke2_adi; kaybeden_adi = ulke1_adi;
                            kazanan_data = p2; kaybeden_data = p1;
                        }

                        // Kaybeden her şeyini kaybeder, kazanan ele geçirir
                        kazanan_data.money += kaybeden_data.money;
                        kazanan_data.soldiers += Math.floor(kaybeden_data.soldiers * 0.2); // Askerlerin %20'si esir alınır
                        if (kazanan_data.soldiers > 2000000) kazanan_data.soldiers = 2000000;

                        message.channel.send(`🚨 **SAVAŞ BİTTİ!**\n**${kaybeden_adi}** savaşı kaybetti ve toprakları ele geçirildi! 👑 **KAZANAN:** **${kazanan_adi}**! Kaybeden ülkenin tüm parasına ve bir kısım ordusuna el konuldu.`);
                        
                        // Kaybedeni sıfırla
                        kaybeden_data.hasCountry = false;
                        kaybeden_data.countryName = "Yok";
                        kaybeden_data.money = 0;
                        kaybeden_data.soldiers = 0;
                        kaybeden_data.nukes = 0;
                        kaybeden_data.missiles = 0;
                        kaybeden_data.buildings = { kule: 0, kale: 0, sur: 0 };
                        
                        saveDB();
                        activeWars.delete(message.guild.id);
                    }, 600000); // 10 dakika = 600.000 ms

                    activeWars.set(message.guild.id, { timeout: warTimeout, u1: ulke1_adi, u2: ulke2_adi });

                } else {
                    message.channel.send(`❌ Savaş iptal edildi. Başkanlardan gerekli onaylar 60 saniye içinde gelmedi.`);
                }
            }, 62000);

        } catch (error) {
            return message.reply("❌ Başkanların DM kutusu kapalı olduğu için savaş isteği gönderilemedi!");
        }
    }

    // 13. .savasdurdur
    if (command === "savasdurdur" || command === "savaşdurdur") {
        if (!isOwner) return message.reply("❌ Bu komutu sadece yetkililer kullanabilir.");
        const war = activeWars.get(message.guild.id);
        
        if (!war) return message.reply("❌ Şu an bu sunucuda aktif bir savaş bulunmuyor.");

        clearTimeout(war.timeout);
        activeWars.delete(message.guild.id);
        return message.reply(`🏳️ **Savaş Durduruldu!** Yetkili kararıyla **${war.u1} vs ${war.u2}** savaşı iptal edildi, barış ilan edildi.`);
    }

    // 14. .savasbaris
    if (command === "savasbaris" || command === "savaşbarış") {
        const war = activeWars.get(message.guild.id);
        if (!war) return message.reply("❌ Şu an aktif bir savaş bulunmuyor.");

        return message.reply(`🤝 Başkanlar karşılıklı ateşkes konuşuyor ancak nihai iptal kararı için bir yetkilinin \`.savasdurdur\` yazması gerekiyor.`);
    }

    // 15. -yardim
    if (command === "yardim" || command === "yardım" || message.content === "-yardim") {
        const embed = new EmbedBuilder()
            .setTitle("📜 Güncel Uygarlık ve Savaş Komutları")
            .setColor("Green")
            .addFields(
                { name: "👥 Krallık Komutları", value: "`.profil [@kullanıcı]` - Detaylı uygarlık profili (Asker, Nükleer, Füze dahil).\n`.ulkelist` - Aktif ülkeleri listeler.\n`.askeral [miktar]` - Orduya asker alır (Maks: 2M).\n`.nükleerekle [adet]` - 10M Liraya Nükleer alır.\n`.füzeekle [adet]` - 2M Liraya Füze alır.\n`.inşaaet [yapı] [adet]` - Yapı inşa eder." },
                { name: "⚔️ Savaş Komutları", value: "`.savasilan [Ülke1] vs [Ülke2]` - 10 dakikalık DM onaylı savaş başlatır.\n`.savasbaris` - Barış çağrısı yapar.\n`.savasdurdur` - (Yetkili) Aktif savaşı tamamen iptal eder." },
                { name: "👑 Owner / Yetkili Komutları", value: "`.ulkekur @kullanıcı [İsim]` - Ülke kurar.\n`.ulkesil @kullanıcı` - Ülke siler.\n`.hazinekle [@kullanıcı/boş] [miktar]` - Hazneye para atar (10m, 50k destekler).\n`.hazineçıkar [miktar]` - Hazineden para çıkartır." }
            );
        return message.channel.send({ embeds: [embed] });
    }
});

const TOKEN = process.env.DISCORD_TOKEN || "BURAYA_BOT_TOKENINI_YAZ";
client.login(TOKEN);
                                  
