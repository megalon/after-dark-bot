// Command Manager

var utilCommands = require("./utilsmodule.js");
var methods = [];
var commandPrefix = "!";
var commandNames = ["del", "kick", "ban"];

methods.parseCommand = function(message){
    var text = message.content;
    var commandName = null;
    var commandObj = null;
    var argsText = [];


    if(text === "undefined" || text == null)
        return null;

    if(text.indexOf(commandPrefix) == 0){
        // Set command obj to something other than null
        commandObj = "invalid";
        for(var i = 0; i < commandNames.length; ++i){
            if(text.indexOf(commandNames[i]) == commandPrefix.length){
                console.log("Found command " + commandNames[i] + " in message: " + text + " from memberID: " + message.member.id);
                commandName = commandNames[i];
                argsText = text.substring(commandPrefix.length + commandName.length + 1);
            }
        }
    }

    if(commandName != null){
        if(commandName === "del"){
            commandObj = methods.parseDeleteCommand(argsText);
        }else if(commandName === "kick"){
            commandObj = methods.parseKickCommand(argsText);
        }else if(commandName === "ban"){
            commandObj = methods.parseBanCommand(argsText);
        }

        // If the command is still null, then it was an invalid use of a valid command
        if(commandObj == null){
            console.log("Command:" + commandName + " was used incorrectly!");
            commandObj = "invalid";
        }
    }

    return commandObj;
}

methods.parseArgs = function(text){
    console.log("Parsing arguments from text:" + text);
    var args = text.split(" ");
    console.log("Parsed args:" + args);

    if(args === "undefined" || args == null){
        console.log("Error, could not parse any args from " + text);
        return null;
    }
    return args;
}

methods.parseDeleteCommand = function(text){
    var obj = {'commandName':"delete", 'amount':1, 'anonName':null};

    var args = methods.parseArgs(text);

    console.log("args.length:" + args.length);

    if(args === "undefined" || args == null || args.lenght == 0 || args[1] === "" || args[1] === " "){
        console.log("Invalid args, returning...");
        return obj;
    }else{
        console.log("Args:" + args);
    }



    if(args.length >= 2){
        // Check if username and number were provided

        var amount = parseInt(args[0]);
        var anonName = args[1];

        obj.amount = amount;
        obj.anonName = anonName;
    }else if(args.length == 1){
        // Check that number was provided
        var amount = parseInt(args[0]);

        console.log("args.length:" + args.length + " amount:" + amount);

        if(amount !== "undefined" && amount != null && !isNaN(amount)){
            obj.amount = amount;
        }
    }

    return obj;
}

methods.parseKickCommand = function(text){
    var obj = {'commandName':"kick", 'anonName':null};

    var args = methods.parseArgs(text);
    
    if(args === "undefined" || args == null || args.length == 0 || args[0] === "" || args[0] === " "){
        console.log("Invalid args, returning...");
        return null;
    }
    
    if(args.length == 1){
        // Check that number was provided
        var anonName = args[0];

        if(anonName !== "undefined" && anonName != null){
            obj.anonName = anonName;
        }
    }

    return obj;
}

methods.parseBanCommand = function(text){
    var obj = {'commandName':"ban", 'anonName':null};

    var args = methods.parseArgs(text);
    
    if(args === "undefined" || args == null || args.length == 0 || args[0] === "" || args[0] === " "){
        console.log("Invalid args, returning...");
        return null;
    }
    
    if(args.length == 1){
        // Check that number was provided
        var anonName = args[0];

        if(anonName !== "undefined" && anonName != null){
            obj.anonName = anonName;
        }
    }

    return obj;
}

module.exports = methods;