// JavaScript source code

var methods = [];
const Discord = require('discord.js');
const snekfetch = require('snekfetch');
const settings = require("../settings/settings.json");
var utilCommands = require("./utilsmodule.js");
const path = require('path');
const fileType = require('file-type');
const fs = require('fs');
var Color = require('color');
var client;
var guild;
var imagesChannel;
var pathToSaveFiles;
var isWin = process.platform === "win32"; // Check if the OS is windows

methods.init = function(c, guildIn){
    client = c;
    guild = guildIn;
    imagesChannel = guild.channels.find("name", "images");
    pathToSaveFiles = settings.pathToSaveFiles;

    if(pathToSaveFiles !== "undefined" && pathToSaveFiles !== null){
        var filePathSlash = isWin ? '\\' : '/';
        // Add slash on end of path if if was not included
        if(pathToSaveFiles[pathToSaveFiles.length - 1] !== filePathSlash){
            pathToSaveFiles += filePathSlash;
        }
    }
}

methods.processMessage = function(anonSender, message, anonMembers){

    // Strip all @ pings
    utilCommands.logMsg("Processing message...");
    utilCommands.logMsg("Attempting to replace all @ characters");
    var content = utilCommands.replaceAll(message.content, "@", " ");

    methods.sendMessageAllChannels(anonSender, message, content, anonMembers);

    //methods.sendAttachmentAllChannels(anonSender, message);

    utilCommands.logMsg("Finished processing message in messagehandler.js");
}

// Old ping function
methods.pingMember = function(anonSenderName, receiverMemberID){
    var contentStripped = "<@" + receiverMemberID + "> `You were pinged by " + anonSenderName + ". Only you can see this message.`";
    methods.serverMessage(contentStripped, receiverMemberID);
    //methods.sendMessageIndividual(anonSenderName, contentStripped, anonReceiverName, receiverMemberID);
}

// WIP
methods.serverMessage = function(messageText, receiverMemberID){
    for (channel of guild.channels.array()) {
        if (channel.name === receiverMemberID) {
            utilCommands.logMsg("Sending server message to channel " + channel.id + " for userID " + receiverMemberID);
            channel.send("**SERVER** " + messageText);
        }
    }
}

// WIP private message
methods.sendMessageIndividual = function(anonSenderName, contentStripped, anonReceiverName, receiverMemberID){

    utilCommands.logMsg(anonSenderName + " is sending an individual message to: " + anonReceiverName + " userID: " + receiverMemberID);

    var text = contentStripped;

    if (text !== "undefined" && text != null && text != "") {
        utilCommands.logMsg("text is defined, looking through guilds...");

        for (channel of guild.channels.array()) {
            if (channel.name === receiverMemberID) {
                utilCommands.logMsg("Sending individual message to channel " + channel.id + " for userID " + receiverMemberID);
                channel.send("**PRIV** `<" + anonSenderName + ">` " + text);
            }
        }

    } else {
        utilCommands.logMsg("text was undefined or null.");
    }
}

methods.sendMessageAllChannels = function(anonSender, message, contentStripped, anonMembers){
    // Get any http or https link
    var regExForLinks = /http(s?)\S*/;
    var urls = regExForLinks.exec(contentStripped);
    console.log(urls);

    methods.sendTextMessageAllChannels(anonSender, message, contentStripped, anonMembers);

    // Send the embedded urls as an image
    if(urls !== "undefined" && urls != null && urls.length > 0){
        console.log("++++++++++ Found attachment in message text, attempting to send...");
        sendLinkAsAttachmentByURL(anonSender, urls[0]);
    }

    console.log("message.attachments: " + message.attachments + " message.attachments.size:" + message.attachments.size);
    if (message.attachments !== "undefined" && message.attachments != null) {
        if (message.attachments.size > 0){
            reuploadImages(anonSender, message);
        }else{
            message.delete();
        }
    }
}

