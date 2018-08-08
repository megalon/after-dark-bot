// JavaScript source code

var methods = [];
var numGuideChannels = 1;
const settings = require("../settings/settings.json");
var client;
var guild;
var anonMembers = [];

methods.init = function (c, guildIn, anonMembersIn) {
    client = c;

    guild = guildIn;

    anonMembers = anonMembersIn;
}

methods.addMember = function (member) {

    var guild = member.guild;

    var numChannels = guild.channels.size;

    guild.createChannel(member.id, 'text', [{
            // Deny @everyone
            id: guild.id,
            deny: ['VIEW_CHANNEL']
        }, {
            // Allow the member
            id: member.id,
            deny: ['MANAGE_MESSAGES'],
                allow: ['VIEW_CHANNEL','SEND_MESSAGES']
        }, {
            // Allow the bot
            id: '471753959460175883',
                allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES', 'SEND_MESSAGES']
    }]).then(channel => {
        console.log("Trying to move channel " + channel.name + " to position: " + numChannels - 1);
        channel.edit({'topic':member.id})
        guild.setChannelPosition(channel, numChannels-1);
    }).catch(console.error);
}

methods.removeMember = function (member) {

    var guild = member.guild;

    var numChannels = guild.channels.length;

    var channel = null;
    
    for (var i = 0; i < guild.channels.array().length; i++) {
        console.log("memberID:" + member.id + " channelID:" + guild.channels.array()[i].name);
        if (member.id === guild.channels.array()[i].name) {
            channel = guild.channels.array()[i];
        }
    }

    if (channel === "undefined" || channel == null) {
        console.log("Could not find the channel to remove! Returning...")
        return;
    }
    
    channel.delete()
        .then(console.log)
        .catch(console.error);
    /*
    for (var i = 0; i < guild.channels.array().length; i++) {
        guild.channels.array()[i].delete();
    }
    */
}

module.exports = methods;