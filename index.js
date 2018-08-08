    // JavaScript source code
const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require("./settings/settings.json");
var anonymizer  = require("./modules/anonymizer.js");
var commandParser = require("./modules/commandparser.js");
var commandExecutor = require("./modules/commandexecutor.js");
	
client.login(settings.token);

client.on('ready', () => {
    
    console.log("+++++++++++++ Ready! +++++++++++++");

	client.user.setActivity('', { type: '' })
	  .then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(console.error);

	guildID = settings.guild;
		
    anonymizer.init(client, guildID);
    commandExecutor.init(client, guildID, anonymizer);
});

client.on('guildMemberAdd', member => {
    anonymizer.addMember(member);
});

client.on('guildMemberRemove', member => {
    //anonymizer.removeMember(member);
});

client.on('typingStart', (channel, user) => {
    if(user == client.user){
        return;
    }
    //anonymizer.removeMember(member);
    //console.log("User:" + user.id + " started typing in channel:" + channel.name);
    anonymizer.startTypingInOtherChannels(channel.name);
});

client.on('typingStop', (channel, user) => {
    if(user == client.user){
        return;
    }
    //anonymizer.removeMember(member);
    //console.log("User:" + user.id + " stopped typing in channel:" + channel.name);
    anonymizer.stopTypingInOtherChannels(channel.name);
});

client.on('message', message => {

    // Ignore Webhooks
    if (message.webhookID !== null){
        return;
    }

    // Check that this isn't the bot itself
    if (message.author == client.user){
        return;
    }

    // Check if this is a dm
    if(message.channel.type == "dm"){
        console.log("Message is a DM, returning...");
        return;
    }

    if (message.guild.id == guildID) {
        console.log("Message is in correct guild!");

        if(checkAdmin(message)){
            console.log("Found admin message, checking for commands...")
            parseCommand(message);
        }else{
            console.log("Message is from normal user, processing as usual...")
            anonymizer.processMessage(message);
        }

        message.delete();
    }
	
	/* Log all role ids (the only way to get role IDs)
	for(var [key, value] of message.guild.roles){
		console.log("role:" + value.name + " id:" + key);
	}
	*/
});

function checkAdmin(message){
    var isAdmin = false;
    // Check if message is from an admin
    if(settings.adminIDs.includes(message.member.id)){
        isAdmin = true;
    }

    return isAdmin;
}

function parseCommand(message){
    var command = commandParser.parseCommand(message);
    var commandChannelName = message.channel.name;
    console.log("Command return:" + command);
    if(command != null){
        if(command !== "invalid"){
            commandExecutor.runCommand(command, commandChannelName);
        }else{
            console.log("ERROR: Invalid command in message:" + message.content);
        }
    }else{
        anonymizer.processMessage(message);
    }
}