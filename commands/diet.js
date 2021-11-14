const Discord = require('discord.js');
const dietModel = require('../models/dietSchema')

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth()+1).padStart(2, '0')
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

module.exports = {
    name: 'diet',
    aliases: [],
    permissions: [],
    cooldown: 5,
    description: 'Displays your diet.',
    async execute(client, message, args, Discord, profileData,workoutData){

    

        let responsemain = await dietModel.find({userID: message.author.id});
        
        // creates back and forward buttons
        const backId = 'back'
        const forwardId = 'forward'
        const backButton = new Discord.MessageButton({
        style: 'SECONDARY',
//        label: 'Back',
        emoji: '⬅️',
        customId: backId
        })
        const forwardButton = new Discord.MessageButton({
        style: 'SECONDARY',
//        label: 'Forward',
        emoji: '➡️',
        customId: forwardId
        })

        const {author, channel} = message;

        // generates embed 
        const generateEmbed = async start => {
        const current = responsemain[start].meals;

        let x = 0;
        return new Discord.MessageEmbed({
        color: `#0099ff`,
        title: `${message.author.username}'s Diet`,
        description: `Showing diet on ${responsemain[start].date}`,
        footer: {
            text: 'Nutrition is important!',
            iconURL: `https://myplate-prod.azureedge.net/sites/default/files/styles/medium/public/2020-11/myplate-brand--labelled.png?itok=7VtFXcBC`,
        },
        fields: await Promise.all(
        current.map(async g => ({
        name: `Meal ${x+=1}`,
        value: `${g}`
        }))
        )
        }
        )
        }

    const canFitOnOnePage = responsemain.length == 1
    const embedMessage = await channel.send({
    embeds: [await generateEmbed(responsemain.length-1)], 
    components: canFitOnOnePage
    ? []
    : [new Discord.MessageActionRow({components: [forwardButton]})]
    })

    if (canFitOnOnePage) return

    // allows only the author to use buttons
    const collector = embedMessage.createMessageComponentCollector({
    filter: ({user}) => user.id === author.id
    })

    let currentDay = responsemain.length-1;
    collector.on('collect', async interaction => {

    
    interaction.customId === backId ? (currentDay += 1) : (currentDay -= 1)

    await interaction.update({
    embeds: [await generateEmbed(currentDay)],
    components: [
    new Discord.MessageActionRow({
        components: [

            ...(currentDay != responsemain.length-1 ? [backButton] : []),

            ...(currentDay != 0 ? [forwardButton] : [])
        ]
        })
    ]
    })
}) 

    }
}
