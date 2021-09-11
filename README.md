# Bedwars Stoner (Discord) Bot

Create notifications when a player wins or loses a bedwars match.
Also creates a local (and resetable) leaderboard and allows players to check stats for various gamemodes.

## IMPORTANT: Discord Server Requirements
In order for the admin commands to function correctly, at least one role in the server must have the `Administrator` permission.

## Changing Token
Edit the `.env` file to add your discord and hypixel api token

## Running the code
Install the dependencies with
```
> npm install
```

Run the bot with
```
> npm run start
```

OR

```
> npm run build
> node build/index.js
```

## Built Using
- Discord.js
- Hypixel API

## TODO
- [x] Setup admin perms
- [ ] Update permissions on role change
- [ ] Add commands when guild is added