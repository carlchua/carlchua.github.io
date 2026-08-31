/// <reference types="vite/client" />

declare module 'reshake' {
    import type { ComponentType, CSSProperties, ReactNode } from 'react';

    export interface ShakeProps {
        h?: number;
        v?: number;
        r?: number;
        dur?: number;
        int?: number;
        max?: number;
        fixed?: boolean;
        fixedStop?: boolean;
        freez?: boolean;
        q?: number;
        className?: string;
        style?: CSSProperties;
        children?: ReactNode;
    }

    export const Shake: ComponentType<ShakeProps>;
}
