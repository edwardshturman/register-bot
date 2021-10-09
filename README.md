# Register

🌟 A high-quality, open-source Discord bot for event planning. 🗓

[![Dependency status](https://david-dm.org/edwardshturman/register-bot.svg)](https://david-dm.org/edwardshturman/register-bot)
[![GitHub last commit](https://img.shields.io/github/last-commit/edwardshturman/register-bot)](https://github.com/edwardshturman/register-bot/commits/master)

---

![Register logo](assets/register-logo-circle.png)

---

## Invite Link

→ [Add me](https://discord.com/api/oauth2/authorize?client_id=856081409742864384&permissions=0&scope=bot%20applications.commands) to your server!

## Features

- Plan events with a simple slash command: `/event add <where> <unique emoji> <when>` 🗓
  - *Use this unique emoji to keep track who can go via reactions!*
- Get an easy-to-read embed that displays where and when, along with a nice thumbnail of where you're headed ✨
- Visualize who can go when with up to four dates: `/event add <where> <unique emoji> <first proposed date> <second proposed date> ...` ✅
- Easily communicate event details with those going via a unique event role handed out to those that react 💬

## Usage/Examples

Use Register to:

- Plan trips with your friends
- See who can go to an upcoming concert
- Schedule a game night in your university's server
- Offer career opportunities, talks, or conferences in your business' server

## Demo

*Coming soon!*

## FAQ

#### So how about privacy — what and where is all of this stored?

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

All data is safely stored through MongoDB's cloud platform.

## Roadmap

For upcoming features, check out the [Issues](https://github.com/edwardshturman/register-bot/issues) tab!

## Support

For help with the event command, use `/event help`. For any issues you encounter, feel free to [submit an issue](https://github.com/edwardshturman/register-bot/issues).

## Tech Stack

- **Node.js** + **Discord.js**: core libraries for interacting with Discord
- **MongoDB**: storing event details
- **Unsplash API**: fetching thumbnails
- **Heroku**: deployment
- **Google Calendar API**: *coming soon!*

## Contributions

This is primarily a personal project for me and my friends, which I decided to share here publicly. For the time being, I don't have an open-source license set for Register, and as such, must politely decline contributions.

Feel free to look around, but please refrain from copying, modifying, or distributing Register source code without my explicit permission. Thank you!

# 🚀 About Me

👋 Hi there! I'm Edward, and I'm a Computer Science Major at the University of San Francisco. 💻

Register is a Discord bot I made for my group of friends — after our high school graduation in May 2021, we wanted to make the most of our Summer together, and we needed a tool to make planning trips, documenting availability, and tracking planning progress more convenient.

Well, here it is! I hope you enjoy, and I'll be updating it regularly for now. Go on and plan some epic events!

## 🔗 See more of my work and say hello

[![portfolio](https://img.shields.io/badge/portfolio-000?style=for-the-badge&logo=notion&logoColor=white)](https://about.edwardshturman.com/)

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/edward-shturman)

[![twitter](https://img.shields.io/badge/github-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/edwardshturman)
