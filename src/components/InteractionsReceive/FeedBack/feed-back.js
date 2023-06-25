import { FeedBack } from '@polyv/interactions-receive-sdk';

let FeedBackSdk = null;
export const geFeedBackSdk = () => {
  if (!FeedBackSdk) {
    FeedBackSdk = new FeedBack();
  }
  return FeedBackSdk;
};
