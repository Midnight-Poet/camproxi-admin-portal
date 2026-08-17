import { baseApi } from './baseApi';

export interface Campus {
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface School {
  id: string;
  name: string;
  code: string;
  campus: Campus[];
  createdAt: string;
  updatedAt: string;
}

export const schoolApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchools: builder.query<School[], void>({
      query: () => 'school',
      providesTags: ['School'],
    }),
    createSchool: builder.mutation<void, Partial<School>>({
      query: (body) => ({
        url: 'school/new',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['School', 'Dashboard'],
    }),
    updateSchool: builder.mutation<School, { id: string; body: Partial<School> }>({
      query: ({ id, body }) => ({
        url: `school/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['School', 'Dashboard'],
    }),
    deleteSchool: builder.mutation<void, string>({
      query: (id) => ({
        url: `school/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['School', 'Dashboard'],
    }),
  }),
});

export const { useGetSchoolsQuery, useCreateSchoolMutation, useUpdateSchoolMutation, useDeleteSchoolMutation } = schoolApi;
