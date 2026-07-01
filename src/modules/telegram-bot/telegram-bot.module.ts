import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramBotService } from './telegram-bot.service';

@Module({
  imports: [ConfigModule],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule implements OnApplicationBootstrap {
  constructor(private readonly botService: TelegramBotService) {}

  async onApplicationBootstrap() {
    // Start bot without blocking the app startup
    // We do not await, so the app finishes bootstrapping immediately.
    this.botService.init().catch((err) => {
      console.error('Telegram bot initialization error:', err);
    });
  }
}
