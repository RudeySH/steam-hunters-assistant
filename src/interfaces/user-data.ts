export interface UserData {
    rgOwnedApps: number[];
    rgIgnoredApps: { [appid: string]: number };
}
