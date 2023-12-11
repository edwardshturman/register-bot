# Register

🌟 A high-quality, open-source Discord bot for event planning. 🗓

[![GitHub last commit](https://img.shields.io/github/last-commit/edwardshturman/register-bot)](https://github.com/edwardshturman/register-bot/commits/master)

---

![Register logo](assets/register-logo-circle.png)

---

## On the Future of Register

> ℹ️ Hey there, thanks for checking out Register! This was a Discord bot I made for my group of friends after our high school graduation in May 2021. We wanted to make the most of our Summer together, and we needed a tool to make planning trips, documenting availability, and tracking planning progress more convenient. This was the solution.
>
> 💡 I've learned a lot since first writing Register in Summer 2021. I've also since made a couple [other](https://github.com/edwardshturman/rollup-bot) [bots](https://github.com/edwardshturman/receipt-bot) for the same group of friends. Maintaining these bots, which were updated once every couple months or so, soon became unsustainable as I found myself repeating changes for what felt like multiple isolated projects, rather than a collection of bots.
>
> 🏗️ So, I made it a collection of bots — enter [**Realm**](https://github.com/compsigh/realm). Written in TypeScript, built open-source, and hopefully becoming as good of a learning resource as a bot, Realm will be *the* toolbox for building communities on Discord.
>
> 💚 Maintenance on this repo — as well as the other bots linked above — is discontinued, but they will be reborn in Realm (if they haven't already been!). I'm proud of Register, and if you used it, I hope it brought you and your friends joy in planning your get-togethers. Stay tuned for Realm, and feel free to drop by the [Discord](https://discord.realm.so) and chat — I'd love to hear from you!

## Features

- 🗓 Plan events with a simple slash command: `/event add <where> <unique emoji> <when>`
  - *Use this unique emoji to keep track who can go via reactions!*
- ✨ Get an easy-to-read embed that displays where and when, along with a nice thumbnail of where you're headed
- ✅ Visualize who can go when with up to four dates: `/event add <where> <unique emoji> <first proposed date> <second proposed date> ...`
- 💬 Easily communicate event details with those going via a unique event role handed out to those that react

## Usage/Examples

Use Register to:

- Plan trips with your friends
- See who can go to an upcoming concert
- Schedule a game night in your university's server
- Offer career opportunities, talks, or conferences in your business' server

## Privacy

Register logs the following:

- Discord server IDs, for associating events with your server
- Event names
- Event dates
- Event unique emojis
- Event embed message IDs, for tracking reactions
- Event role IDs, for handing out when someone reacts to an event message

Register **does not** log the following:

- Users who create or react to event messages
- Any server data not associated with event planning

## Tech Stack

- **Node.js** + **Discord.js**: core libraries for interacting with Discord
- **MongoDB**: storing event details
- **Unsplash API**: fetching thumbnails
- **Heroku**: deployment

## About Me

I'm Edward, and I'm a design-engineer, Internet painter, and computer science major at the University of San Francisco.

See more of my work and say hello over on [my website](https://edward.so).
