export const SOCKET_CONNECT = 'ENAIL/SOCKET/CONNECT';
export const SOCKET_CONNECTED = 'ENAIL/SOCKET/CONNECTED';
export const SOCKET_DISCONNECTED = 'ENAIL/SOCKET/DISCONNECTED';
export const SOCKET_EMIT_STATE = 'ENAIL/EMIT/STATE';

export const SCRIPTS_REQUEST = 'ENAIL/SCRIPTS/REQUEST';
export const SCRIPTS_RESPONSE = 'ENAIL/SCRIPTS/RESPONSE';
export const SCRIPTS_ERROR = 'ENAIL/SCRIPTS/ERROR';

export const SAVE_SCRIPT_REQUEST = 'ENAIL/SCRIPT/SAVE/REQUEST';
export const SAVE_SCRIPT_RESPONSE = 'ENAIL/SCRIPT/SAVE/RESPONSE';
export const SAVE_SCRIPT_ERROR = 'ENAIL/SCRIPT/SAVE/ERROR';

export const DELETE_SCRIPT_REQUEST = 'ENAIL/SCRIPT/DELETE/REQUEST';
export const DELETE_SCRIPT_RESPONSE = 'ENAIL/SCRIPT/DELETE/RESPONSE';
export const DELETE_SCRIPT_ERROR = 'ENAIL/SCRIPT/DELETE/ERROR';

export const PROFILES_REQUEST = 'ENAIL/PROFILES/REQUEST';
export const PROFILES_RESPONSE = 'ENAIL/PROFILES/RESPONSE';
export const PROFILES_ERROR = 'ENAIL/PROFILES/ERROR';

export const DELETE_PROFILE_REQUEST = 'ENAIL/PROFILE/DELETE/REQUEST';
export const DELETE_PROFILE_RESPONSE = 'ENAIL/PROFILE/DELETE/RESPONSE';
export const DELETE_PROFILE_ERROR = 'ENAIL/PROFILE/DELETE/ERROR';

export const SETSP_REQUEST = 'ENAIL/SETSP/REQUEST';
export const SETSP_RESPONSE = 'ENAIL/SETSP/RESPONSE';
export const SETSP_ERROR = 'ENAIL/SETSP/ERROR';

export const TOGGLE_STATE_REQUEST = 'ENAIL/TOGGLESTATE/REQUEST';
export const TOGGLE_STATE_RESPONSE = 'ENAIL/TOGGLESTATE/RESPONSE';
export const TOGGLE_STATE_ERROR = 'ENAIL/TOGGLESTATE/ERROR';

export const RUN_SCRIPT_REQUEST = 'ENAIL/RUN_SCRIPT/REQUEST';
export const RUN_SCRIPT_RESPONSE = 'ENAIL/RUN_SCRIPT/RESPONSE';
export const RUN_SCRIPT_ERROR = 'ENAIL/RUN_SCRIPT/ERROR';

export const END_SCRIPT_REQUEST = 'ENAIL/END_SCRIPT/REQUEST';
export const END_SCRIPT_RESPONSE = 'ENAIL/END_SCRIPT/RESPONSE';
export const END_SCRIPT_ERROR = 'ENAIL/END_SCRIPT/ERROR';

export const SET_SCRIPT_REQUEST = 'ENAIL/SET_SCRIPT/REQUEST';
export const SET_SCRIPT_RESPONSE = 'ENAIL/SET_SCRIPT/RESPONSE';
export const SET_SCRIPT_ERROR = 'ENAIL/SET_SCRIPT/ERROR';

export const SERVICE_FOUND = 'ENAIL/SERVICE/FOUND';
export const RECONNECT = 'ENAIL/SERVICE/RECONNECT';

export const LOCAL_STORAGE_FCENAIL_SERVICE_URL = 'FCENAIL:SERVICEURL';
export const LOCAL_STORAGE_FCENAIL_KEY = 'FCENAIL:AUTH';
export const LOCAL_STORAGE_FCENAIL_THEME = 'FCENAIL:THEME';

