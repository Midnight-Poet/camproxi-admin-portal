import { baseApi } from './baseApi';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OFFICIAL';
  schoolId?: string;
  createdAt?: string;
}

export const adminsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<Admin[], void>({
      // We don't have a GET /api/admin/admins endpoint documented, but we need one for the page. Let's assume it exists or use an empty list for now.
      query: () => 'admins',
      providesTags: ['Admin'],
    }),
    createAdmin: builder.mutation<void, Partial<Admin>>({
      query: (body) => ({
        url: 'auth/create',
        method: 'POST',
        body: { user: body },
      }),
      invalidatesTags: ['Admin'],
    }),
    updateProfile: builder.mutation<Admin, { name: string; email: string }>({
      query: (body) => ({
        url: 'admins/update',
        method: 'PATCH',
        body,
      }),
    }),
    changePassword: builder.mutation<{ message: string }, any>({
      query: (body) => ({
        url: 'admins/change-password',
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const { useGetAdminsQuery, useCreateAdminMutation, useUpdateProfileMutation, useChangePasswordMutation } = adminsApi;
