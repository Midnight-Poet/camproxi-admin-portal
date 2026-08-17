import { baseApi } from './baseApi';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  isverified: boolean;
  isSuspended: boolean;
  schoolId: string;
  campusName: string;
  createdAt: string;
  updatedAt: string;
  companyName?: string;
  category?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<User>, { type: 'Student' | 'Agent'; page?: number; limit?: number }>({
      query: ({ type, page = 1, limit = 20 }) => `users/${type.toLowerCase()}s?page=${page}&limit=${limit}`,
      providesTags: ['User'],
    }),
    suspendUser: builder.mutation<void, { id: string; type: 'students' | 'agents'; suspend: boolean }>({
      query: ({ id, type, suspend }) => ({
        url: `users/${type}/${id}/suspend`,
        method: 'PATCH',
        body: { suspend },
      }),
      invalidatesTags: ['User'],
    }),
    getUserById: builder.query<User, { id: string; type: 'students' | 'agents' }>({
      query: ({ id, type }) => `users/${type}/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, { id }) => [{ type: 'User', id }],
    }),
  }),
});

export const { useGetUsersQuery, useSuspendUserMutation, useGetUserByIdQuery } = usersApi;
