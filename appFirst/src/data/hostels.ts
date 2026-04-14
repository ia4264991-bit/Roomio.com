/*import hostelHero from "@/assets/hostel-hero.jpg";
import hostelRoom from "@/assets/hostel-room-1.jpg";
import hostel2 from "@/assets/hostel-2.jpg";
import hostel3 from "@/assets/hostel-3.jpg";*/

export interface Hostel {
  id: string;
  name: string;
  video: string;
  images: string[];
  location: string;
  phone: string;
  price: string;
  description: string;
}


export const hostels: Hostel[] = [
  {
    id: "1",
    name: "Ocean Breeze Hostel",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    images: [],
    location: "Science Junction, Cape Coast",
    phone: "+233241234567",
    price: "GH₵ 3,500 / year",
    description:
      "A modern, well-ventilated hostel just 5 minutes from the main campus gate. Features include 24/7 water supply, Wi-Fi, spacious rooms with study desks, and a serene environment perfect for focused students.",
  },
  {
    id: "2",
    name: "Palm View Lodge",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    images: [],
    location: "OLA, Cape Coast",
    phone: "+233201234567",
    price: "GH₵ 2,800 / year",
    description:
      "Affordable and comfortable student accommodation close to the OLA junction. Each room comes with a bed, wardrobe, and ceiling fan. Shared kitchen and laundry facilities available.",
  },
  {
    id: "3",
    name: "Campus Heights",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    images: [],
    location: "Apewosika, Cape Coast",
    phone: "+233551234567",
    price: "GH₵ 4,200 / year",
    description:
      "Premium hostel with air-conditioned rooms, en-suite bathrooms, and a rooftop study lounge. Located in the heart of the Apewosika student community with easy access to transport.",
  },
  {
    id: "4",
    name: "Sunrise Apartments",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    images: [],
    location: "Kwaprow, Cape Coast",
    phone: "+233271234567",
    price: "GH₵ 3,000 / year",
    description:
      "Self-contained apartments ideal for postgraduate students. Features a mini kitchenette, private bathroom, and a quiet environment. Security is available 24/7.",
  },
];

