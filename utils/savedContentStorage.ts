import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageCache } from "./imageCache";

const TINNITUS_HOST = "tinnitushelp.me";

export interface SavedContent {
  id: string;
  type: "posts";
  title: string;
  description: string;
  image: string;
  url: string;
  slug: string;
  content: string;
  savedAt: string;
  publishedDate?: string;
  author?: string;
  uniqueId?: string;
}

const STORAGE_KEY = "@saved_content_posts";

export class SavedContentStorage {
  private static generateUniqueId(url: string, slug: string): string {
    return `${slug}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async saveContent(content: SavedContent): Promise<void> {
    const existingData = await this.getSavedContent("posts");

    const urlDuplicateIndex = existingData.findIndex(
      (item) => item.url === content.url
    );

    if (urlDuplicateIndex >= 0) {
      existingData[urlDuplicateIndex] = {
        ...content,
        uniqueId:
          existingData[urlDuplicateIndex].uniqueId ||
          this.generateUniqueId(content.url, content.slug),
        savedAt: new Date().toISOString(),
      };
    } else {
      const slugDuplicateIndex = existingData.findIndex(
        (item) => item.slug === content.slug
      );

      if (slugDuplicateIndex >= 0) {
        existingData.splice(slugDuplicateIndex, 1);
      }

      const newContent = {
        ...content,
        uniqueId: this.generateUniqueId(content.url, content.slug),
      };
      existingData.push(newContent);
    }

    existingData.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
  }

  static async getSavedContent(type: "posts"): Promise<SavedContent[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async getSavedContentById(
    type: "posts",
    id: string
  ): Promise<SavedContent | null> {
    const savedContent = await this.getSavedContent(type);
    return savedContent.find((item) => item.id === id) || null;
  }

  static async getSavedContentByUrl(url: string): Promise<SavedContent | null> {
    const savedContent = await this.getSavedContent("posts");
    return savedContent.find((item) => item.url === url) || null;
  }

  static async removeSavedContent(type: "posts", id: string): Promise<void> {
    const existingData = await this.getSavedContent(type);
    const filteredData = existingData.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
    await ImageCache.clearCacheForContent(id);
  }

  static async isContentSavedByUrl(url: string): Promise<boolean> {
    const saved = await this.getSavedContentByUrl(url);
    return saved !== null;
  }

  static async getSavedContentCount(): Promise<number> {
    const savedContent = await this.getSavedContent("posts");
    return savedContent.length;
  }

  static async getAllSavedContentCounts(): Promise<{ posts: number }> {
    const posts = await this.getSavedContentCount();
    return { posts };
  }
}

export function extractSlugFromUrl(url: string): string | null {
  try {
    if (!url?.trim()) return null;
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes(TINNITUS_HOST)) return null;
    const path = urlObj.pathname.replace(/\/$/, "");
    const prefix = "/blog/";
    if (!path.startsWith(prefix) || path === "/blog") return null;
    const rest = path.slice(prefix.length);
    return rest || null;
  } catch {
    return null;
  }
}

export function getContentTypeFromUrl(url: string): "posts" | null {
  return isBlogPostDetailUrl(url) ? "posts" : null;
}

/** Single blog article: /blog/{slug} (not the blog index). */
export function isBlogPostDetailUrl(url: string): boolean {
  try {
    if (!url?.trim()) return false;
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes(TINNITUS_HOST)) return false;
    const path = urlObj.pathname.replace(/\/$/, "") || "/";
    const parts = path.split("/").filter(Boolean);
    if (parts[0] !== "blog") return false;
    return parts.length >= 2;
  } catch {
    return false;
  }
}
