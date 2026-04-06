
export type AspectRatio = '1:1' | '9:16' | '16:9' | '4:3' | '3:4';

export interface ImageFile {
  base64: string;
  mimeType: string;
  name: string;
}

export enum Tab {
  PostCreator,
  ImageEditor,
  ImageGenerator,
  SceneCollage,
  VideoGenerator,
}
