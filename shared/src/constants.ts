export const EVENTS = {
  JOIN_ROOM: 'join_room',
  PLAYER_JOINED: 'player_joined',
  GAME_START: 'game_start',
  MAKE_MOVE: 'make_move',
  UPDATE_GAME_STATE: 'update_game_state',
  GAME_OVER: 'game_over',
  RESET_GAME: 'reset_game',
  ERROR: 'error',
  DISCONNECT: 'disconnect'
} as const;

export const ROOM_ID_PREFIX = 'room_';
