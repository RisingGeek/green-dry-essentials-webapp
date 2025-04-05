import { useState, useEffect } from 'react';
import { Location } from '@shared/types';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { MapPin } from 'lucide-react';

export function LocationSelector() {
  const [currentLocation, setCurrentLocation] = useState<Location>('both');

  useEffect(() => {
    // Load location preference from localStorage
    const savedLocation = localStorage.getItem('locationPreference') as Location;
    if (savedLocation) {
      setCurrentLocation(savedLocation);
    }
  }, []);

  const handleLocationChange = (location: Location) => {
    setCurrentLocation(location);
    localStorage.setItem('locationPreference', location);
    
    // Trigger event for location change so other components can react
    window.dispatchEvent(new CustomEvent('locationChange', { detail: { location } }));
  };

  return (
    <div className="flex items-center bg-neutral rounded-lg px-3 py-1 border border-secondary">
      <MapPin className="text-primary h-4 w-4 mr-2" />
      <Select
        value={currentLocation}
        onValueChange={(value) => handleLocationChange(value as Location)}
      >
        <SelectTrigger className="bg-transparent text-primary font-medium border-0 focus:ring-0 focus:outline-none p-0 h-auto">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="ghaziabad">Ghaziabad</SelectItem>
            <SelectItem value="noida">Noida</SelectItem>
            <SelectItem value="both">Both Areas</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default LocationSelector;
