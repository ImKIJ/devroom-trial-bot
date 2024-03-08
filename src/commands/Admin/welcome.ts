import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { codeBlock } from '@sapphire/utilities';
import { ChannelType, EmbedBuilder } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'welcome module main command',
	subcommands: [
		{
			name: 'set-channel',
			chatInputRun: 'setChannel'
		},
		{
			name: 'set-message',
			chatInputRun: 'setMessage'
		}
	],
	preconditions: ['GuildOnly'],
	requiredUserPermissions: ['ManageGuild']
})
export class UserCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((cmd) =>
					cmd //
						.setName('set-channel')
						.setDescription('Set the welcome channel')
						.addChannelOption((option) =>
							option //
								.setName('channel')
								.setDescription('The channel to send the welcome message')
								.addChannelTypes(ChannelType.GuildText)
								.setRequired(true)
						)
				)
				.addSubcommand((cmd) =>
					cmd //
						.setName('set-message')
						.setDescription('Set the welcome message.')
						.addStringOption((option) =>
							option //
								.setName('message')
								.setDescription('The welcome message. Use {user} to mention the user.')
								.setRequired(true)
						)
				)
		);
	}

	public async setChannel(interaction: Subcommand.ChatInputCommandInteraction) {
		const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);

		try {
			await this.container.prisma.guild.upsert({
				where: { id: interaction.guildId! },
				update: { welcomeChannelId: channel.id },
				create: { id: interaction.guildId!, welcomeChannelId: channel.id }
			});

			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor('Blurple')
						.setDescription(`The welcome channel has been set to ${channel.toString()}`)
						.setTimestamp()
						.setTitle(`Welcome Channel Updated!`)
				],
				ephemeral: true
			});
		} catch (e) {
			this.container.logger.error(e);
			return interaction.reply({ content: 'An error occurred while setting the welcome channel.', ephemeral: true });
		}
	}

	public async setMessage(interaction: Subcommand.ChatInputCommandInteraction) {
		const message = interaction.options.getString('message', true);

		try {
			await this.container.prisma.guild.upsert({
				where: { id: interaction.guildId! },
				update: { welcomeMessage: message },
				create: { id: interaction.guildId!, welcomeMessage: message }
			});

			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor('Blurple')
						.setDescription(`The welcome message has been set to ${codeBlock(message)}`)
						.setTimestamp()
						.setTitle(`Welcome Message Updated!`)
				],
				ephemeral: true
			});
		} catch (e) {
			this.container.logger.error(e);
			return interaction.reply({ content: 'An error occurred while setting the welcome message.', ephemeral: true });
		}
	}
}
