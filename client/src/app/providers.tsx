"use client";

import StoreProviders from "@/state/redux";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <StoreProviders>
            <>{children}</>
        </StoreProviders>
    );
};

export default Providers;

