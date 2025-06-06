# riftjs

A Discord bot that does moderation stuff and has some fun commands too.

## What it does

### Mod stuff

- Ban people (sends them a DM telling them why)
- Kick troublemakers
- Timeout users (from 5 seconds up to 28 days)

### Fun stuff

- Calculate if two people are in love
- Turn images into GIFs
- Make people talk in UwU speak (it's annoying but funny)

### Other

- `.help` shows all commands

## Setting it up

1. Get the files:

```bash
git clone https://github.com/yourusername/riftjs.git
cd riftjs
```

2. Install what you need:

```bash
cd riftjs && npm i
```

3. Make a `.env` file and put your bot token in it:

```
DISCORD_TOKEN=your_token_here
```

4. Set your prefix in `src/config/rift.json`:

```json
{
  "prefix": "."
}
```

5. Run it:

```bash
npm run dev
```

## What the bot needs

- Node.js 21+
- A Discord bot token
- These permissions:
  - Manage Webhooks
  - Ban/Kick/Timeout
  - Send/Manage messages
  - Read history
  - See channels

## Cool stuff to add later

### Mod tools

- [ ] Warning system that auto-punishes repeat offenders
- [ ] Stop spam and raids
- [ ] Filter bad words/links
- [ ] Temp bans that unban automatically
- [ ] Mass message deletion + logging
- [ ] Keep roles when people leave/rejoin
- [ ] Track who did what (audit logs)

### Logs

- [ ] Track who joins/leaves
- [ ] Log role changes
- [ ] Back up server settings

### Admin stuff

- [ ] Auto-role new members
- [ ] Schedule announcements
- [ ] Server stats
