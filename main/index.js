const fs = require('node:fs');
const path = require('node:path');
const {Client, Events, GatewayIntentBits, Routes, Collection} = require('discord.js');
const {config} = require('dotenv');
const {REST} = require('@discordjs/rest');

config();

const TOKEN = process.env.TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
    intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, 
    ],
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once(Events.ClientReady, c => {
    console.log(`${c.user.username} Online`);
})

client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	
    const command = client.commands.get(interaction.commandName)
    if (!command) return;

    try {
		await command.execute(interaction);
    } catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Deu merda aí, queridão, dá teu jeito.', ephemeral: true });
	}
});

async function main() {
    try {
		console.log(`Recarregando ${commands.length} comando(s).`);

		const data = await rest.put(Routes.applicationCommands(APPLICATION_ID),
			{ body: commands,
        });

        client.login(TOKEN);
		console.log(`Recarregado ${data.length} comando(s).`);
	} catch (error) {
		console.error(error);
	}
};

main();
