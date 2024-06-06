import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
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
        label: 'Blogspot',
        submenu: [
          { label: 'Using', apiEndpoint: 'http://localhost:3000/blogspot/using' },
          { label: 'TEMP', apiEndpoint: 'http://localhost:3000/blogspot/temp' },
          { label: 'Unused', apiEndpoint: 'http://localhost:3000/blogspot/unused' },
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
}