export const LOAD_SAVED_STATE_REQUEST = 'ENAIL/SAVED_STATE/LOAD/REQUEST';
export const LOAD_SAVED_STATE_RESPONSE = 'ENAIL/SAVED_STATE/LOAD/RESPONSE';
export const LOAD_SAVED_STATE_ERROR = 'ENAIL/SAVED_STATE/LOAD/ERROR';

export const PERSIST_SAVED_STATE_REQUEST = 'ENAIL/SAVED_STATE/PERSIST/REQUEST';
export const PERSIST_SAVED_STATE_RESPONSE = 'ENAIL/SAVED_STATE/PERSIST/RESPONSE';
export const PERSIST_SAVED_STATE_ERROR = 'ENAIL/SAVED_STATE/PERSIST/ERROR';

export const PASSPHRASE_GENERATE_REQUEST = 'ENAIL/PASSPHRASE/GENERATE/REQUEST';
export const PASSPHRASE_GENERATE_RESPONSE = 'ENAIL/PASSPHRASE/GENERATE/RESPONSE';
export const PASSPHRASE_GENERATE_ERROR = 'ENAIL/PASSPHRASE/GENERATE/ERROR';

export const PASSPHRASE_VERIFY_REQUEST = 'ENAIL/PASSPHRASE/VERIFY/REQUEST';
export const PASSPHRASE_VERIFY_RESPONSE = 'ENAIL/PASSPHRASE/VERIFY/RESPONSE';
export const PASSPHRASE_VERIFY_ERROR = 'ENAIL/PASSPHRASE/VERIFY/ERROR';

export const AUTOTUNE_REQUEST = 'ENAIL/AUTOTUNE/REQUEST';
export const AUTOTUNE_RESPONSE = 'ENAIL/AUTOTUNE/RESPONSE';
export const AUTOTUNE_ERROR = 'ENAIL/AUTOTUNE/ERROR';

export const SAVEPID_REQUEST = 'ENAIL/SAVEPID/REQUEST';
export const SAVEPID_RESPONSE = 'ENAIL/SAVEPID/RESPONSE';
export const SAVEPID_ERROR = 'ENAIL/SAVEPID/ERROR';

export const SET_THEME = 'ENAIL/THEME';

export const LOAD_TOKEN = 'ENAIL/TOKEN/LOAD';
export const TOKEN_LOADED = 'ENAIL/TOKEN/LOADED';

export const MOVE_STEP = 'ENAIL/STEP/MOVE';

export const STEP_PARALLEL = 'parallel';
export const STEP_LOOP = 'loop';
export const STEP_FEEDBACK = 'feedback';
export const STEP_MOVETEMP = 'movetemp';
export const STEP_WAITTEMP = 'waittemp';
export const STEP_TIMER = 'timer';
export const STEP_SEQUENTIAL = 'sequential';

export const UPDATE_VERSION = 'ENAIL/VERSION/UPDATE';

export const ICONS = [
    {title: '-None-', value: ''}, 
    {title: 'Home', value: 'home'}, 
    {title: 'Cloud', value: 'cloud'}, 
    {title: 'Drop', value: 'drop'}, 
    {title: 'Gear', value: 'gear'}, 
    {title: 'Script', value: 'script'}, 
    {title: 'Thermometer', value: 'thermometerDown'}
];

export const SOUNDS = [
    {title: '-None-', value: ''}, 
    {title: 'Appear', value: 'appear'}, 
    {title: 'Beep', value: 'beep'}, 
    {title: 'Bell', value: 'bell'}, 
    {title: 'Chime', value: 'chime'}, 
    {title: 'Complete', value: 'complete'}, 
    {title: 'Disconnected', value: 'disconnected'}, 
    {title: 'Error', value: 'error'}, 
    {title: 'Money', value: 'money'}, 
    {title: 'Organ', value: 'organ'}
];