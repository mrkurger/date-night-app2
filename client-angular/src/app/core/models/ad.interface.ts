export interface Ad {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: {
    city: string;
    country: string;
    coordinates?: [number, number];
  };
  images: string[];
  advertiser: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface AdCreateDTO extends Omit<Ad, '_id' | 'advertiser' | 'createdAt' | 'updatedAt'> {
  images: File[];
}

export interface AdUpdateDTO extends Partial<AdCreateDTO> {}
