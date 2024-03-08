import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { Guild } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildCreate })
export class MessageCreateListener extends Listener {
	public async run(guild: Guild) {
		try {
			await this.container.prisma.guild.create({
				data: {
					id: guild.id
				}
			});
		} catch (e) {
			this.container.logger.error(e);
		}
	}
}
