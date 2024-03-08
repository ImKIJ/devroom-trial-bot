import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.MessageCreate })
export class MessageCreateListener extends Listener {
	public async run(message: Message) {
		if (message.author.bot || !message.guild) return;

		// increment user messages by 1
		try {
			const data = await this.container.prisma.member.upsert({
				where: { id: message.author.id, guildId: message.guild.id },
				update: { messages: { increment: 1 } },
				create: { id: message.author.id, guildId: message.guild.id, messages: 1 }
			});
			this.container.logger.debug(`[${message.guild.name}] ${message.author.username} now has ${data.messages} messages.`);
		} catch (e) {
			this.container.logger.error(e);
		}
	}
}
