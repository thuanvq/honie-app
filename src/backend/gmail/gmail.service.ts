import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { Collection } from 'mongodb';
import * as readline from 'readline';
import { MongoDBService } from '../mongodb/mongodb.service';
import { CREDENTIAL } from './gmail.constants';
import { convertTypeFromSubject, getMessageContent } from './gmail.utils';

@Injectable()
export class GmailService implements OnModuleInit {
  private readonly TOKEN_PATH = 'gmail.json';
  private oAuth2Client: OAuth2Client;
  private readonly logger = new Logger(GmailService.name);

  private inboxCollection: Collection;
  private scenarioCollection: Collection;

  constructor(private readonly mongoDBService: MongoDBService) {
    this.inboxCollection = this.mongoDBService.getCollection('google_inbox');
    this.scenarioCollection = this.mongoDBService.getCollection('scenario');
  }

  async onModuleInit() {
    this.oAuth2Client = await this.authorize(CREDENTIAL);
  }

  private async authorize(credentials: any): Promise<OAuth2Client> {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    return new Promise((resolve, reject) => {
      fs.readFile(this.TOKEN_PATH, async (err, token) => {
        if (err) {
          console.log(err);
          try {
            const newToken = await this.getAccessToken(oAuth2Client);
            oAuth2Client.setCredentials(newToken);
            fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(newToken));
            resolve(oAuth2Client);
          } catch (error) {
            reject(error);
          }
        } else {
          console.log(token.toString());
          oAuth2Client.setCredentials(JSON.parse(token.toString()));
          resolve(oAuth2Client);
        }
      });
    });
  }

  private getAccessToken(oAuth2Client: OAuth2Client): Promise<any> {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve, reject) => {
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return reject('Error retrieving access token: ' + err);
          resolve(token);
        });
      });
    });
  }

  async findInvitation(): Promise<string[]> {
    const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 500,
    });

    if (!res.data.messages) {
      return [];
    }

    const messages = res.data.messages.map((message) => message.id);
    await this.saveMessagesToMongoDB(messages);
    return messages;
  }

  private async saveMessagesToMongoDB(messageIds: string[]): Promise<void> {
    const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });

    for (const messageId of messageIds) {
      try {
        const res = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
        });

        const messageContent = getMessageContent(res.data);
        const headers = res.data.payload?.headers || [];
        const subjectHeader = headers.find((header) => header.name === 'Subject');
        const subject = subjectHeader ? subjectHeader.value : 'No Subject';
        const toHeader = headers.find((header) => header.name === 'To');
        const to = toHeader ? toHeader.value : 'No To';
        const pid = this.extractPID(messageContent);
        const invitationLink = this.extractInvitationLink(messageContent);
        const type = convertTypeFromSubject(subject);

        const message = {
          id: res.data.id,
          type,
          to,
          pid,
          subject,
          threadId: res.data.threadId,
          snippet: res.data.snippet,
          historyId: res.data.historyId,
          internalDate: res.data.internalDate,
          content: messageContent,
          invitationLink,
        };

        const result = await this.inboxCollection.updateOne({ id: message.id }, { $set: message }, { upsert: true });

        this.logger.log(
          `Upserted message with id: ${message.id}, matched: ${result.matchedCount}, modified: ${result.modifiedCount}, upserted: ${result.upsertedCount}`,
        );
      } catch (error) {
        this.logger.error(`Failed to save message with id ${messageId}: ${error.message}`);
      }
    }
  }

  extractVerificationCode(text: string): string | null {
    const match = text.match(/\b\d{6}\b/);
    return match ? match[0] : null;
  }

  extractPID(text: string): string | null {
    const match = text.match(/\bpub-\d{16}\b/);
    return match ? match[0] : null;
  }

  extractInvitationLink(text: string): string | null {
    const match = text.match(/https:\/\/www\.google\.com\/adsense\/invitations\/start\S*/);
    return match ? match[0] : null;
  }

  async findUnreadMessage(email: string, subjectKeywords: string[]): Promise<any> {
    const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
    const query = `is:unread to:${email} (${subjectKeywords.map((keyword) => `subject:"${keyword}"`).join(' OR ')})`;

    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 1,
    });

    if (res.data.messages && res.data.messages.length > 0) {
      const messageId = res.data.messages[0].id;
      const messageRes = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      const headers = messageRes.data.payload?.headers || [];
      const subjectHeader = headers.find((header) => header.name === 'Subject');
      const subjectText = subjectHeader ? subjectHeader.value : 'No Subject';

      const content = getMessageContent(messageRes.data);
      const verificationCode = this.extractVerificationCode(subjectText) || this.extractVerificationCode(content);

      return {
        id: messageId,
        subject: subjectText,
        verificationCode,
      };
    }
    return null;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  }

  async getInbox(to: string, type?: string) {
    const where: Record<string, any> = {};
    if (to) where.to = new RegExp(to, 'i');
    if (type) where.type = new RegExp(type, 'i');

    const data = await this.inboxCollection
      .find(where)
      .project({ id: 1, to: 1, subject: 1, type: 1, internalDate: 1 })
      .sort({ internalDate: -1 })
      .limit(100)
      .toArray();

    const headers = [
      { label: 'ID', key: 'id', sortable: false },
      { label: 'Email', key: 'to', sortable: false },
      { label: 'Subject', key: 'subject', sortable: false },
      { label: 'Date', key: 'internalDate', sortable: false, type: 'date' },
    ];
    const totalRecords = data.length;
    const filters = [{ key: 'to', label: 'Email', type: 'text' }];
    return { title: `Check email`, headers, filters, data, totalRecords, summary: '', primary: 'id' };
  }

  async getEmail(id: string) {
    return await this.inboxCollection.findOne({ id });
  }
}
