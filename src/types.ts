export type UserRole = 'passenger' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  origin: Location;
  destination: Location;
  originAddress: string;
  destinationAddress: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
}
