export type SearchSource = 'web' | 'images' | 'videos' | 'places' | 'news' | 'shopping' | 'scholar' | 'patents' | 'academic' | 'deep';

// Base interface for common properties
interface BaseSearchResult {
  title: string;
  link: string;
}

// Web search results
export interface WebSearchResult extends BaseSearchResult {
  snippet: string;
  position?: number;
  date?: string;
  attributes?: Record<string, string>;
  imageUrl?: string;
  thumbnailUrl?: string;
}

// Image search results
export interface ImageSearchResult extends BaseSearchResult {
  imageUrl: string;
  source?: string;
}

// Video search results
export interface VideoSearchResult extends BaseSearchResult {
  imageUrl?: string;
  snippet?: string;
  duration?: string;
  channel?: string;
  views?: string;
  date?: string;
  source?: string;
}

// Place search results
export interface PlaceSearchResult extends BaseSearchResult {
  position: number;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  ratingCount?: number;
  category?: string;
  phoneNumber?: string;
  website?: string;
  cid: string;
}

// News search results
export interface NewsSearchResult extends BaseSearchResult {
  snippet: string;
  imageUrl?: string;
  date?: string;
  source?: string;
  position?: number;
  attributes?: Record<string, string>;
}

// Shopping search results
export interface ShoppingSearchResult extends BaseSearchResult {
  price?: string;
  rating?: number;
  ratingCount?: number;
  imageUrl?: string;
  source?: string;
  delivery?: string;
  offers?: string;
  productId?: string;
  position?: number;
}

// Academic search results (for both scholar and patents)
export interface AcademicSearchResult extends BaseSearchResult {
  snippet: string;
  authors?: string[];
  year?: string | number;
  publisher?: string;
  citations?: number;
  publicationInfo?: string;
  pdfUrl?: string;
  id?: string;
}

// Union type for all possible result types
export type SearchResult = 
  | WebSearchResult 
  | ImageSearchResult 
  | VideoSearchResult 
  | PlaceSearchResult 
  | NewsSearchResult 
  | ShoppingSearchResult 
  | AcademicSearchResult;

// Response interface
export interface SerperResponse {
  searchParameters: {
    q: string;
    gl: string;
    hl: string;
  };
  organic?: WebSearchResult[];
  images?: ImageSearchResult[];
  videos?: VideoSearchResult[];
  places?: PlaceSearchResult[];
  news?: NewsSearchResult[];
  shopping?: ShoppingSearchResult[];
  academic?: AcademicSearchResult[];
  knowledgeGraph?: {
    title: string;
    type: string;
    description?: string;
    imageUrl?: string;
    attributes?: Record<string, string>;
    images?: Array<{
      title?: string;
      imageUrl: string;
    }>;
  };
  relatedSearches?: Array<{ query: string }>;
  peopleAlsoAsk?: Array<{
    question: string;
    snippet: string;
    link: string;
  }>;
}

export interface SearchError {
  error: string;
}

export interface SearchParams {
  searchTerm: string;
  searchMode: SearchSource;
}