methods.sendTextMessageAllChannels = function(anonSender, message, contentStripped, anonMembers){
    
    var text = contentStripped;
    var channelSpecificText = "";

    if (text !== "undefined" && text != null && text != "") {
        utilCommands.logMsg("text is defined, looking through guild " + guild.name + " ...");
        utilCommands.logMsg("guild.channels " + guild.channels + " ...");

        for (channel of guild.channels.array()) {

            console.log("channel.name:" + channel.name);
            channelSpecificText = text;

            if (channel.name != "images" && channel.name != "icons" && channel.type === "text") {

                // Handle pings
                for(var i=0; i < anonMembers.length; ++i){
                    var anonReceiverName = anonMembers[i].anonName;
                    var anonReceiverID = anonMembers[i].member;

                    // console.log("Checking channel name:" + channel.name + " against userid:" + anonReceiverID);

                    // Replace username with a ping if this channel is for that user
                    if(anonReceiverID === channel.name){
                        console.log("Attempting to replace " + anonReceiverName + " with " + anonReceiverID + " if it exists...");
                        channelSpecificText = utilCommands.replaceAll(channelSpecificText, anonReceiverName, "<@!" + anonReceiverID + ">");
                    }
                }

                utilCommands.logMsg("Sending message from memberID:" + message.member.id + " channelID:" + channel.name);

                //webhookSend(channel, channelSpecificText, anonSender.anonName, null);

                console.log("sendMessageAllChannels anonSender.anonName:" + anonSender.anonName);
                
                var embededMessage = new Discord.RichEmbed();
				
				// Using this since assistant.moe is down
				embededMessage.setAuthor(anonSender.anonName, getAvatarURL(anonSender.anonName, anonSender.color));

				/* Back when assistant.moe was up
                if(anonSender.iconURL === "undefined" || anonSender.iconURL == null)
                    embededMessage.setAuthor(anonSender.anonName, getAvatarURL(anonSender.anonName, anonSender.color));
                else
                    embededMessage.setAuthor(anonSender.anonName, anonSender.iconURL);
				*/
				
                //embededMessage.setThumbnail(getAvatarURL(anonSender.anonName, anonSender.color));
                //embededMessage.setFooter("!",getAvatarURL(anonSender.anonName, anonSender.color));
                embededMessage.setDescription(channelSpecificText);
                embededMessage.setColor(anonSender.color.hex());

                console.log("+++++++++ anonSender.color.hex():" + anonSender.color.hex())

                channel.send({
                    embed: embededMessage
                  })
                    .catch(console.error);
            }

        }
        utilCommands.logMsg("Sent message to appropriate channels.");
    } else {
        utilCommands.logMsg("text was undefined or null.");
    }
}

function reuploadImages(anonSender, message) {
    var attachments = message.attachments;

    utilCommands.logMsg("Trying to add attachments.");
    for (attachment of attachments.array()) {
        console.log("Attempting to send the attachment:" + attachment.url);

        // Send the attachment then delete the original message when it's done.
        sendAttachmentByURL(anonSender, attachment.url)
            //.then(message.delete())
            //.catch(console.log);
    }
}

// Gross duplicate function that should be simplified
// sendLinkAsAttachmentByURL and sendAttachmentByURL should use the same helper function
const sendLinkAsAttachmentByURL = async (anonSender, attachmentURL) => {

    // Regex to pull extension from the path
    var regExForExtensions = /(\.[^\.]+$)/;

    if (attachmentURL === "undefined" && attachmentURL == null) {
        return null;
    }
    utilCommands.logMsg("======== Trying to send attachmentURL " + attachmentURL);
    let { body } = await snekfetch.get(attachmentURL);
    // body is now the image buffer
    //utilCommands.logMsg("======== snekfetch results: " + body);

    // strip the file name and extension
    // base is the filename
    let { base } = path.parse(attachmentURL)
    console.log("====== base:" + base);

    var extensions = regExForExtensions.exec(base);
    if(extensions === "undefined" || extensions == null){
        var type = fileType(body);
        console.log("====== type.ext:" + type.ext);

        base += "." + type.ext;
    }

    return new Promise(function(resolve, reject) {
        sendAttachmentByURLParent(anonSender, attachmentURL, body, base, resolve, reject);
    });
}

