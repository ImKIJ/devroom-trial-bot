import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { APIApplicationCommandOptionChoice, EmbedBuilder } from 'discord.js';
import { pickRandom } from '../../lib/utils';

@ApplyOptions<Command.Options>({
	description: 'Play Rock Paper Scissors with the bot!'
})
export class UserCommand extends Command {
	private readonly choices: APIApplicationCommandOptionChoice<string>[] = [
		{ name: 'rock', value: 'rock ' },
		{ name: 'paper', value: 'paper' },
		{ name: 'scissors', value: 'scissors' }
	];

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option //
						.setName('choice')
						.setDescription('Choose what you are gonna play')
						.setChoices(...this.choices)
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const userChoice = interaction.options.getString('choice', true).trim();
		const botChoice = pickRandom(this.choices).value.trim();

		const embed = new EmbedBuilder().setTitle('Rock Paper Scissors');

		let result: string;
		if (userChoice === botChoice) {
			result = "It's a tie!";
			embed.setColor('Grey');
		} else if (
			(userChoice === 'rock' && botChoice === 'scissors') ||
			(userChoice === 'paper' && botChoice === 'rock') ||
			(userChoice === 'scissors' && botChoice === 'paper')
		) {
			result = 'You won!';
			embed.setColor('Green');
		} else {
			result = 'You lost!';
			embed.setColor('Red');
		}

		embed.setDescription(`Your Choice: ${userChoice}\nBot Choice: ${botChoice}\n> **${result}**`);

		await interaction.reply({ embeds: [embed] });
	}
}
