const botconfig = require("../botconfig.json")
const defaultconfig = require("../_server/default-config.json")
const fetch = require("node-fetch");
const fs = require('fs');
const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })

module.exports.run = async (client, message, args) => {

    const endpoint = 'https://ns-api.nl/reisinfo/api/v2/disruptions?type=werkzaamheid&actual=true&lang=nl'

    fetch(endpoint, {
        headers: {
            'x-api-key': process.env.NS
        }
    }).then(function (response) {
        return response.json();
    }).then(function (nsjson) {

        // fetch results
        let data = JSON.stringify(nsjson);
        fs.writeFileSync('./json_export/ns_api_werk.json', data);

        let NS_werk_embed = new Discord.RichEmbed()
            .setTitle("NS Werkzaamheden")
            .setDescription("De actuele werkzaamheden zijn als volgt. [NS Werkzaamheden](https://www.ns.nl/reisinformatie/werk-aan-het-spoor) \n➖")

        let payloads = nsjson.payload
        if (typeof payloads !== 'undefined' && payloads.length > 0) {
            // the array is defined and has at least one element

            for (i in payloads) {
                let payload = payloads[i]
                let type = payload.type

                if (type == "werkzaamheid") {
                    let title = payload.titel
                    let gevolg = payload.verstoring.gevolg
                    let periode = payload.verstoring.periode

                    NS_werk_embed.addField("👷 Werkzaamheden traject " + title, gevolg + " " + "Werkzaamheden " + periode + "\n➖")

                } else {
                    let title_2 = payload.melding.titel
                    let beschrijving = payload.melding.beschrijving

                    NS_werk_embed.addField("❗ " + title_2, beschrijving + "\n➖")
                }
            }

        } else {
            NS_werk_embed.addField("Gefeliciteerd 🎉", "Er zijn momenteel geen werkzaamheden")
        }

        NS_werk_embed.setTimestamp()
        NS_werk_embed.setThumbnail(defaultconfig.embed_avatar)
        NS_werk_embed.setColor(defaultconfig.embed_color);
        NS_werk_embed.setFooter(client.user.username, defaultconfig.embed_emblem);

        message.channel.send(NS_werk_embed)

    }).catch(function (response) {
        console.error("Er ging iets mis met het ophalen van de werkzaamheden")
    })

}

module.exports.help = {
    name: "werk"
}