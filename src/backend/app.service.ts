import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getTemplate(): any[] {
    return [
      {
        label: 'Adsense',
        submenu: [
          { label: 'Using', apiEndpoint: 'http://localhost:3000/adsense/using' },
          { label: 'Pantip.com', apiEndpoint: 'http://localhost:3000/adsense/pantip' },
          { label: 'Wordpress', apiEndpoint: 'http://localhost:3000/adsense/wordpress' },
          { label: 'Unused', apiEndpoint: 'http://localhost:3000/adsense/unused' },
        ],
      },
      {
        label: 'Website',
        submenu: [
          { label: 'Ready', apiEndpoint: 'http://localhost:3000/website/ready' },
          { label: 'Getting ready', apiEndpoint: 'http://localhost:3000/website/getting' },
          { label: 'Requires review', apiEndpoint: 'http://localhost:3000/website/review' },
          { label: 'Needs attention', apiEndpoint: 'http://localhost:3000/website/attention' },
        ],
      },
    ];
  }
}
