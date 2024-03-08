import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { ActivityType, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
export default class Client extends SapphireClient {
	constructor() {
		super({
			logger: {
				level: LogLevel.Debug
			},
			shards: 'auto',
			intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],

			// Presence related stuff
			presence: {
				activities: [
					{
						name: 'Lost in thoughts',
						type: ActivityType.Custom,
						url: 'https://github.com/ImKIJ'
					}
				]
			}
		});

		container.prisma = new PrismaClient();
	}
}
