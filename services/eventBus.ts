type Listener = (...args: any[]) => void;

class EventEmitter {
    private events: { [key: string]: Listener[] } = {};

    on(event: string, listener: Listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event: string, listenerToRemove: Listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listenerToRemove);
    }

    emit(event: string, ...args: any[]) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }
}

export const eventBus = new EventEmitter();

export enum GameEvents {
  PLAYER_HP_CHANGE = 'player-hp-change',
  GAME_OVER = 'game-over',
  MISSION_COMPLETE = 'mission-complete',
  START_MISSION = 'start-mission',
  REQUEST_DEV_ACTION = 'request-dev-action'
}