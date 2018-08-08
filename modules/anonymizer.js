// Wrapper class that adds the anonymous name to messages and channels

var Moniker = require('moniker');
var channelManager = require("./channelmanager.js");
var messageHandler  = require("./messagehandler.js");
var fs = require('fs');
const crypto = require('crypto');

var guild;

var anonMembers = JSON.parse(fs.readFileSync('anonnames.json', 'utf8'));

methods = [];

methods.init = function(client, guildID){

    console.log("----------------anonMembers----------------");
    console.log(anonMembers);

    guild = client.guilds.get(guildID);

    // Check if members were added or removed while bot was offline
    guild.fetchMembers()
        .then(guild => {
            //console.log(guild.members);

            // Check if members were added while offline
            //for (member of guild.members) { 
            for (member of guild.members.array()){
            //guild.members.forEach(function (member) {
                console.log("MemberID: " + member.id);
                
                // Check if a channel exists for each member. If not, create it.
                if (guild.channels.exists('name', member.id)) {
                    console.log("Found channel for member:" + member.id);
                } else {
                    console.log("Didn't find channel for member:" + member.id + " !");
                    console.log("Creating channel for member...");
                    channelManager.addMember(member);
                }

                var foundMoniker = false;
                // Check if the members exist in the anonnames.json file 
                for(var i = 0; i < anonMembers.length; ++i){

                    if(anonMembers[i].member === member.id){
                        foundMoniker = true;
                        console.log("Found moniker for member:" + member.id);

                        anonMembers[i].color = this.getColor(anonMembers[i].anonName);
                    }
                } 

                if(!foundMoniker){
                    console.log("Didn't find moniker for member:" + member.id + " !");
                        
                    console.log("Adding member to anonMembers array...");
                    methods.pushMember(member);
                    methods.saveNames();
                }
            }

            // Check if members were removed while offline
            //for (channel of guild.channels) {
            for (channel of guild.channels.array()){
                if(!guild.members.exists('id', channel.name) && channel.name !== "rules" && channel.name !== "rules" ){
                    // Channel is not needed, so delete it.
                    channel.delete()
                        .then(console.log)
                        .catch(console.error);
                }
            }
        })
        .catch(console.error);


    messageHandler.init(client, guild, anonMembers);
    channelManager.init(client, guild, anonMembers);
}

methods.pushMember = function(member){
    var name = Moniker.choose();
    anonMembers.push({'member':member.id, 'anonName':name, 'color':this.getColor(name)});
}

methods.popMember = function(member){

    var index = -1;

    for(var i = 0; i < anonMembers.length; ++i){
        if(anonMembers[i].member.id == member.id)
            index = i;
    }
    if (index > -1) {
        anonMembers.splice(index, 1);
    }
}

methods.addMember = function(member){
    member.setNickname('̷̧̟̭̺͕̜̦̔̏̊̍ͧ͊́̚̕͞');

    console.log("Adding member to anonMembers array...");
    methods.pushMember(member);
    console.log("Creating channel for member...");
    channelManager.addMember(member);
    console.log("Member added.");

    // Message new user the rules

    methods.saveNames();
}

methods.removeMember = function(member){
    
    // Commented out because if a member leaves they should not get a new nickname
    // console.log("Removing member to anonMembers array...");
    // methods.popMember(member);
    console.log("Removing member channel from channels...");
    channelManager.removeMember(member);
    console.log("Member removed.");

    methods.saveNames();
}

methods.processMessage = function(message){

    var member = message.member;
    var anonMember = null;

    console.log("Looping through anonMembers list of length " + anonMembers.length);
    for(var i = 0; i < anonMembers.length; ++i){
        console.log("member " + i + " id:" + anonMembers[i].member);
        if(anonMembers[i].member == member.id)
            anonMember = anonMembers[i];
    }

    messageHandler.processMessage(anonMember, message, anonMembers);
}

methods.getUserIDFromAnonName = function(name){
    var foundID = null;
    for(var i = 0; i < anonMembers.length; ++i){
        if(anonMembers[i].anonName === name){
            foundID = anonMembers[i].member;
        }
    }

    return foundID;
}

methods.startTypingInOtherChannels = function(channelName){
    // Check if members were removed while offline
    for (channel of guild.channels.array()){
        //console.log(channel.name +"!=="+ channelName + " : " + (channel.name !== channelName));
        if(channel.name !== channelName){
            channel.startTyping();
        }
    }
}

methods.stopTypingInOtherChannels = function(channelName){
    // Check if members were removed while offline
    for (channel of guild.channels.array()){
        //console.log(channel.name +"!=="+ channelName + " : " + (channel.name !== channelName));
        if(channel.name !== channelName){
            channel.stopTyping();
        }
    }
}

methods.getColor = function(inputString){
    var hash = crypto.createHmac('sha256', inputString)
    .update('married-lawyer')
    .digest('hex');

    //console.log("Hash generated for " + inputString + " : " + hash);
    var color = hash.substring(0, 6);
    console.log("Color for " + inputString + " : " + color);

    return color;
}

methods.saveNames = function(){

    var jsonData = JSON.stringify(anonMembers);

    fs.writeFile("anonnames.json", jsonData, function(err) {
        if(err) {
            return console.log(err);
        }
    });
}

module.exports = methods;