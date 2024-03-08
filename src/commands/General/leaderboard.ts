import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'shows the top 10 users with the most messages in the server.',
	preconditions: ['GuildOnly']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.deferReply();
        
		const leaderboard = await this.container.prisma.member.findMany({
			where: { guildId: interaction.guildId! },
			orderBy: { messages: 'desc' }
		});
		const userRank = leaderboard.findIndex((member) => member.id === interaction.user.id);

		const embed = new EmbedBuilder() //
			.setColor('Blurple')
			.setTitle('Leaderboard')
			.setTimestamp();

		if (leaderboard.length === 0) {
			embed.setDescription('Emptiness... Send a message to get on the leaderboard!');
			return interaction.editReply({ embeds: [embed] });
		}

		let content = leaderboard
			.slice(0, 10)
			.map((member, index) => `**${index + 1}**. <@${member.id}> - ${member.messages} messages`)
			.join('\n');

		// if user not in top 10, insert rank
		if (userRank > 9) {
			content += `\n\n**${userRank + 1}**. <@${interaction.user.id}> - ${leaderboard[userRank].messages} messages`;
		}

		embed.setDescription(content);

		return interaction.editReply({ embeds: [embed] });
	}
}
