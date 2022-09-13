export interface IUserData {
    rgOwnedApps: number[];
    rgIgnoredApps: { [appid: string]: number };
}
