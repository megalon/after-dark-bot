// JavaScript source code

var methods = [];
const Discord = require('discord.js');
const snekfetch = require('snekfetch');
const settings = require("../settings/settings.json");
var utilCommands = require("./utilsmodule.js");
const path = require('path');
const fileType = require('file-type');
var Color = require('color');
var client;
var guild;
var imagesChannel;

methods.init = function(c, guildIn){
    client = c;
    guild = guildIn;
    imagesChannel = guild.channels.find("name", "images");
}

methods.processMessage = function(anonSender, message, anonMembers){

    // Strip all @ pings
    utilCommands.logMsg("Processing message...");
    utilCommands.logMsg("Attempting to replace all @ characters");
    var content = utilCommands.replaceAll(message.content, "@", " ");

    methods.sendMessageAllChannels(anonSender, message, content, anonMembers);
    reuploadImages(anonSender, message);

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

            if (channel.name != "images" && channel.type === "text") {

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

                embededMessage.setAuthor(anonSender.anonName, getAvatarURL(anonSender.anonName, anonSender.color));
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

    if (attachments !== "undefined" && attachments != null) {
        utilCommands.logMsg("Trying to add attachments.");
        for (attachment of attachments.array()) {
            console.log("Attempting to send the attachment:" + attachment.url);
            sendAttachmentByURL(anonSender, attachment.url);
        }
    }
}

// Gross duplicate function that should be simplified
// sendLinkAsAttachmentByURL and sendAttachmentByURL should use the same helper function
const sendLinkAsAttachmentByURL = async (anonSender, attachmentURL) => {

    // Regex to pull extension from the path
    var regExForExtensions = /(\.[^\.]+$)/;

    if (attachmentURL !== "undefined" && attachmentURL != null) {
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

        console.log("====== base + type.ext:" + base);
        
        imagesChannel.send(new Discord.Attachment(body, base))
            .then( imageMessage =>{
                //utilCommands.logMsg("======== attachment: " + imageMessage);
                methods.sendAttachmentAllChannels(anonSender, imageMessage);
            })
            .catch(console.error);
    }
}

const sendAttachmentByURL = async (anonSender, attachmentURL) => {

    // Regex to pull extension from the path
    var regExForExtensions = /(\.[^\.]+$)/;

    if (attachmentURL !== "undefined" && attachmentURL != null) {
        utilCommands.logMsg("======== Trying to send attachmentURL " + attachmentURL);
        let { body } = await snekfetch.get(attachmentURL);
        // body is now the image buffer
        //utilCommands.logMsg("======== snekfetch results: " + body);

        // strip the file name and extension
        // base is the filename
        let { base } = path.parse(attachmentURL);
        
        imagesChannel.send(new Discord.Attachment(body, base))
            .then( imageMessage =>{
                //utilCommands.logMsg("======== attachment: " + imageMessage);
                methods.sendAttachmentAllChannels(anonSender, imageMessage);
            })
            .catch(console.error);
    }
}

methods.sendAttachmentAllChannels = function(anonSender, message){
    var attachmentUrl = message.attachments.array()[0].url;

    for (channel of guild.channels.array()) {
        utilCommands.logMsg("memberID:" + message.member.id + " channelID:" + channel.name + " attachmentUrl:" + attachmentUrl);
        if (channel.name != "images" && channel.type === "text") {

            //console.log("anonSender.anonName:" + anonSender.anonName);

            var embededMessage = new Discord.RichEmbed();

            embededMessage.setAuthor(anonSender.anonName, getAvatarURL(anonSender.anonName, anonSender.color));
            embededMessage.setImage(attachmentUrl);
            embededMessage.setColor(anonSender.color.hex());
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