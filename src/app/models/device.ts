import { Measurement } from "./measurement";

export interface Device {
    id: string;
    name: string;
    location?: string;
    last_measurement?: Measurement;

}
