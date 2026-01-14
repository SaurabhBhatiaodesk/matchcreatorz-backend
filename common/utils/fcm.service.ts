import { Injectable } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'common/models';
import { NotificationStatus } from 'common/enums';
import { callSocketApi } from 'common/utils';
import jsonCredFCM from './fcmkey.json';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

const credObj: any = jsonCredFCM;
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(credObj),
});

@Injectable()
export class FcmService {
  private client: Twilio;
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService
  ) {
    const accountSid = this.configService.get<string>('TWILIO_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.client = new Twilio(accountSid, authToken);
  }

  async sendSMS(mobile: string, message: string): Promise<boolean> {
    try {
      await this.client.messages.create({
        body: message,
        to: mobile, // Text this number
        from: this.configService.get<string>('TWILIO_MOBILE_NUMBER'), // From a valid Twilio number
      });
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    metaData: { [key: string]: any } = {},
  ) {
    const messageFormate = {
      token: token || 'defaultToken',
      android: {
        priority: 'high' as 'high',
        notification: {
          title: title || 'Default Title',
          body: body || 'Default Body',
          sound: 'default',
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            alert: {
              title: title || 'Default Title',
              body: body || 'Default Body',
            },
            sound: 'default',
            contentAvailable: true,
          },
        },
      },
      data: {
        title: title || 'Default Title',
        body: body || 'Default Body',
        metaData: JSON.stringify(metaData),
      },
    };

    try {
      const response = await firebaseAdmin.messaging().send(messageFormate);
      // eslint-disable-next-line no-console
      console.log('Notification sent successfully:', response, messageFormate);
      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending notification:', error.message || error);
      return this.i18n.t('validation.somethingWentWrong');
    }
  }

  async bulkSendNotification(
    tokens: string[],
    title: string,
    body: string,
    metaData: { [key: string]: any } = {},
  ) {
    // Remove duplicates and empty tokens
    const validTokens = [...new Set(tokens.filter(token => token.trim() !== ''))];
  
    // Function to split tokens into chunks of the given size
    const chunkArray = (array: string[], size: number) => {
      const chunkedArr = [];
      for (let i = 0; i < array.length; i += size) {
        chunkedArr.push(array.slice(i, i + size));
      }
      return chunkedArr;
    };
  
    // Split valid tokens into chunks of 300
    const tokenChunks = chunkArray(validTokens, 300);
  
    // Iterate over each chunk and send the notification
    for (const chunk of tokenChunks) {
      try {
        const response = await firebaseAdmin.messaging().sendEachForMulticast({
          tokens: chunk,
          notification: {
            title: title || 'General Broadcast',
            body: body || 'General Message',
          },
          data: {
            title: title || 'Default Title',
            body: body || 'Default Body',
            metaData: JSON.stringify(metaData),
          },
        });
  
        // Log success and failure counts for the current chunk
        console.log(
          `Chunk sent: ${response.successCount} succeeded, ${response.failureCount} failed`
        );
      } catch (error) {
        console.error(`Error sending notification to chunk:`, error);
      }
    }
  }
  

  async saveNotification(data: any) {
    const metaData = data?.metaData;
    if (Array.isArray(data?.deviceToken)) {
      //for broadcast from admin
      const notification = this.notificationRepository.create({
        subject: data?.title,
        description: data?.description,
        status: NotificationStatus.REMINDER,
        type: data.type,
        senderType: data.senderType,
        receiverType: data.senderType,
        metaData: data?.metaData,
      });
      await this.notificationRepository.save(notification);

      await this.bulkSendNotification(
        data.deviceToken,
        data.title,
        data.description,
        metaData,
      );
    } else {
      // for system generated notify from api
      const notification = this.notificationRepository.create({
        subject: data?.title,
        description: data?.description,
        senderId: data.senderId,
        receiverId: data.recieverId,
        status: data?.status ?? NotificationStatus.REMINDER,
        type: data.type,
        senderType: data.senderType,
        receiverType: data.receiverType,
        metaData: data?.metaData,
      });
      if ( data?.status !== NotificationStatus.SUPPORT && data?.status !== NotificationStatus.CHAT
      ) {
        // save block for admin chat
        await this.notificationRepository.save(notification);
      }

      if(data?.receiverType === 'Admin'){
        const notifyData = {
          title : data?.title,
          description : data?.description,
          senderId: data.senderId,
          receiverId: data.recieverId,
          status: data?.status || NotificationStatus.REMINDER,
          type: data.type,
          senderType: data.senderType,
          receiverType: data.receiverType,
          metaData : data?.metaData
        }
        const postData = {
          listener: 'admin-notification',
          receiver: data.recieverId,
          type: data?.status || NotificationStatus.REMINDER,
          data: notifyData,
        };
        callSocketApi(postData);
      }else{
        await this.sendNotification(data.deviceToken, data.title, data.description, metaData);
      }


    }
  }
}
