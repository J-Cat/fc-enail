import { IPidSettings } from './IPidSettings';

export interface ISavedProfiles {
    readonly currentProfile?: string;
    readonly profiles: {
        readonly [profile: string]: IPidSettings;
    };
}