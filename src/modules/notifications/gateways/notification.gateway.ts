import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
  };
}

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
  transports: ['websocket', 'polling'],
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private userSockets: Map<string, Set<string>> = new Map();
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.logger.log('Notification Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`New client attempting to connect: ${client.id}`);

    try {
      const authHeader =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization as string);

      let token = authHeader;
      if (token && token.startsWith('Bearer ')) {
        token = token.substring(7);
      }

      if (!token) {
        this.logger.error(`No token provided for client: ${client.id}`);
        client.emit('error', { message: 'Authentication token required' });
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      const userId = payload.sub || payload.id;

      if (!userId) {
        this.logger.error(`No userId in token for client: ${client.id}`);
        client.emit('error', { message: 'Invalid token payload' });
        client.disconnect();
        return;
      }

      client.data.userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      this.logger.log(`Client ${client.id} connected for user: ${userId}`);
      client.emit('connected', {
        message: 'Connected to notification service',
        userId,
      });
    } catch (err) {
      const error = err as Error;
      this.logger.error(
        `Connection failed for client ${client.id}: ${error.message}`,
      );
      client.emit('error', {
        message: 'Authentication failed',
        details: error.message,
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data.userId;
    this.logger.log(
      `Client disconnected: ${client.id}, User: ${userId || 'unknown'}`,
    );

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.logger.log(
      `Sending notification to user ${userId}: ${notification.title}`,
    );
    const sockets = this.userSockets.get(userId);

    if (sockets && sockets.size > 0) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit('notification', notification);
      }
    }
  }

  sendUnreadCountToUser(userId: string, count: number) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.size > 0) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit('unreadCount', { count });
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    return {
      event: 'pong',
      data: { userId: client.data.userId, timestamp: new Date().toISOString() },
    };
  }
}
