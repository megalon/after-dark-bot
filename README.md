# After Dark Bot 

WIP pseudo-anonymous messaging in a Discord server.

Every user gets their own hidden channel. 
Any messages sent in this channel are then immediately deleted, and reposted anonymously by the After Dark bot.

Features:
 + Generates a new channel for each user that joins the server.
 + Generates a new moniker for each user via the Moniker node package.
 + Bot relay supports both text and direct file uploads
 + Messages are displayed in a nice widget.
 + Basic admin commands
 
Usage:

Install requried packages
`npm install discord.js`
`npm install moniker`

Add your information into the `settings.json` file.
 + Bot token
 + Guild ID
 + List of admin IDs (who you want to be able to use the admin commands)
 
Start the bot from commandline with `node index.js`

Reset nicknames by clearing the array in the `anonNames.json` file, then restart the bot.

Admin commands
 + `!del n` Where n is the amount of messages to delete. Deletes messages from all channels
 + `!kick username` Kicks a member based off of their anonymous username
 + `!ban username` Bans a member based off of their anonymous username
