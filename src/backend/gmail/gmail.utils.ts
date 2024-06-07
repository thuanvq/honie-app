import { gmail_v1 } from 'googleapis';

export function getMessageContent(message: gmail_v1.Schema$Message): string {
  let content = '';
  if (message.payload?.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        content += Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
  } else if (message.payload?.body?.data) {
    content = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
  }
  return content;
}

export function extractHeaders(headers: gmail_v1.Schema$MessagePartHeader[]): any {
  const extractedHeaders: any = {};
  headers.forEach((header) => {
    const name = header.name?.toLowerCase();
    if (name) {
      if (name === 'subject') {
        extractedHeaders.subject = header.value;
      } else if (name === 'from') {
        extractedHeaders.from = header.value;
      } else if (name === 'to') {
        extractedHeaders.to = header.value;
      } else if (name === 'cc') {
        extractedHeaders.cc = header.value;
      } else if (name === 'date') {
        extractedHeaders.date = header.value;
      }
    }
  });
  return extractedHeaders;
}

export function extractPid(content: string): string | null {
  const pidMatch = content.match(/pub-\d{16}/);
  return pidMatch ? pidMatch[0] : null;
}

export function extractInvitationLink(content: string): string | null {
  const linkMatch = content.match(/https:\/\/www\.google\.com\/adsense\/invitations\/start\S*/);
  return linkMatch ? linkMatch[0] : null;
}

export function convertTypeFromSubject(input: string): string {
  const subject = input.toLowerCase();

  if (!subject) {
    return '';
  } else if (/^(google verification code|email verification code|รหัสยืนยันอีเมล|mã xác minh)/.test(subject)) {
    return 'OTP';
  } else if (/^(ad serving limit|temporary ad serving limit)/.test(subject)) {
    return 'Adsense Ad Limited';
  } else if (/is now associated with google analytics/i.test(subject)) {
    return 'Google Analytics';
  } else if (/new reasons prevent pages from being indexed/.test(subject)) {
    return 'Google Search Console';
  } else if (/^you need to fix some issues/.test(subject)) {
    return 'Website Needs intention';
  } else if (/địa chỉ email của bạn hiện là'/.test(subject)) {
    return 'Recovery Email';
  } else if (/your application status/.test(subject)) {
    return 'Adsense Disapproved';
  } else if (/you’ve been invited to access an adsense account/.test(subject)) {
    return 'Adsense Invite';
  } else if (/your google publisher account has been disabled/.test(subject)) {
    return 'Adsense Closed';
  } else if (/google adsense | understand when and how you’ll get paid/.test(subject)) {
    return 'Adsense need verify';
  } else if (/invitation to share a google ad manager account/.test(subject)) {
    return 'Ad Manager Invite';
  } else if (/you already have an existing adSense account/.test(subject)) {
    return 'Adsense Rejected';
  } else if (/Your site was not approved/.test(subject)) {
    return 'Website unapproved (Ad Manager)';
  } else if (/XXX/.test(subject)) {
    return 'XXXX';
  }

  return '';
}
