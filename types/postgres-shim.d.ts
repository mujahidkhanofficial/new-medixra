
// Shim to resolve "Cannot find module 'postgres'" due to ESM/CJS type mismatch
declare module 'postgres' {
    const postgres: <T = any>(
        url?: string | import('postgres').Options<T>,
        options?: import('postgres').Options<T>
    ) => import('postgres').Sql<T>;
    export default postgres;
}
