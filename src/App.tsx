import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { io, Socket } from 'socket.io-client';
import { MapPin, Navigation, Search, User, Menu, Bell, Star, Clock, CreditCard, Settings, LogOut, ChevronRight, Bus as Van, Map as MapIcon } from 'lucide-react';
import * as L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { User as UserType, RideRequest, Location } from './types';

// Mock User for Demo
const MOCK_USER: UserType = {
  id: 'user_123',
  name: 'Breno Silva',
  email: 'breno@example.com',
  role: 'passenger',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Breno'
};

const MOCK_DRIVERS = [
  { id: 'driver_1', name: 'João Van', lat: -23.5505, lng: -46.6333, rating: 4.8 },
  { id: 'driver_2', name: 'Maria Van', lat: -23.5555, lng: -46.6383, rating: 4.9 },
  { id: 'driver_3', name: 'Carlos Van', lat: -23.5455, lng: -46.6283, rating: 4.7 },
];

export default function App() {
  const [user, setUser] = useState<UserType>(MOCK_USER);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [view, setView] = useState<'home' | 'booking' | 'ride'>('home');
  const [pickup, setPickup] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<Location>({ lat: -23.5505, lng: -46.6333 });
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize Socket
    socketRef.current = io();
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      socketRef.current?.emit('join-room', user.id);
    });

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user.id]);

  const handleRequestRide = () => {
    const newRide: RideRequest = {
      id: Math.random().toString(36).substr(2, 9),
      passengerId: user.id,
      passengerName: user.name,
      origin: currentLocation,
      destination: { lat: currentLocation.lat + 0.01, lng: currentLocation.lng + 0.01 }, // Mock destination
      originAddress: pickup || 'Minha Localização',
      destinationAddress: destination,
      status: 'pending',
      price: 15.50
    };
    
    setActiveRide(newRide);
    setView('ride');
    socketRef.current?.emit('request-ride', newRide);

    // Simulate driver acceptance after 3 seconds
    setTimeout(() => {
      setActiveRide(prev => prev ? { ...prev, status: 'accepted' } : null);
    }, 3000);
  };

  return (
    <div className="h-screen w-full bg-zinc-50 font-sans overflow-hidden flex flex-col relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-3 bg-white rounded-full shadow-lg pointer-events-auto active:scale-95 transition-transform"
        >
          <Menu className="w-6 h-6 text-zinc-800" />
        </button>
        <div className="bg-white px-4 py-2 rounded-full shadow-lg pointer-events-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-zinc-800">Bora de Van</span>
        </div>
        <button className="p-3 bg-white rounded-full shadow-lg pointer-events-auto active:scale-95 transition-transform">
          <Bell className="w-6 h-6 text-zinc-800" />
        </button>
      </header>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/40 z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 bg-zinc-900 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-emerald-500" />
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                      <span className="text-sm">4.95</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-emerald-500 font-bold">128</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Viagens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-emerald-500 font-bold">R$ 45</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Crédito</div>
                  </div>
                  <div className="text-center">
                    <div className="text-emerald-500 font-bold">Nível 4</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400">Status</div>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                <MenuLink icon={<Clock />} label="Suas Viagens" />
                <MenuLink icon={<CreditCard />} label="Pagamento" />
                <MenuLink icon={<Bell />} label="Notificações" />
                <MenuLink icon={<Settings />} label="Configurações" />
                <div className="h-px bg-zinc-100 my-4" />
                <MenuLink icon={<LogOut />} label="Sair" className="text-red-500" />
              </nav>

              <div className="p-6 bg-zinc-50">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="p-2 bg-emerald-500 rounded-lg text-white">
                    <Van className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-900">Seja um Motorista</div>
                    <div className="text-xs text-emerald-700">Ganhe dinheiro com sua van</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Map Background */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={[currentLocation.lat, currentLocation.lng]} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapUpdater center={currentLocation} />
          
          {/* Current User Marker */}
          <Marker position={[currentLocation.lat, currentLocation.lng]}>
            <Popup>Você está aqui</Popup>
          </Marker>

          {/* Mock Drivers */}
          {MOCK_DRIVERS.map(driver => (
            <Marker 
              key={driver.id} 
              position={[driver.lat, driver.lng]}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="bg-emerald-500 p-2 rounded-full shadow-lg border-2 border-white text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10 5 22h14l-2-12H7z"/><path d="M15 10V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v6"/><path d="M12 15v3"/><path d="M12 15l-3 3"/><path d="M12 15l3 3"/></svg></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })}
            />
          ))}
        </MapContainer>
      </div>

      {/* Bottom Sheet */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.1)] z-50 p-6 pb-10"
      >
        <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />

        {view === 'home' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-zinc-900">Para onde vamos?</h1>
            
            <div className="space-y-3">
              <div 
                onClick={() => setView('booking')}
                className="flex items-center gap-4 p-4 bg-zinc-100 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
              >
                <Search className="w-5 h-5 text-zinc-400" />
                <span className="text-zinc-500 font-medium">Insira o destino</span>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                <QuickAction icon={<Clock />} label="Recentes" />
                <QuickAction icon={<Star />} label="Favoritos" />
                <QuickAction icon={<MapPin />} label="Trabalho" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-zinc-900">Vans Próximas</h3>
                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Ver Todas</span>
              </div>
              <div className="space-y-3">
                <VanCard type="Van Coletiva" time="3 min" price="R$ 12,50" />
                <VanCard type="Van Executiva" time="5 min" price="R$ 18,00" />
              </div>
            </div>
          </div>
        )}

        {view === 'booking' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('home')} className="p-2 hover:bg-zinc-100 rounded-full">
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <h1 className="text-2xl font-bold text-zinc-900">Confirmar Viagem</h1>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="w-0.5 h-8 bg-zinc-200" />
                  <div className="w-2 h-2 rounded-full bg-zinc-900" />
                </div>
                <div className="ml-10 space-y-2">
                  <input 
                    type="text" 
                    placeholder="Ponto de partida" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full p-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Destino" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full p-3 bg-zinc-50 rounded-xl border border-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-lg text-white">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-900">Cartão de Crédito</div>
                    <div className="text-xs text-emerald-700">**** 4582</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400" />
              </div>

              <button 
                onClick={handleRequestRide}
                disabled={!destination}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                Solicitar Bora de Van
              </button>
            </div>
          </div>
        )}

        {view === 'ride' && activeRide && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">
                  {activeRide.status === 'pending' ? 'Procurando Van...' : 'Van a caminho!'}
                </h1>
                <p className="text-zinc-500">
                  {activeRide.status === 'pending' ? 'Aguardando um motorista aceitar' : 'Chega em 4 minutos'}
                </p>
              </div>
              {activeRide.status === 'pending' && (
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {activeRide.status === 'accepted' && (
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-4">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Joao" alt="Driver" className="w-14 h-14 rounded-full border-2 border-emerald-500" />
                <div className="flex-1">
                  <div className="font-bold text-zinc-900">João da Van</div>
                  <div className="text-sm text-zinc-500">Mercedes Sprinter • ABC-1234</div>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm mt-1">
                    <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    <span>4.8</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-white rounded-full shadow-sm border border-zinc-100">
                    <Navigation className="w-5 h-5 text-emerald-600" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setActiveRide(null);
                  setView('home');
                }}
                className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold active:scale-[0.98] transition-transform"
              >
                Cancelar
              </button>
              <button className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-bold active:scale-[0.98] transition-transform">
                Mensagem
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function MapUpdater({ center }: { center: Location }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
}

function MenuLink({ icon, label, className }: { icon: React.ReactNode, label: string, className?: string }) {
  return (
    <button className={cn("w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors text-zinc-700 font-medium", className)}>
      <span className="text-zinc-400">{icon}</span>
      {label}
    </button>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-zinc-200 shadow-sm whitespace-nowrap active:scale-95 transition-transform">
      <span className="text-zinc-400">{icon}</span>
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
    </button>
  );
}

function VanCard({ type, time, price }: { type: string, time: string, price: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 active:scale-[0.98] transition-transform cursor-pointer">
      <div className="p-3 bg-emerald-500 rounded-xl text-white">
        <Van className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-zinc-900">{type}</div>
        <div className="text-xs text-zinc-500">{time} de espera</div>
      </div>
      <div className="text-right">
        <div className="font-bold text-emerald-600">{price}</div>
        <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Estimado</div>
      </div>
    </div>
  );
}
