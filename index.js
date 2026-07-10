const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ComponentType
} = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = ".";

// ==========================================
// YENİ ROL VE KANAL TANIMLAMALARI
// ==========================================
const ROLLER = {
    YETKILI: "1525105467393835120",       // Kayıt komutunu ve butonları yöneten yetkili rolü
    KAYITSIZ: "1525112827784728586",      // Kayıt tamamlandığında ALINACAK rol
    FUTBOLCU: "1525106349258834031",      // Futbolcu butonuna basınca verilecek rol
    TEKNIK_DIREKTOR_1: "1525106349258834031", // Teknik Direktör butonuna basınca verilecek 1. rol
    TEKNIK_DIREKTOR_2: "1525105955023618130"  // Teknik Direktör butonuna basınca verilecek 2. rol
};

const KANALLAR = {
    KAYIT_LOG: "1525092983018487809",     // Giriş mesajlarının ve detaylı kayıt logunun düşeceği kanal
    SOHBET: "1525106525557882973"         // Kayıt işlemi bittiğinde tebrik mesajının gideceği ana sohbet
};

// ==========================================
// KULLANICI İSTATİSTİK VERİTABANI
// ==========================================
let data = { oyuncular: {} };
if (fs.existsSync('./database.json')) {
    try { data = JSON.parse(fs.readFileSync('./database.json', 'utf8')); } catch (e) { data = { oyuncular: {} }; }
}
function saveDB() { fs.writeFileSync('./database.json', JSON.stringify(data, null, 2)); }

// ==========================================
// 1. SUNUCUYA BİRİ GİRDİĞİNDE (HOŞ GELDİN BUTONU)
// ==========================================
client.on('guildMemberAdd', async (member) => {
    const logKanal = member.guild.channels.cache.get(KANALLAR.KAYIT_LOG);
    if (!logKanal) return;

    // Girişte kayıtsız rolünü otomatik verelim (garanti olsun)
    await member.roles.add(ROLLER.KAYITSIZ).catch(() => null);

    const hgEmbed = new EmbedBuilder()
        .setColor('#1e1f22')
        .setAuthor({ name: `Yeni Bir Kullanıcı Katıldı, 👋`, iconURL: member.guild.iconURL() })
        .setDescription(`\n${member}!\n\nAstra League'e hoş geldin kralım\n`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Nors` });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`normal_kayit_${member.id}`)
            .setLabel('Normal Kayıt')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🪪')
    );

    logKanal.send({ 
        content: `<@&${ROLLER.YETKILI}>, ${member} sunucuya giriş yaptı.`, 
        embeds: [hgEmbed],
        components: [row]
    });
});

// ==========================================
// GİRİŞTEKİ "NORMAL KAYIT" BUTONU ETKİLEŞİMİ
// ==========================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const [prefix, eylem, hedefId] = interaction.customId.split('_');
    if (prefix !== 'normal' || eylem !== 'kayit') return;

    if (!interaction.member.roles.cache.has(ROLLER.YETKILI)) {
        return interaction.reply({ content: `❌ Bu butonu sadece <@&${ROLLER.YETKILI}> rolüne sahip yetkililer kullanabilir.`, ephemeral: true });
    }

    return interaction.reply({
        content: `📝 Lütfen aşağıdaki komutu kopyalayıp sohbete yapıştırın ve ismi düzenleyin:\n\n\`\`\`.k <@${hedefId}> İsim | POZ | 🇹🇷 | 50G\`\`\``,
        ephemeral: true
    });
});

