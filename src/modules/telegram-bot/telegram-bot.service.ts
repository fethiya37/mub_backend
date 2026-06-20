import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import dns from 'dns';
import https from 'https';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const agent = new https.Agent({
  timeout: 120000,
  keepAlive: true,
  family: 4,
});

const sessions = new Map<string, any>();

@Injectable()
export class TelegramBotService {
  private bot: Telegraf<Context>;
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly adminChatId: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    if (!token || !chatId) {
      throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
    }
    this.adminChatId = chatId;
    this.bot = new Telegraf(token, {
      telegram: { timeout: 120000, agent } as any,
    });
  }

  async init() {
    const steps = [
      { key: 'fullName', question: '👤 What is your full name?' },
      { key: 'phone', question: '📞 What is your phone number?' },
      {
        key: 'email',
        question: '✉️ What is your email address? (optional – type "skip")',
      },
      { key: 'nationality', question: '🌍 What is your nationality?' },
      {
        key: 'dateOfBirth',
        question: '📅 What is your date of birth? (e.g., 1990-01-01)',
      },
      {
        key: 'gender',
        question: '⚧️ What is your gender? (Male / Female / Other)',
      },
      { key: 'occupation', question: '💼 What is your current occupation?' },
      {
        key: 'experience',
        question: '⏳ How many years of experience do you have?',
      },
      {
        key: 'education',
        question: '🎓 What is your highest level of education?',
      },
      { key: 'skills', question: '🧰 List your skills (comma-separated).' },
      {
        key: 'passportNumber',
        question: '🛂 What is your passport number? (optional – type "skip")',
      },
    ];

    this.bot.catch((err: any, ctx) => {
      this.logger.error(`Bot error: ${err.message}`);
    });

    this.bot.start(async (ctx) => {
      try {
        const payload = ctx.startPayload;
        if (payload === 'quickcv') {
          const userId = ctx.from.id.toString();
          sessions.set(userId, { stepIndex: 0, data: {} });
          await ctx.reply(
            '✍️ Let’s create your CV! I’ll ask you a few questions.',
          );
          await this.askQuestion(ctx, userId, steps);
        } else {
          await ctx.reply(
            '👋 Welcome! Use /start quickcv to begin the CV form.',
          );
        }
      } catch (error: any) {
        this.logger.error(`Error in start handler: ${error.message}`);
        await ctx.reply('⚠️ Something went wrong. Please try again later.');
      }
    });

    this.bot.on('text', async (ctx) => {
      try {
        const userId = ctx.from.id.toString();
        const session = sessions.get(userId);
        if (!session) {
          await ctx.reply(
            'I don’t have an active form for you. Type /start quickcv to begin.',
          );
          return;
        }

        const { stepIndex, data } = session;
        const currentStep = steps[stepIndex];
        if (!currentStep) {
          sessions.delete(userId);
          await ctx.reply('Form completed!');
          return;
        }

        let answer = ctx.message.text.trim();
        if (
          answer.toLowerCase() === 'skip' &&
          (currentStep.key === 'email' || currentStep.key === 'passportNumber')
        ) {
          answer = 'Not provided';
        }
        data[currentStep.key] = answer;

        session.stepIndex++;
        if (session.stepIndex >= steps.length) {
          await this.sendFinalProfile(ctx, data);
          sessions.delete(userId);
        } else {
          await this.askQuestion(ctx, userId, steps);
        }
      } catch (error: any) {
        this.logger.error(`Error in text handler: ${error.message}`);
        await ctx.reply('⚠️ Something went wrong. Please try again later.');
      }
    });

    try {
      await this.bot.launch();
      this.logger.log('Telegram bot started (polling)');
    } catch (error: any) {
      this.logger.error(`Failed to launch bot: ${error.message}`);
    }
  }

  private async askQuestion(ctx: Context, userId: string, steps: any[]) {
    const session = sessions.get(userId);
    if (!session) return;
    const step = steps[session.stepIndex];
    if (step) {
      await ctx.reply(step.question);
    }
  }

  private async sendFinalProfile(ctx: Context, data: any) {
    const message = `
🔹 *NEW CANDIDATE PROFILE* 🔹

*Name:* ${data.fullName}
*Phone:* ${data.phone}
*Email:* ${data.email || 'Not provided'}
*Nationality:* ${data.nationality || 'Not specified'}
*DOB:* ${data.dateOfBirth || 'Not specified'}
*Gender:* ${data.gender || 'Not specified'}
*Occupation:* ${data.occupation || 'Not specified'}
*Experience:* ${data.experience || 'Not specified'}
*Education:* ${data.education || 'Not specified'}
*Skills:* ${data.skills || 'Not specified'}
*Passport:* ${data.passportNumber || 'Not provided'}

_Submitted via Telegram Bot_
    `;
    await this.bot.telegram.sendMessage(this.adminChatId, message, {
      parse_mode: 'Markdown',
    });
    await ctx.reply(
      '✅ Your CV has been sent to our team! We will contact you soon. Thank you.',
    );
  }
}
