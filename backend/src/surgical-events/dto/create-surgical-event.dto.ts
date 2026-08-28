export class CreateSurgicalEventDto {
    sessionId!: string;
    type!: string;
    x?: number;
    y?: number;
    deviation?: number;
    payload?: Record<string, any>;
}
