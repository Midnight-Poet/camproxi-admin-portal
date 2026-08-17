import { baseApi } from './baseApi';

export interface PendingContent {
  id: string;
  name: string;
  type: 'Lodge' | 'Business' | 'Service';
  agentName: string;
  university: string;
  submittedAt: string;
}

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPendingContent: builder.query<PendingContent[], void>({
      query: () => 'content/pending',
      transformResponse: (response: { properties: any; products: any; services: any }) => {
        return [
          ...(response.properties?.data || []).map((p: any) => ({ ...p, type: 'Lodge' as const })),
          ...(response.products?.data || []).map((p: any) => ({ ...p, type: 'Business' as const })),
          ...(response.services?.data || []).map((p: any) => ({ ...p, type: 'Service' as const })),
        ];
      },
      providesTags: ['Content'],
    }),
    getAllContent: builder.query<{ data: any[], meta: { total: number, page: number, lastPage: number } }, { page?: number; limit?: number; status?: string; category?: string }>({
      query: ({ page = 1, limit = 20, status = 'all', category = 'ALL' }) => 
        `content/all?page=${page}&limit=${limit}&status=${status}&category=${category}`,
      transformResponse: (response: { properties: any; products: any; services: any }) => {
        const props = (response.properties?.data || []).map((p: any) => ({ ...p, type: 'Lodge' as const }));
        const prods = (response.products?.data || []).map((p: any) => ({ ...p, type: 'Business' as const }));
        const servs = (response.services?.data || []).map((p: any) => ({ ...p, type: 'Service' as const }));
        
        // In a real scenario, the backend handles global pagination differently if all are combined.
        // Assuming the backend returns meta for each, we'll aggregate them for the UI.
        const total = (response.properties?.meta?.total || 0) + (response.products?.meta?.total || 0) + (response.services?.meta?.total || 0);
        const page = Math.max(response.properties?.meta?.page || 1, response.products?.meta?.page || 1, response.services?.meta?.page || 1);
        const lastPage = Math.max(response.properties?.meta?.lastPage || 1, response.products?.meta?.lastPage || 1, response.services?.meta?.lastPage || 1);

        return {
          data: [...props, ...prods, ...servs].sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()),
          meta: { total, page, lastPage }
        };
      },
      providesTags: ['Content'],
    }),
    verifyContent: builder.mutation<void, { id: string; type: 'properties' | 'products' | 'services' }>({
      query: ({ id, type }) => ({
        url: `content/${type}/${id}/verify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content', 'Dashboard'],
    }),
    rejectContent: builder.mutation<void, { id: string; type: 'properties' | 'products' | 'services'; reason: string }>({
      query: ({ id, type, reason }) => ({
        url: `content/${type}/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Content', 'Dashboard'],
    }),
    resetContent: builder.mutation<void, { id: string; type: 'properties' | 'products' | 'services' }>({
      query: ({ id, type }) => ({
        url: `content/${type}/${id}/reset`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Content', 'Dashboard'],
    }),
    takedownContent: builder.mutation<void, { id: string; type: 'properties' | 'products' | 'services'; reason: string }>({
      query: ({ id, type, reason }) => ({
        url: `content/${type}/${id}/takedown`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Content', 'Dashboard'],
    }),
    getContentById: builder.query<any, { id: string; type: 'properties' | 'products' | 'services' }>({
      query: ({ id, type }) => `content/${type}/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, { id }) => [{ type: 'Content', id }],
    }),
  }),
});

export const { useGetPendingContentQuery, useGetAllContentQuery, useVerifyContentMutation, useRejectContentMutation, useResetContentMutation, useTakedownContentMutation, useGetContentByIdQuery } = contentApi;
