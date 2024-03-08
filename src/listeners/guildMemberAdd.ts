import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { GuildMember, TextChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberAdd })
export class GuildMemberAddListener extends Listener {
	public async run(member: GuildMember) {
		try {
            const guildData = await this.container.prisma.guild.findUnique({ where: { id: member.guild.id } });
            if (guildData?.welcomeChannelId && guildData?.welcomeMessage) {
				const channel = member.guild.channels.cache.get(guildData.welcomeChannelId) as TextChannel;
				await channel?.send(guildData.welcomeMessage.replace(/{user}/g, member.toString()));
			}
		} catch (e) {
			return;
		}
	}
}
