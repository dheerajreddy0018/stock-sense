import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { COLLECTIONS } from '../../firebase/collections';
import { Warehouse, Location } from '../../types';
import { Building2, MapPin, Mail, User } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const WarehousesView: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const unsubW = dbService.subscribe<Warehouse>(COLLECTIONS.WAREHOUSES, setWarehouses);
    const unsubL = dbService.subscribe<Location>(COLLECTIONS.LOCATIONS, setLocations);
    return () => {
      unsubW();
      unsubL();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Warehouses & Storage Zones
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Multi-hub facility network, storage aisles, and dock allocation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => {
          const whLocations = locations.filter((l) => l.warehouseId === wh.id);

          return (
            <div
              key={wh.id}
              className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-emerald-400 font-semibold">{wh.code}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{wh.name}</h3>
                  </div>
                  <Badge variant="success" dot>Active</Badge>
                </div>

                <div className="mt-3 text-xs text-slate-400 flex items-start gap-1.5">
                  <MapPin size={14} className="mt-0.5 text-slate-500 flex-shrink-0" />
                  <span>{wh.address}</span>
                </div>

                {/* Utilization Progress Bar */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Capacity Utilization</span>
                    <span className="font-mono text-emerald-400 font-bold">{wh.currentUtilization}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${wh.currentUtilization}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>Capacity: {wh.capacity.toLocaleString()} m³</span>
                    <span>Locations: {whLocations.length}</span>
                  </div>
                </div>

                {/* Sub Locations / Bins */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                    Designated Zones ({whLocations.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {whLocations.map((loc) => (
                      <span
                        key={loc.id}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                      >
                        {loc.code} ({loc.type})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Manager footer */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <User size={12} className="text-slate-500" /> {wh.managerName}
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Mail size={12} className="text-slate-500" /> {wh.contactEmail}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
