/* eslint-disable */
import * as admin from "firebase-admin";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

async function sendPushNotification(
  title: string,
  body: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  const tokensSnapshot = await db.collection("pushTokens").get();
  const messages: ExpoPushMessage[] = [];

  tokensSnapshot.forEach((doc) => {
    const token = doc.data().token;
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is not a valid Expo push token`);
    } else {
      messages.push({
        to: token,
        sound: "default",
        title,
        body,
        data,
      });
    }
  });

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Notification tickets:", ticketChunk);
    } catch (error) {
      console.error("Error sending notification chunk:", error);
    }
  }
}

export const sendNewPostNotification = onDocumentCreated(
  "posts/{postId}",
  async (event) => {
    const snap = event.data!;
    const postData = snap.data() as
      | { title?: string; url?: string }
      | undefined;
    const postTitle = postData?.title || "New Post";
    const postUrl = postData?.url || "https://www.tinnitushelp.me/blog/";

    const title = "New Post on Tinnitus Help";
    const body = `Check out the new post: ${postTitle}`;

    await sendPushNotification(title, body, { url: postUrl });
  }
);

export const sendNewSoundNotification = onDocumentCreated(
  "sounds/{soundId}",
  async (event) => {
    const snap = event.data!;
    const soundData = snap.data() as
      | { title?: string; name?: string; url?: string }
      | undefined;
    const soundTitle = soundData?.title || soundData?.name || "New Sound";
    const soundUrl = soundData?.url || "https://www.tinnitushelp.me/zen/";

    const title = "New Sound on Tinnitus Help";
    const body = `Check out the new sound: ${soundTitle}`;

    await sendPushNotification(title, body, { url: soundUrl });
  }
);
