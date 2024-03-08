import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { codeBlock } from '@sapphire/utilities';
import { ChannelType, EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Send a specific message to a channel at a specific time. (UTC)'
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option //
						.setName('time')
						.setDescription('When do you want this message to be sent? (in UTC) (format: HH:MM)')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option //
						.setName('message')
						.setDescription('What do you want to send?')
						.setRequired(true)
				)
				.addChannelOption((option) =>
					option //
						.setName('channel')
						.setDescription('The channel to send the message')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const time = interaction.options.getString('time', true).trim();
		const message = interaction.options.getString('message', true);
		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);

		const embed = new EmbedBuilder() //
			.setColor('Blurple')
			.setTimestamp()
			.setTitle('Daily Message');

		// Validate time
		const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
		if (!timeRegex.test(time)) {
			return interaction.editReply({ content: 'Invalid time format. Please use HH:MM format.' });
		}

		const [hours, minutes] = time.split(':');

		const date = new Date();
		date.setUTCHours(Number(hours));
		date.setUTCMinutes(Number(minutes));

		embed.setDescription(`Message: ${codeBlock(message)}\nTime: <t:${Math.floor(date.getTime() / 1000)}>\nChannel: <#${channel.id}>`);

		try {
			await this.container.prisma.guild.upsert({
				where: { id: interaction.guildId! },
				create: {
					id: interaction.guildId!,
					dailyMessageChannelId: channel.id,
					dailyMessageContent: message,
					dailyMessageTime: time
				},
				update: {
					dailyMessageChannelId: channel.id,
					dailyMessageContent: message,
					dailyMessageTime: time
				}
			});
		} catch (e) {
			this.container.logger.error(e);
			return interaction.editReply({ content: 'An error occurred while scheduling the message.' });
		}

		return interaction.editReply({ embeds: [embed] });
	}
}
