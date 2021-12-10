const { Client, Util, MessageEmbed, Intents } = require("discord.js");

const caitlyn = require("./Caitlyn.js");

//Get Latest DDRAGON Version
var ddrver;
caitlyn.ddragon.version((latddrver) => {ddrver = latddrver[0]});

require("dotenv").config();
const PREFIX = process.env.PREFIX;

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

bot.on("warn", console.warn);
bot.on("error", console.error);
bot.on("ready", () => console.log(`[Alice] 밍밍이가 ${bot.user.tag} 계정에 연결되었습니다!`));
bot.on("shardDisconnect", (event, id) => console.log(`[SHARD] Shard ${id} disconnected (${event.code}) ${event}, trying to reconnect...`));
bot.on("shardReconnecting", (id) => console.log(`[SHARD] Shard ${id} reconnecting...`));
bot.on("ready", () =>
  bot.user.setPresence({
    status: 'idle',
    activity: {
      name: '버그가 많네요!'
    }
  })
);

bot.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.split(" ");

    //명령어가 부족할 때 도움말 표시
    if (args.length < 2) {
        console.log("help");
    }

    //소환사 정보
    if (args[1] === "정보") {

        //소환사 이름 있나 확인
        if (!args[2]) return onErr(":fire:  |  소환사 이름을 찾을 수 없습니다.", "밍밍아 정보 [소환사 이름]");

        //소환사 이름 띄어쓰기 방지
        if (args.length > 3) args[2] = message.content.replace(PREFIX + " " + args[1] + " ", "");

        //소환사 정보 가져오기
        caitlyn.getSummoner(process.env.RIOT_API, args[2], (catv4) => {

            //불러오지 못했을 경우
            if (catv4.status) return onErr(":fire:  |  소환사 정보를 불러오지 못했습니다!", "소환사 이름을 다시 한번 확인해 주세요.");

            const catembed = new MessageEmbed()
            .setColor("#5132a6")
            .setAuthor(catv4.name + "#KR1", "http://ddragon.leagueoflegends.com/cdn/" + ddrver + "/img/profileicon/" + catv4.profileIconId + ".png")    //프로필 아이콘 가져오기
            .setTitle(":mag_right:  |  **소환사 정보**")
            .addField("레벨", "**" + catv4.level + "** LV")
            .setTimestamp()

            //솔로 랭크 정보가 있다면
            if (catv4.ranked_solo) catembed.addField("Ranked Solo", "**" + catv4.ranked_solo.tier + "** (" + catv4.ranked_solo.lp + "LP)\n**" + catv4.ranked_solo.wins + "**W **" + catv4.ranked_solo.losses + "**L\n( " + String(catv4.ranked_solo.wins / (catv4.ranked_solo.wins + catv4.ranked_solo.losses) * 100).slice(0, 4) + "% )", true)
            //없다면
            else catembed.addField("Ranked Solo", "**Unranked**", true);

            //자유 랭크 정보가 있다면
            if (catv4.ranked_flex) catembed.addField("Ranked Flex", "**" + catv4.ranked_flex.tier + "** (" + catv4.ranked_flex.lp + "LP)\n**" + catv4.ranked_flex.wins + "**W **" + catv4.ranked_flex.losses + "**L\n( " + String(catv4.ranked_flex.wins / (catv4.ranked_flex.wins + catv4.ranked_flex.losses) * 100).slice(0, 4) + "% )", true)
            //없다면
            else catembed.addField("Ranked Flex", "**Unranked**", true);

            //랭크 이미지 가져오기 (솔로 랭크 우선)
            if (catv4.ranked_solo) catembed.setThumbnail("https://mingscord-support.netlify.app/" + String(catv4.ranked_solo.tier).replace(" IV", "4").replace(" III", "3").replace(" II", "2").replace(" I", "1") + ".png");
            else if (catv4.ranked_flex) catembed.setThumbnail("https://mingscord-support.netlify.app/" + String(catv4.ranked_flex.tier).replace(" IV", "4").replace(" III", "3").replace(" II", "2").replace(" I", "1") + ".png");
            else catembed.setThumbnail("https://mingscord-support.netlify.app/UNRANKED.png");

            //지금 플레이하는 중 인지 확인
            if (catv4.now) {
                caitlyn.ddragon.queueInfo(catv4.now.queueId, (queinf) => {
                    catembed.setDescription("**" + queinf + "** 플레이 중 ( **" + catv4.now.time + "**분 )");
                    return message.channel.send({ embeds: [catembed] });
                });
            }

            else return message.channel.send({ embeds: [catembed] });

        });

    }

    function onErr (title, desc) {

        const erembed = new MessageEmbed()
        .setColor("#a12a3a")
        .setThumbnail("https://mingscord-support.netlify.app/beee.png")
        .setTitle(title)
        .setDescription(desc)
        .setTimestamp()
        return message.channel.send({ embeds: [erembed] });

    }

});

bot.login(process.env.BOT_TOKEN);