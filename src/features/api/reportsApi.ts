import { baseApi } from './baseApi';

export interface Reporter {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Target {
  name?: string;
  businessCategory?: string;
  [key: string]: any;
}

export interface Report {
  id: string;
  subject: string;
  message: string;
  reporterId: string;
  reporterType: 'STUDENT' | 'AGENT';
  reporter?: Reporter;
  targetType?: string;
  targetId?: string;
  itemCategory?: string;
  target?: Target;
  status: 'OPEN' | 'RESOLVED';
  reply: string | null;
  repliedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<Report[], void>({
      query: () => 'reports',
      transformResponse: (response: any) => Array.isArray(response) ? response : response?.data || [],
      providesTags: ['Report'],
    }),
    getReportById: builder.query<Report, string>({
      query: (id) => `reports/${id}`,
      transformResponse: (response: any) => response?.data || response,
      providesTags: (_result, _error, id) => [{ type: 'Report', id }],
    }),
    replyToReport: builder.mutation<void, { id: string; reply: string }>({
      query: ({ id, reply }) => ({
        url: `reports/${id}/reply`,
        method: 'PATCH',
        body: { reply },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Report', id: 'LIST' },
        { type: 'Report', id },
        { type: 'Dashboard', id: 'LIST' }
      ],
    }),
  }),
});

export const { useGetReportsQuery, useGetReportByIdQuery, useReplyToReportMutation } = reportsApi;
