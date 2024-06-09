import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  // private userCollection: Collection;
  // constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly mongodbService: MongoDBService) {
  //   this.userCollection = this.mongodbService.getCollection('honie');
  // }

  async login(input: any) {
    // const user = await this.userCollection.findOne(input);
    // if (!user) {
    //   throw new UnauthorizedException('Incorrect username or password');
    // }
    // await this.cacheManager.set(`user`, JSON.stringify(user), 86400);
    // return user;
  }
  getTemplate(): any[] {
    return [
      {
        label: 'Adsense',
        submenu: [
          { label: 'Running', apiEndpoint: 'http://localhost:3000/adsense/running' },
          { label: 'Ready', apiEndpoint: 'http://localhost:3000/adsense/ready' },
          { label: 'Pantip.com', apiEndpoint: 'http://localhost:3000/adsense/pantip' },
          { label: 'Wordpress', apiEndpoint: 'http://localhost:3000/adsense/wordpress' },
          { label: 'Unused', apiEndpoint: 'http://localhost:3000/adsense/unused' },
        ],
      },
      {
        label: 'Website',
        submenu: [
          { label: 'Ready', apiEndpoint: 'http://localhost:3000/website/ready' },
          { label: 'Getting ready', apiEndpoint: 'http://localhost:3000/website/getting-ready' },
          { label: 'Requires review', apiEndpoint: 'http://localhost:3000/website/requires-review' },
          { label: 'Needs attention', apiEndpoint: 'http://localhost:3000/website/needs-attention' },
        ],
      },
      {
        label: 'Buff',
        submenu: [
          { label: 'Blogspot Using', apiEndpoint: 'http://localhost:3000/blogspot/using' },
          { label: 'Blogspot TEMP', apiEndpoint: 'http://localhost:3000/blogspot/temp' },
          { label: 'Blogspot Unused', apiEndpoint: 'http://localhost:3000/blogspot/unused' },
          { label: 'Websites', apiEndpoint: 'http://localhost:3000/blogspot/websites' },
        ],
      },
      {
        label: 'Email',
        submenu: [
          { label: 'Check Mail', apiEndpoint: 'http://localhost:3000/gmail/inbox' },
          { label: 'OTP', apiEndpoint: 'http://localhost:3000/gmail/otp' },
          { label: 'Adsense', apiEndpoint: 'http://localhost:3000/gmail/adsense' },
        ],
      },
    ];
  }

  getDashboard(): any {
    return {
      revenue: {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14'],
        data: [1200, 1500, 1400, 1200, 1500, 1400, 1200, 1500, 1400, 1200, 1500, 1400, 1200, 1500],
      },
      traffic: {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14'],
        data: [2000, 2500, 2300, 2000, 2500, 2300, 2000, 2500, 2300, 2000, 2500, 2300, 2000, 2500],
      },
      rpm: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
        data: [
          [1.5, 1.6, 1.7, 1.5, 1.6, 1.7, 1.5, 1.6, 1.7, 1.5, 1.6, 1.7, 1.5, 1.6, 1.7, 1.5, 1.6, 1.7, 1.5, 1.6],
          [1.4, 1.5, 1.6, 1.4, 1.5, 1.6, 1.4, 1.5, 1.6, 1.4, 1.5, 1.6, 1.4, 1.5, 1.6, 1.4, 1.5, 1.6, 1.4, 1.5],
          [1.3, 1.4, 1.5, 1.3, 1.4, 1.5, 1.3, 1.4, 1.5, 1.3, 1.4, 1.5, 1.3, 1.4, 1.5, 1.3, 1.4, 1.5, 1.3, 1.4],
          [1.2, 1.3, 1.4, 1.2, 1.3, 1.4, 1.2, 1.3, 1.4, 1.2, 1.3, 1.4, 1.2, 1.3, 1.4, 1.2, 1.3, 1.4, 1.2, 1.3],
          [1.1, 1.2, 1.3, 1.1, 1.2, 1.3, 1.1, 1.2, 1.3, 1.1, 1.2, 1.3, 1.1, 1.2, 1.3, 1.1, 1.2, 1.3, 1.1, 1.2],
        ],
      },
      adsense: {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14'],
        data: [300, 400, 350, 300, 400, 350, 300, 400, 350, 300, 400, 350, 300, 400],
      },
    };
  }
  async getProxy() {
    return [
      'http://buivan:q8y924jx5u@23.142.16.184:65130',
      'http://bui:sgd6mrz3n@23.142.16.138:51024',
      'http://bui:sgd6mrz3n@23.142.16.138:51324',
      'http://bui:sgd6mrz3n@23.142.16.138:51624',
      'http://bui:sgd6mrz3n@23.142.16.138:51924',
    ];
  }
  async checkProxy(proxy: string) {
    try {
      const response = await axios.get('http://ip-api.com/json', {
        proxy: {
          host: 'proxyserver1',
          port: 8080,
          auth: {
            username: 'username',
            password: 'password',
          },
        },
      });
      return response;
    } catch (error) {
      return { error };
    }
  }
}
