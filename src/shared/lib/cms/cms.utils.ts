import { environment } from '@/environments/environment';
import { VIDEO_FORMATS } from '@/shared/constants/constants';

export const generateMediaUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${environment.cmsBaseUrl}${url}`;
};

export const isVideo = (url: string) => {
  return VIDEO_FORMATS.some((format) => url.endsWith(format));
};
