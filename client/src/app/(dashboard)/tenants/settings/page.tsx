"use client";
import SettingsForm from "@/components/SettingsForm";
import {
    useGetAuthUserQuery,
    useUpdateTenantSettingsMutation,
} from "@/state/api";
import React, { use } from "react";

function TenantSettings() {
    const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
    console.log(authUser);
    const [updateTanent] = useUpdateTenantSettingsMutation();

    if (authLoading) return <>Loading...</>;

    const initialData = {
        name: authUser?.userInfo.name,
        email: authUser?.userInfo.email,
        phoneNumber: authUser?.userInfo.phoneNumber,
    };

    const handleSubmit = async (data: typeof initialData) => {
        await updateTanent({
            cognitoId: authUser?.cognitoInfo?.userId,
            ...data,
        });
    };
    return (
        <SettingsForm
            initialData={initialData}
            onSubmit={handleSubmit}
            userType="tenant"
        />
    );
}

export default TenantSettings;
