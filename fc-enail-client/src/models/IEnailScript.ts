import { IStep } from "./IStep";

export interface IEnailScript {
    readonly index?: number;
    readonly title: string;
    readonly step: IStep;
}