// ==========================================
// 2. .K KOMUTU VE FUTBOLCU / TEKNİK DİREKTÖR SEÇİM BUTONLARI
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'k') {
        if (!message.member.roles.cache.has(ROLLER.YETKILI)) {
            return message.reply(`❌ Bu komutu sadece <@&${ROLLER.YETKILI}> yetkilileri kullanabilir.`);
        }

        const hedef = message.mentions.members.first();
        const yeniIsim = args.slice(1).join(" ");

        if (!hedef || !yeniIsim) {
            return message.reply("❌ **Yanlış Kullanım!** Örnek:\n`.k @kullanıcı C.Ronaldo | SNT | 🇵🇹 | 52G` ");
        }

        // Futbolcu ve Teknik Direktör Seçim Butonları
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`kayit_futbolcu_${hedef.id}`)
                .setLabel('Futbolcu Kayıt')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚽'),
            new ButtonBuilder()
                .setCustomId(`kayit_td_${hedef.id}`)
                .setLabel('Teknik Direktör Kayıt')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📋')
        );

        const msg = await message.reply({
            content: `⏳ ${hedef} kullanıcısının mesleğini/rolünü aşağıdaki butonlardan seçin:`,
            components: [row]
        });

        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            
            const [,, secilenHedefId] = i.customId.split('_');
            const üye = message.guild.members.cache.get(secilenHedefId);
            if (!üye) return i.followUp({ content: "❌ Kullanıcı sunucudan ayrılmış.", ephemeral: true });

            let verilenRollerMetni = "";

            // Buton türüne göre rol işlemlerini ayarlayalım
            if (i.customId.startsWith('kayit_futbolcu_')) {
                // Futbolcu rolü verilir
                await üye.roles.add(ROLLER.FUTBOLCU).catch(() => null);
                verilenRollerMetni = `<@&${ROLLER.FUTBOLCU}>`;
            } else if (i.customId.startsWith('kayit_td_')) {
                // Teknik direktör için 2 rol birden verilir
                await üye.roles.add([ROLLER.TEKNIK_DIREKTOR_1, ROLLER.TEKNIK_DIREKTOR_2]).catch(() => null);
                verilenRollerMetni = `<@&${ROLLER.TEKNIK_DIREKTOR_1}>, <@&${ROLLER.TEKNIK_DIREKTOR_2}>`;
            }

            // İstediğin gibi: BUTONA BASILDIKTAN SONRA KAYITSIZ ROLÜ ALINIR
            await üye.roles.remove(ROLLER.KAYITSIZ).catch(() => null);
            
            // İsmi değiştirilir
            await üye.setNickname(yeniIsim).catch(() => null);

            // Yetkilinin istatistiğini kaydet
            if (!data.oyuncular[message.author.id]) data.oyuncular[message.author.id] = { kayitSayisi: 0 };
            data.oyuncular[message.author.id].kayitSayisi += 1;
            saveDB();

            // LOG KANALINA GİDEN EMBED (Kayıt Bilgileri)
            const logKanal = message.guild.channels.cache.get(KANALLAR.KAYIT_LOG);
            if (logKanal) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#1e1f22')
                    .setTitle('💙 Kayıt Yapıldı!')
                    .setDescription(
                        `**Kayıt Bilgileri**\n\n` +
                        `• **Kayıt Edilen Kullanıcı:** ${üye}\n` +
                        `• **Kayıt Eden Kullanıcı:** ${message.author}\n` +
                        `• **Verilen Roller:** ${verilenRollerMetni}\n` +
                        `• **Yeni İsim:** \`${yeniIsim}\`\n` +
                        `• **Kayıt Türü:** Normal`
                    )
                    .setThumbnail(üye.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `${message.author.username}, normal kayıt sayın: ${data.oyuncular[message.author.id].kayitSayisi}`, iconURL: message.author.displayAvatarURL() });
                
                logKanal.send({ embeds: [logEmbed] });
            }

            // ANA SOHBET KANALINA GİDEN EMBED (Tebrik/Hoşgeldin)
            const sohbetKanal = message.guild.channels.cache.get(KANALLAR.SOHBET);
            if (sohbetKanal) {
                const sohbetEmbed = new EmbedBuilder()
                    .setColor('#1e1f22')
                    .setAuthor({ name: 'Kayıt Yapıldı!', iconURL: message.guild.iconURL() })
                    .setDescription(`🔹 ${üye} aramıza **${verilenRollerMetni}** rolleriyle katıldı.\n\n• **Kaydı gerçekleştiren yetkili**\n${message.author}\n\n• **Aramıza hoş geldin**\n${üye}`)
                    .setThumbnail(üye.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Nors Kayıt Sistemi' });

                sohbetKanal.send({ content: `${üye} aramıza katıldı.`, embeds: [sohbetEmbed] });
            }

            // Arayüzü temizle ve collector'ı bitir
            await msg.edit({ content: `✅ ${üye} kullanıcısının kaydı başarıyla tamamlandı! Rolleri verildi ve kayıtsız rolü alındı.`, components: [] });
            collector.stop();
        });
    }
});

client.once('ready', () => {
    console.log(`[BOT] ${client.user.tag} yeni çift butonlu ve otomatik kayıtsız almalı sistemle aktif!`);
});

client.login(process.env.TOKEN);

