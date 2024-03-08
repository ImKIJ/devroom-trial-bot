import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { handleDailyMessage } from '../lib/utils';
@ApplyOptions<Listener.Options>({ once: true })
export class UserEvent extends Listener {
	public override run() {
		void this.ensureGuilds();
		void this.dailyTask();
	}

	private async ensureGuilds() {
		for (const guild of this.container.client.guilds.cache.values()) {
			await this.container.prisma.guild.upsert({
				where: { id: guild.id },
				update: {},
				create: { id: guild.id }
			}); // void upsert just to make sure it creates the guild if it doesn't exist
		}
	}

	private async dailyTask() {
		setInterval(async () => {
			await handleDailyMessage();
		}, 60_000);
	}
}
