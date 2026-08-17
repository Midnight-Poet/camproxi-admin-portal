import { baseApi } from './baseApi';

export interface DashboardMetrics {
  users: {
    students: number;
    agents: number;
    verifiedAgents: number;
    unverifiedAgents: number;
  };
  pendingContent: {
    properties: number;
    products: number;
    services: number;
    total: number;
  };
  support: {
    openReports: number;
  };
  recentRegistrations: {
    students: { id: string; firstName: string; lastName: string; createdAt: string }[];
    agents: { id: string; companyName: string; category: string; createdAt: string }[];
  };
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<DashboardMetrics, { startDate?: string; endDate?: string } | void>({
      query: (params) => {
        if (!params) return 'metrics/dashboard';
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        const qs = queryParams.toString();
        return qs ? `metrics/dashboard?${qs}` : 'metrics/dashboard';
      },
      transformResponse: (response: any) => {
        return response.data || response;
      },
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardMetricsQuery } = dashboardApi;
