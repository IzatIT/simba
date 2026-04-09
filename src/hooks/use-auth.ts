export const useAuth = () => {
    const getAccessToken = (): string | null => {
        const cookies = document.cookie.split('; ');
        const tokenCookie = cookies.find(row => row.startsWith('ACCESS_TOKEN='));
        return tokenCookie ? tokenCookie.split('=')[1] : null;
    };

    return {
        isAuthenticated: !!getAccessToken(),
        token: getAccessToken()
    };
};