var utilCommands = require("./utilsmodule.js");
var methods = [];
var client;
var guild;
var anonymizer;

methods.init = function(client, guildID, anon){
    console.log("Initializing commandexecutor module");
    guild = client.guilds.get(guildID);
    anonymizer = anon;
    console.log("anonymizer:" + anonymizer);
    console.log("Done initializing commandexecutor module");
}

methods.runCommand = function(commandObj, commandChannelName){
    console.log(commandObj);
    if(commandObj.commandName == "delete"){
        deleteMessages(commandObj.amount, commandObj.anonName, commandChannelName);
    }if(commandObj.commandName == "kick"){
        kickUser(commandObj.anonName);
    }if(commandObj.commandName == "ban"){
        banUser(commandObj.anonName);
    }else{
        console.log("Could not find command in commandexecutor!")
    }
}

// Delete messages. Delete an extra message in the channel the command was sent in
function deleteMessages(numMessages, username, commandChannelName){

    var amount = parseInt(numMessages);

    if(amount === "undefined" || amount == null){
        console.log("Invalid amount recieved:" + amount);
        return;
    }

    var usernameText = (username == null ? "everyone" : username);

    console.log("Attempting to delete " + amount + " messages from " + usernameText + "...");

    if (amount > 50)
        amount = 50;
    else if (amount < 1)
        amount = 1;

    for (member of guild.members.array()){
        if (channel.name != "rules" && channel.type === "text") {
            
            console.log("Deleting " + amount + " messages from " + usernameText + " in channel " + channel.id);
            if(username === "undefined" || username == null){

                if(channel.name === commandChannelName){
                    channel.bulkDelete(amount + 1)
                    .then(messages => utilCommands.logMsg(`Bulk deleted ${messages.size} messages`))
                    .catch(console.error);
                }else{
                    channel.bulkDelete(amount)
                    .then(messages => utilCommands.logMsg(`Bulk deleted ${messages.size} messages`))
                    .catch(console.error);
                }
            }else{
                console.log("---------------Deleting messages for individual users not yet implemented!!!!");   
            }
        }
    }
}

function kickUser(anonName){
    if(anonName === "undefined" || anonName == null){
        console.log("Could not kick user. anonName is:" + anonName);
        return;
    }

    var userID = anonymizer.getUserIDFromAnonName(anonName);

    if(userID === "undefined" || userID == null){
        console.log("ERROR: Could not find userID " + userID);
        return;
    }

    guild.fetchMember(userID)
        .then(member =>{
            member.kick()
                .then(() => console.log("Kicked:" + anonName + " with userID:" + userID))
                .catch(console.error);
        })
        .catch(console.error);
}

function banUser(anonName){
    if(anonName === "undefined" || anonName == null){
        console.log("Could not kick user. anonName is:" + anonName);
        return;
    }

    var userID = anonymizer.getUserIDFromAnonName(anonName);

    if(userID === "undefined" || userID == null){
        console.log("ERROR: Could not find userID " + userID);
        return;
    }

    guild.fetchMember(userID)
        .then(member =>{
            member.ban()
                .then(() => console.log("Banned:" + anonName + " with userID:" + userID))
                .catch(console.error);
        })
        .catch(console.error);
}

module.exports = methods;