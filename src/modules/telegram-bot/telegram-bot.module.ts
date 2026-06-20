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
    await this.botService.init();
  }
}
