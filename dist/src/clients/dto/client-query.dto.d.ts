export declare enum SearchType {
    NAME = "name",
    DOCUMENT = "document",
    PHONE = "phone"
}
export declare class ClientQueryDto {
    q: string;
    type?: SearchType;
}