const sendAttachmentByURL = async (anonSender, attachmentURL) => {
    if (attachmentURL === "undefined" && attachmentURL == null) {
        return null;
    }

    utilCommands.logMsg("======== Trying to send attachmentURL " + attachmentURL);
    let { body } = await snekfetch.get(attachmentURL);
    // body is now the image buffer
    //utilCommands.logMsg("======== snekfetch results: " + body);

    // strip the file name and extension
    // base is the filename
    let { base } = path.parse(attachmentURL);

    return new Promise(function(resolve, reject) {
        sendAttachmentByURLParent(anonSender, attachmentURL, body, base, resolve, reject);
    });
}

const sendAttachmentByURLParent = async (anonSender, attachmentURL, body, base, resolve, reject) => {
    if(pathToSaveFiles !== "undefined"){
        methods.saveBufferToFile(body, base);
    }

    // Send the image to the images channel
    imagesChannel.send("`" + anonSender.anonName + "` is sending image with url\n`" + attachmentURL + "`");
    imagesChannel.send(new Discord.Attachment(body, base))
        .then( imageMessage =>{
            //utilCommands.logMsg("======== attachment: " + imageMessage);
            methods.sendAttachmentAllChannels(anonSender, imageMessage);
            resolve("Message reuploaded!");
        })
        .catch(function(error){
            reject("Error reuploading image!");
            console.log(error);
        });
}

methods.saveBufferToFile = function(buff, filename){
    console.log("Attempting to save file " + filename + " to disk...");
    fs.writeFile(pathToSaveFiles + utilCommands.getTimeFilenameFriendly() + "-" + filename, buff, 'base64', function(err) {
        console.log(err);
    });
}

methods.sendAttachmentAllChannels = function(anonSender, message){
    var attachmentUrl = message.attachments.array()[0].url;

    for (channel of guild.channels.array()) {
        utilCommands.logMsg("memberID:" + message.member.id + " channelID:" + channel.name + " attachmentUrl:" + attachmentUrl);
        if (channel.name != "images" && channel.name != "icons" && channel.type === "text") {

            //console.log("anonSender.anonName:" + anonSender.anonName);

            var embededMessage = new Discord.RichEmbed();

            //if(!settings.adminIDs.includes(channel.name)){
            //embededMessage.setAuthor(anonSender.anonName, anonSender.iconURL);//getAvatarURL(anonSender.anonName, anonSender.color));
            //embededMessage.setColor(anonSender.color.hex());
            embededMessage.setImage(attachmentUrl);
            //embededMessage.setThumbnail(getAvatarURL(anonSender.anonName, anonSender.color));
            //embededMessage.setFooter("!", getAvatarURL(anonSender.anonName, anonSender.color));
            //embededMessage.setTimestamp();

            channel.send({embed: embededMessage})
                .catch(console.error);
        }
    }
}

/**
 * Get avatar url
 * @param {string} username Username string
 * @param {Color} color Color object
 */
function getAvatarURL(username, color){
    var hex = color.hex().replace(/[^a-zA-Z0-9]/g, '');
    console.log("+++++++++ getAvatarURL color.hex():" + hex)

    let avatarURL = `https://github-identicons.herokuapp.com/transparent/${username.replace(/[^a-zA-Z]/g, '')}?circle&color=${hex}`;
    return avatarURL;
}

/**
 * Send a message to a channel via a Webhook
 * @param {TextChannel} channel Channel Object
 * @param {string} content Message Content
 * @param {string} username Hook Username
 * @param {string} [avatar] Hook Avatar URL
 * @returns {Promise.<Message>}
 */
const webhookSend = async (channel, content, username, avatar) => {

    console.log("Using the webhook send function...");

    // List webhooks
    let hooks = await channel.fetchWebhooks().catch(console.error);

    console.log("+++++++++++++++++++++ hooks:\n" + hooks);

    // Create a webhook if one doesn't exist
    if (hooks.array().length === 0) {
        await channel.createWebhook(channel.name).catch(console.error);;
    }

    // Generate default avatar if no URL is specified
    let avatarURL = avatar ? avatar :
    `https://identicon-api.herokuapp.com/${username.replace(/[^a-zA-Z]/g, '')}/256?format=png`;

    // Update webhook list
    let hook = (await channel.fetchWebhooks()).first().catch(console.error);;

    return hook.send(content, { username, avatarURL });
}


module.exports = methods;