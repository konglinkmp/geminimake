export enum StyleCategory {
  CASUAL = 'Casual',
  BUSINESS = 'Business',
  NIGHT_OUT = 'Night Out'
}

export interface GeneratedOutfit {
  id: string;
  style: StyleCategory;
  imageUrl: string; // Base64 data URI
  description: string;
  isLoading?: boolean;
}

export interface UploadedItem {
  file: File;
  previewUrl: string;
  base64: string;
}

export interface EditRequest {
  outfitId: string;
  prompt: string;
}