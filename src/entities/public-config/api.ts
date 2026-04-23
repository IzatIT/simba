import { useQuery } from '@tanstack/react-query';
import apiClient from '../../shared/api/api.ts';
import { Path } from '../../shared/api/path.ts';
import type { SiteConfig } from '../../shared/api/types.ts';

// Проект на некоторых эндпоинтах видит двойной envelope {data:{data:...}},
// поэтому безопасно разворачиваем внутренний слой, если он есть.
function unwrap<T>(raw: unknown): T {
    const r = raw as { data?: T } & T;
    return ((r && typeof r === 'object' && 'data' in r ? (r as { data: T }).data : r) as T);
}

export const publicConfigApi = {
    getConfig: async (): Promise<SiteConfig> => {
        const res = await apiClient.get(Path.Configuration.Public);
        return unwrap<SiteConfig>(res.data);
    },
};

export const usePublicConfig = () =>
    useQuery<SiteConfig>({
        queryKey: ['public-config'],
        queryFn: publicConfigApi.getConfig,
        staleTime: 5 * 60_000,
    });
