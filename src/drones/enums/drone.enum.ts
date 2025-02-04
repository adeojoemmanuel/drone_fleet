export enum DroneModel {
    Lightweight = 'Lightweight',
    Middleweight = 'Middleweight',
    Cruiserweight = 'Cruiserweight',
    Heavyweight = 'Heavyweight',
}
  
export enum DroneState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    LOADED = 'LOADED',
    DELIVERING = 'DELIVERING',
    DELIVERED = 'DELIVERED',
    RETURNING = 'RETURNING',
}