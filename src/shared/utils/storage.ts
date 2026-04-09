import Cookies from "js-cookie";

type StorageKeys = 'ACCESS_TOKEN' | 'REFRESH_TOKEN'

export const Storage = {
    setItem: (key: StorageKeys, value: string, expiresIn?: Date | number) => Cookies.set(key, value, { expires: expiresIn }),
    getItem: (key: StorageKeys) => Cookies.get(key) || null,
    removeItem: (key: StorageKeys) => Cookies.remove(key)
}