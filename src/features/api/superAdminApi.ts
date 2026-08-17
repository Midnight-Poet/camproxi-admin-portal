import { baseApi } from './baseApi';

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  details: string;
  createdAt: string;
  admin: {
    id: string;
    email: string;
    name: string;
    username: string;
    role: string;
  };
}

export interface GlobalSettings {
  maintenance_mode: string;
  service_fee_percentage: string;
  [key: string]: string;
}

export const superAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLog[], void>({
      query: () => 'audit-logs',
      providesTags: ['AuditLogs'],
    }),
    getSettings: builder.query<GlobalSettings, void>({
      query: () => 'settings',
      providesTags: ['Settings'],
    }),
    updateSetting: builder.mutation<void, { key: string; value: any }>({
      query: (body) => ({
        url: 'settings',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetAuditLogsQuery, useGetSettingsQuery, useUpdateSettingMutation } = superAdminApi;
