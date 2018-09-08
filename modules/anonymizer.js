// Wrapper class that adds the anonymous name to messages and channels

var Moniker = require('moniker');
var channelManager = require("./channelmanager.js");
var messageHandler  = require("./messagehandler.js");
var utilCommands  = require("./utilsmodule.js");
var fs = require('fs');
const crypto = require('crypto');
var Color = require('color');
const https = require('https');
var iconURLs;

var guild;

var anonMembers = JSON.parse(fs.readFileSync('anonnames.json', 'utf8'));
var monikerNames;

methods = [];

methods.init = function(client, guildID){

    console.log("----------------anonMembers----------------");
    console.log(anonMembers);

    guild = client.guilds.get(guildID);
   
    //monikerNames = Moniker.generator(["settings/adjectives.txt", "settings/nouns.txt"]);
	
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

			var anonMember = null;
			// Check if the members exist in the anonnames.json file 
			for(var i = 0; i < anonMembers.length; ++i){

				if(anonMembers[i].member === member.id){
					anonMember = anonMembers[i];
					console.log("Found anonMember for member:" + member.id);

					anonMembers[i].color = methods.getColor(anonMembers[i].anonName);
				}
			}

			if(anonMember == null){
				console.log("Didn't find member:" + member.id + " in anonnames.json!");
					
				console.log("Adding member to anonMembers array...");
				methods.pushMember(member);
				methods.saveNames();
			}else{
				if(anonMember.iconURL === "undefined" || anonMember.iconURL == null){
					console.log("Setting member icon for member " + member.id + "...");  
					//methods.setIcon(anonMember);
				}
			}
		}

		// Check if members were removed while offline
		//for (channel of guild.channels) {
		for (channel of guild.channels.array()){
			if(!guild.members.exists('id', channel.name) && channel.name !== "images" && channel.name !== "images" ){
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
    let name = Moniker.choose()//`${getPrefix()}${monikerNames.choose()}`
    let nameCollision = true;
    while (nameCollision) {
        nameCollision = false;
        for(anonMember of anonMembers){
            if(anonMember.anonName === name) {
                nameCollision = true
                console.log("Name collision! Getting new name...")
                name = Moniker.choose()//`${getPrefix()}${monikerNames.choose()}`
            }
        }
    }

    anonMembers.push({'member':member.id, 'anonName':name, 'color':this.getColor(name), 'iconURL':"null"});//this.setIcon(member)});
    console.log("Trying to push new member....................................................");
    console.log("color: " + this.getColor(name));
}

function getPrefix(){
    let prefix
    switch (Math.floor(Math.random() * 2)) {
        case 0: prefix = ""; break;
        case 1: prefix = "(The real) "; break;
    }
    return prefix
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

    return new Promise(function(resolve, reject) {
        var member = message.member;
        var anonMember = null;

        // Convert member to anonMember
        console.log("Looping through anonMembers list of length " + anonMembers.length);
        for(var i = 0; i < anonMembers.length; ++i){
            console.log("member " + i + " id:" + anonMembers[i].member);
            if(anonMembers[i].member == member.id)
                anonMember = anonMembers[i];
        }

        resolve(messageHandler.processMessage(anonMember, message, anonMembers));
    });
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
    var color = Color("#"+hash.substring(0, 6));

    console.log("Color for " + inputString + " : " + color.hex());
    if(color.isDark()){
        console.log("Color was too dark, lightening...");
        color = color.lighten(0.5);
        console.log("Color for " + inputString + " after lightening : " + color.hex());
    }

    return color;
}

methods.setIcon = function(anonMember){

    console.log("Shuffling icons array...");
    var iconsShuffled = utilCommands.shuffleArray(iconURLs);
    console.log("Icons array shuffled.");

    console.log("Looping through shuffled icons...");
    for(var i = 0; i < iconsShuffled.length; ++i){
        console.log("Checking icon " + i + " in shuffled icons. URL:" + iconsShuffled[i]);
        var iconUsed = false;
        for(anon of anonMembers){
            if(anon.member !== anonMember.member && anon.iconURL === iconsShuffled[i]){
                iconUsed = true;
            }
        }

        // If the icon is unused by any of the other anonMembers, use it for this one
        if(!iconUsed){
            console.log("Found unused icon! Index:" + i + "\n" + iconsShuffled[i]);
            anonMember.iconURL = iconsShuffled[i];
            methods.saveNames();
            return;
        }
    }

    // We can only reach this if all of the icons are used, so just select a random icon.
    anonMember.iconURL = iconsShuffled[Math.floor(Math.random() * iconsShuffled.length)];
    methods.saveNames();
}

methods.saveNames = function(){

    var jsonData = JSON.stringify(anonMembers);

    fs.writeFile("anonnames.json", jsonData, function(err) {
        if(err) {
            return console.log(err);
        }
    });
}


// This is not the right way to do this but it works
function getIconURLs(directoryURL){
    
    return new Promise(function(resolve, reject) {
    
        console.log("Attempting to get iconURLs");

        if(directoryURL === "undefined" || directoryURL == null)
            reject(null);

        https.get(directoryURL, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                                `Status Code: ${statusCode}`);
            }
            if (error) {
                console.error(error.message);
                // consume response data to free up memory
                res.resume();
                reject(null);
            }

            var regexGrabFileName = /((<tr><td class="n"><a href=")([^\"]*))/g;    
            var urlCharOffset = 27;

            var iconURLs = [];

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {

                    //console.log(rawData);

                    while (match = regexGrabFileName.exec(rawData)){
                        // match is now the next match, in array form.
                        var iconName = match[0].substring(urlCharOffset);

                        //console.log("iconName:" + iconName);
                        console.log("iconURL:" + (directoryURL + iconName));

                        iconURLs.push(directoryURL + iconName);
                    }

                    resolve(iconURLs);
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });
    });
}

module.exports = methods;