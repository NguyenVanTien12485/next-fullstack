import type { Manager, Tenant } from '@/types/prismaTypes';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { createNewUserInDatabase } from '@/lib/utils';

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        prepareHeaders: async (headers) => {
            const session = await fetchAuthSession();

            const { idToken } = session.tokens ?? {};
            if (idToken) {
                headers.set('Authorization', `Bearer ${idToken}`);
            }
            return headers;
        },
    }),
    reducerPath: 'api',
    tagTypes: ['Tenant', 'Manager'],
    endpoints: (build) => ({
        getAuthUser: build.query<User, void>({
            queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
                try {
                    const session = await fetchAuthSession();
                    const { idToken } = session.tokens ?? {};
                    const user = await getCurrentUser();
                    const userRole = idToken?.payload['custom:role'] as string;

                    const endpoint =
                        userRole === 'manager'
                            ? `/managers/${user.userId}`
                            : `/tenants/${user.userId}`;

                    let userDetailsResponse = await fetchWithBQ(endpoint);

                    console.log('userDetailsResponse', userDetailsResponse);

                    // If user is not found in DB, create new user
                    if (
                        userDetailsResponse.error &&
                        userDetailsResponse.error.status === 404
                    ) {
                        userDetailsResponse = await createNewUserInDatabase(
                            user,
                            idToken,
                            userRole,
                            fetchWithBQ,
                        );
                    }

                    return {
                        data: {
                            cognitoInfo: { ...user },
                            userInfo: userDetailsResponse.data as
                                | Tenant
                                | Manager,
                            userRole,
                        },
                    };
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    return {
                        error: error.message || 'Failed to fetch user details',
                    };
                }
            },
        }),

        updateTenantSettings: build.mutation<
            Tenant,
            { cognitoId: string } & Partial<Tenant>
        >({
            query: ({ cognitoId, ...updateTenant }) => ({
                url: `/tenants/${cognitoId}`,
                method: 'PUT',
                body: updateTenant,
            }),
            invalidatesTags: (result) => [
                {
                    type: 'Tenant',
                    id: result?.id,
                },
            ],
        }),

        updateManagerSettings: build.mutation<
            Manager,
            { cognitoId: string } & Partial<Manager>
        >({
            query: ({ cognitoId, ...updateManager }) => ({
                url: `/managers/${cognitoId}`,
                method: 'PUT',
                body: updateManager,
            }),
            invalidatesTags: (result) => [
                {
                    type: 'Manager',
                    id: result?.id,
                },
            ],
        }),
    }),
});

export const {
    useGetAuthUserQuery,
    useUpdateTenantSettingsMutation,
    useUpdateManagerSettingsMutation,
} = api;
