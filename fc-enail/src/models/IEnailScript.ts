import { IStep } from "./IStep";

export interface IEnailScript {
    readonly key?: string;
    readonly index?: number;
    readonly title: string;
    readonly step: IStep;
}