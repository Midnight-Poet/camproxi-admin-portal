import { baseApi } from './baseApi';

export interface SearchResult {
  id: string;
  name: string;
  type: string; // 'STUDENT', 'AGENT', 'SCHOOL', 'PRODUCT', 'PROPERTY', 'SERVICE'
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query<SearchResult[], string>({
      query: (term) => `search?q=${encodeURIComponent(term)}`,
    }),
  }),
});

export const { useGlobalSearchQuery, useLazyGlobalSearchQuery } = searchApi;
