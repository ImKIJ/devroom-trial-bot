import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

interface GlobalQuoteData {
	'01. symbol'?: string;
	'02. open'?: string;
	'03. high'?: string;
	'04. low'?: string;
	'05. price'?: string;
	'06. volume'?: string;
	'07. latest trading day'?: string;
	'08. previous close'?: string;
	'09. change'?: string;
	'10. change percent'?: string;
}

interface StockResponse {
	'Global Quote': GlobalQuoteData;
}

@ApplyOptions<Command.Options>({
	description: 'Shows stock information',
})
export class UserCommand extends Command {
	private readonly ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option //
						.setName('symbol')
						.setDescription('Stock to check')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const symbol = interaction.options.getString('symbol', true).trim();
		await interaction.deferReply();

		const embed = new EmbedBuilder().setTitle('Stocks Information').setColor('Blurple');

		const data = await fetch<StockResponse>(
			`${this.ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
			FetchResultTypes.JSON
		);

		const stockData = data['Global Quote'];

		if (!Object.keys(stockData).length) {
			embed.setColor('Red').setDescription(`No data found for \`${symbol}\``);
			return interaction.editReply({ embeds: [embed] });
		}

		const stockInfo = Object.entries(stockData)
			.map(([key, value]) => {
				let properKey = key.replace(/\d+\.\s/, '');
				properKey = properKey.charAt(0).toUpperCase() + properKey.slice(1);
				return `${properKey}: ${value}`;
			})
			.join('\n');

		embed.setDescription(stockInfo);
		return interaction.editReply({ embeds: [embed] });
	}
}
