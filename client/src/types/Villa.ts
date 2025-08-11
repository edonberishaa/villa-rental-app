export interface Villa{
      id: number;
    name: string;
    region: string;
    description: string;
    pricePerNight: number;
    imageUrlsJson: string;
    amenitiesJson?: string;
    address?: string;
    latitude?: number | string;
    longitude?: number | string;
}