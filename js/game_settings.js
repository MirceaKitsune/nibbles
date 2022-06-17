// This file contains only the settings objects and helper functions used to generate them, the engine is launched after this and reads the relevant variables
// ITEM_COLOR must contain color names matching their respective image and sound file names, should be 8 in total to match statuses
// ITEM_SPRITE_SEGMENT_* is based on item angle: 0 = up, 1 = right, 2 = down, 3 = left
// DATA_BACKGROUNDS represents the background names based on difficulty, 4 in total
// DATA_DIALOGS is the list of dialog skins used by text messages
// DATA_VOICES contains the name of each vocal pattern sound
const DISPLAY_CANVAS_ZOOM = 3;
const DISPLAY_CANVAS_BOX = [(window.innerWidth / 2) - (64 * DISPLAY_CANVAS_ZOOM), (window.innerHeight / 2) - (128 * DISPLAY_CANVAS_ZOOM), 128 * DISPLAY_CANVAS_ZOOM, 256 * DISPLAY_CANVAS_ZOOM];
const DISPLAY_GAME_PADDING = 2;
const DISPLAY_FONT_SIZE = 6 * DISPLAY_CANVAS_ZOOM;
const DISPLAY_FONT_DURATION = 6;
const DISPLAY_FONT_SHADOW = DISPLAY_CANVAS_ZOOM;
const DISPLAY_FONT_SHADOW_COLOR = "#000000";
const DISPLAY_LABEL_LIMIT = 9999;
const DISPLAY_LABEL_SPEED = 0.0125;
const MUSIC_TITLE = 26;
const MUSIC_TITLE_NIGHTMARE = 27;
const ITEM_COLOR = ["red", "yellow", "green", "cyan", "blue", "pink", "white", "black"];
const ITEM_SPRITE_TARGET = "target";
const ITEM_SPRITE_SINGLE = "center";
const ITEM_SPRITE_SEGMENT_START = ["bottom", "left", "top", "right"];
const ITEM_SPRITE_SEGMENT_CENTER = ["vertical", "horizontal", "vertical", "horizontal"];
const ITEM_SPRITE_SEGMENT_END = ["top", "right", "bottom", "left"];
const DATA_SCENE = ["home", "garden", "lake", "roof", "bedroom", "home", "garden", "lake", "roof", "bedroom", "home", "garden", "lake", "roof", "bedroom", "home", "garden", "lake", "roof", "bedroom", "garden"];
const DATA_BACKGROUNDS = ["easy", "medium", "hard", "nightmare"];
const DATA_DIALOGS = ["random_single", "random_multi_start", "random_multi", "random_multi_end", "level_single", "level_multi_start", "level_multi", "level_multi_end", "game_start_nightmare", "game_start_1", "game_start_2", "game_start_3", "game_start_4", "game_start_5", "game_start_6", "game_end_lose_red", "game_end_lose_yellow", "game_end_lose_green", "game_end_lose_cyan", "game_end_lose_blue", "game_end_lose_pink", "game_end_lose_white", "game_end_lose_black", "game_end_lose", "game_end_win_0", "game_end_win_1", "game_end_win_2_easy", "game_end_win_2_medium", "game_end_win_2_hard", "game_end_win_2_nightmare", "game_end_win_3_nightmare", "game_end_win_4_nightmare", "game_end_win_secret_0", "game_end_win_secret_1"];
const DATA_VOICES = ["character_color_red", "character_color_yellow", "character_color_green", "character_color_cyan", "character_color_blue", "character_color_pink", "character_color_white", "character_color_black", "character_random_1", "character_random_2", "character_random_3", "character_random_4", "player_random_1", "player_random_2", "player_random_3", "player_random_4", "default_random_1", "default_random_2"];
const DATA_MUSIC = ["biohazard_opening", "biohazard", "die_hard_battle", "no_stars", "overdrive", "nightmare", "chipped_urgency", "hydrostat_prototype", "tecnological_messup", "dance_field", "start_of_rise", "decesive_frontier", "one_last_time", "on_your_toes", "dawn_of_hope", "hail_the_arbiter", "heavens_forbid", "zenostar", "too_strong", "agressive_action", "unknown_space", "hells_god_1", "hells_god_2", "hells_god_3", "hells_god_4", "a_path_which_leads_to_somewhere", "revelation_synth", "revelation"];

// Character name is fixed, player name can be set via URL parameter
// Nightmare mode is unlocked when the player uses the same name as the main character
const NAME_PLAYER_DEFAULT = "Napi";
const NAME_PLAYER_NIGHTMARE = "Selbbin";
var NAME_PLAYER = window.location.hash.substring(1).slice(0, 8) || NAME_PLAYER_DEFAULT;
const NAME_CHARACTER = "Nibbles";
const NIGHTMARE = NAME_PLAYER.toLowerCase() == NAME_CHARACTER.toLowerCase();
const NIGHTMARE_AFTER = NAME_PLAYER.toLowerCase() == NAME_PLAYER_NIGHTMARE.toLowerCase();

// Function for setting item colors, when a color is undefined a random one used during normal stages is picked, one of the colors is replaced by the last color in nightmare mode
function get_color() {
	var colors = [];
	for(let i = 0; i < arguments.length; i++)
		colors.push(!isNaN(arguments[i]) ? arguments[i] : Math.floor(Math.random() * (ITEM_COLOR.length - 2)));
	if(NIGHTMARE) {
		const color_replace = colors[Math.floor(Math.random() * colors.length)];
		for(let c in colors)
			if(colors[c] == color_replace)
				colors[c] = ITEM_COLOR.length - 1;
	}
	return colors;
}

// Function for getting item lengths, 1 is added in nightmare mode
function get_length() {
	var lengths = [];
	for(let i = 0; i < arguments.length; i++)
		lengths.push(arguments[i] + (NIGHTMARE ? 1 : 0));
	return lengths;
}

// The dialog presets below allow messages to be easily defined later by addressing a circumstance and its position instead of having to manually define everything
const dialog_height_interactive = (DISPLAY_CANVAS_BOX[3] / 2) + (DISPLAY_FONT_SIZE * 4);
const dialog_height_random = DISPLAY_FONT_SIZE * 5;
const dialog_presets = {
	// Type presets: Configures background and trigger configurations based on chain positions
	// Random and level messages are numbered as: 0 = Singular message (triggered, ends), 1 = First message in a chain (triggered, continues), 2 to * = Middle message in a chain (not triggered, continues), 3 = Last message in a chain (not triggered, ends)
	// Intermission messages using custom art follow the same pattern with no singular message: 0 is the start, 1 to * is a continuation, 2 is the end
	// The first number in the lost ending set represents each entry in ITEM_COLOR since failed endings are color dependent
	"type_random_0": {"trigger_at": 1, "next": 0, "interactive": false, "height": dialog_height_random, "background": 0},
	"type_random_1": {"trigger_at": 1, "next": 1, "interactive": false, "height": dialog_height_random, "background": 1},
	"type_random_2": {"trigger_at": 0, "next": 1, "interactive": false, "height": dialog_height_random, "background": 2},
	"type_random_3": {"trigger_at": 0, "next": 0, "interactive": false, "height": dialog_height_random, "background": 3},
	"type_level_0": {"trigger_at": 2, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 4},
	"type_level_1": {"trigger_at": 2, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 5},
	"type_level_2": {"trigger_at": 0, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 6},
	"type_level_3": {"trigger_at": 0, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 7},
	"type_start_0": {"trigger_at": 2, "trigger_level": [0], "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 8},
	"type_start_1": {"trigger_at": 2, "trigger_level": [0], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 9, "music": 21},
	"type_start_2": {"trigger_at": 0, "trigger_level": [0], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 10},
	"type_start_3": {"trigger_at": 0, "trigger_level": [0], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 11},
	"type_start_4": {"trigger_at": 0, "trigger_level": [0], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 12},
	"type_start_5": {"trigger_at": 0, "trigger_level": [0], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 13},
	"type_start_6": {"trigger_at": 0, "trigger_level": [0], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 14},
	"type_end_lose_0_0": {"trigger_at": 3, "trigger_color": [0], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 15, "color": "#ffffff", "music": 22},
	"type_end_lose_0_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 15, "color": "#ffffff"},
	"type_end_lose_0_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23}, "color": "#ffffff",
	"type_end_lose_0_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ff0000"},
	"type_end_lose_1_0": {"trigger_at": 3, "trigger_color": [1], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 16, "color": "#ffffff", "music": 22},
	"type_end_lose_1_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 16, "color": "#ffffff"},
	"type_end_lose_1_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_1_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffff00"},
	"type_end_lose_2_0": {"trigger_at": 3, "trigger_color": [2], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 17, "color": "#ffffff", "music": 22},
	"type_end_lose_2_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 17, "color": "#ffffff"},
	"type_end_lose_2_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_2_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#00ff00"},
	"type_end_lose_3_0": {"trigger_at": 3, "trigger_color": [3], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 18, "color": "#ffffff", "music": 22},
	"type_end_lose_3_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 18, "color": "#ffffff"},
	"type_end_lose_3_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_3_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#00ffff"},
	"type_end_lose_4_0": {"trigger_at": 3, "trigger_color": [4], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 19, "color": "#ffffff", "music": 22},
	"type_end_lose_4_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 19, "color": "#ffffff"},
	"type_end_lose_4_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_4_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#0000ff"},
	"type_end_lose_5_0": {"trigger_at": 3, "trigger_color": [5], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 20, "color": "#ffffff", "music": 22},
	"type_end_lose_5_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 20, "color": "#ffffff"},
	"type_end_lose_5_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_5_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ff00ff"},
	"type_end_lose_6_0": {"trigger_at": 3, "trigger_color": [6], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 21, "color": "#ffffff", "music": 23},
	"type_end_lose_6_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 21, "color": "#ffffff"},
	"type_end_lose_6_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_6_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_7_0": {"trigger_at": 3, "trigger_color": [7], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 22, "color": "#ffffff", "music": 23},
	"type_end_lose_7_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 22, "color": "#ffffff"},
	"type_end_lose_7_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_7_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#7f7f7f"},
	"type_end_win_easy_0": {"trigger_at": NIGHTMARE_AFTER ? 0 : 4, "trigger_difficulty": [0], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 24, "color": "#ffffff", "music": 24},
	"type_end_win_easy_1": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 25, "color": "#ffffff"},
	"type_end_win_easy_2": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 26, "color": "#ffffff"},
	"type_end_win_easy_3": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 26, "color": "#ffffff"},
	"type_end_win_medium_0": {"trigger_at": NIGHTMARE_AFTER ? 0 : 4, "trigger_difficulty": [1], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 24, "color": "#ffffff", "music": 24},
	"type_end_win_medium_1": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 25, "color": "#ffffff"},
	"type_end_win_medium_2": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 27, "color": "#ffffff"},
	"type_end_win_medium_3": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 27, "color": "#ffffff"},
	"type_end_win_hard_0": {"trigger_at": NIGHTMARE_AFTER ? 0 : 4, "trigger_difficulty": [2], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 24, "color": "#ffffff", "music": 24},
	"type_end_win_hard_1": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 25, "color": "#ffffff"},
	"type_end_win_hard_2": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 28, "color": "#ffffff"},
	"type_end_win_hard_3": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 28, "color": "#ffffff"},
	"type_end_win_nightmare_0": {"trigger_at": NIGHTMARE_AFTER ? 0 : 4, "trigger_difficulty": [3], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 24, "color": "#ffffff", "music": 24},
	"type_end_win_nightmare_1": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 25, "color": "#ffffff"},
	"type_end_win_nightmare_2": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 29, "color": "#ffffff"},
	"type_end_win_nightmare_3": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 30, "color": "#ffffff"},
	"type_end_win_nightmare_4": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 31, "color": "#ffffff"},
	"type_end_win_nightmare_5": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 31, "color": "#ffffff"},
	"type_end_win_secret_0": {"trigger_at": NIGHTMARE_AFTER ? 4 : 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 32, "color": "#ffffff", "music": 20},
	"type_end_win_secret_1": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 32, "color": "#ffffff"},
	"type_end_win_secret_2": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 33, "color": "#ffffff"},
	"type_end_win_secret_3": {"trigger_at": 0, "trigger_difficulty": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 33, "color": "#ffffff"},
	// Actor presets: Configures color triggers, character names, text color and sound
	// 0 = Character, 1 = Player, 2 = Default... the character includes colors representing each entry in ITEM_COLOR
	"actor_0_0": {"trigger_color": [0], "sound": [0], "color": "#ff0000", "name": NAME_CHARACTER},
	"actor_0_1": {"trigger_color": [1], "sound": [1], "color": "#ffff00", "name": NAME_CHARACTER},
	"actor_0_2": {"trigger_color": [2], "sound": [2], "color": "#00ff00", "name": NAME_CHARACTER},
	"actor_0_3": {"trigger_color": [3], "sound": [3], "color": "#00ffff", "name": NAME_CHARACTER},
	"actor_0_4": {"trigger_color": [4], "sound": [4], "color": "#0000ff", "name": NAME_CHARACTER},
	"actor_0_5": {"trigger_color": [5], "sound": [5], "color": "#ff00ff", "name": NAME_CHARACTER},
	"actor_0_6": {"trigger_color": [6], "sound": [6], "color": "#ffffff", "name": NAME_CHARACTER},
	"actor_0_7": {"trigger_color": [7], "sound": [7], "color": "#7f7f7f", "name": NAME_CHARACTER},
	"actor_0": {"trigger_color": undefined, "sound": [8, 9, 10, 11], "color": "#ffffff", "name": NAME_CHARACTER},
	"actor_1": {"trigger_color": undefined, "sound": [12, 13, 14, 15], "color": "#000000", "name": NAME_PLAYER},
	"actor_2": {"trigger_color": undefined, "sound": [16, 17], "color": "#ffffff", "name": undefined},
	// Level filters for single levels
	"filter_level_0": {"trigger_level": [0]},
	"filter_level_1": {"trigger_level": [1]},
	"filter_level_2": {"trigger_level": [2]},
	"filter_level_3": {"trigger_level": [3]},
	"filter_level_4": {"trigger_level": [4]},
	"filter_level_5": {"trigger_level": [5], "music": 25},
	"filter_level_10": {"trigger_level": [10], "music": 25},
	"filter_level_15": {"trigger_level": [15], "music": 25},
	"filter_level_20": {"trigger_level": [20], "music": 25},
	"filter_level_25": {"trigger_level": [25], "music": 25},
	"filter_level_30": {"trigger_level": [30], "music": 25},
	"filter_level_35": {"trigger_level": [35], "music": 25},
	"filter_level_40": {"trigger_level": [40], "music": 25},
	"filter_level_45": {"trigger_level": [45], "music": 25},
	"filter_level_50": {"trigger_level": [50], "music": 25},
	"filter_level_55": {"trigger_level": [55], "music": 25},
	"filter_level_60": {"trigger_level": [60], "music": 25},
	"filter_level_65": {"trigger_level": [65], "music": 25},
	"filter_level_70": {"trigger_level": [70], "music": 25},
	"filter_level_75": {"trigger_level": [75], "music": 25},
	"filter_level_80": {"trigger_level": [80], "music": 25},
	"filter_level_85": {"trigger_level": [85], "music": 25},
	"filter_level_90": {"trigger_level": [90]},
	"filter_level_95": {"trigger_level": [95]},
	"filter_level_96": {"trigger_level": [96]},
	"filter_level_97": {"trigger_level": [97]},
	"filter_level_98": {"trigger_level": [98]},
	"filter_level_99": {"trigger_level": [99]},
	"filter_level_100": {"trigger_level": [100]},
	// Level filters for level ranges
	"filter_level_0_4": {"trigger_level": [0, 1, 2, 3, 4]},
	"filter_level_5_29": {"trigger_level": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]},
	"filter_level_30_59": {"trigger_level": [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]},
	"filter_level_60_89": {"trigger_level": [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89]},
	"filter_level_90_99": {"trigger_level": [90, 91, 92, 93, 94, 95, 96, 97, 98, 99]},
	// Difficulty filters
	"filter_difficulty_standard": {"trigger_difficulty": [0, 1, 2]},
	"filter_difficulty_easy": {"trigger_difficulty": [0]},
	"filter_difficulty_medium": {"trigger_difficulty": [1]},
	"filter_difficulty_hard": {"trigger_difficulty": [2]},
	"filter_difficulty_nightmare": {"trigger_difficulty": [3]}
};

// Function for compiling dialog messages, uses presets to minimize the number of overrides necessary to specify per message
// Overrides are specified as an object with the same structure to apply more specific settings on top of the preset
function get_dialog_message(presets, text) {
	var settings = {"trigger_at": undefined, "trigger_difficulty": undefined, "trigger_level": undefined, "trigger_color": undefined, "next": 0, "height": 0, "color": "#ffffff", "background": 0, "sound": 0, "music": undefined, "interactive": false, "name": undefined, "text": ""};
	for(let p in presets)
		for(let i in dialog_presets[presets[p]])
			settings[i] = dialog_presets[presets[p]][i];
	settings.text = text;
	return settings;
}

// This contains the chat messages shown when winning / losing, in between levels, or idly during the game
const settings_dialog = [
	// Game lost, red ending
	get_dialog_message(["actor_2", "type_end_lose_0_0"], "Uh oh: Looks like you got " + NAME_CHARACTER + " very angry. Which probably wasn't your fault, but not good for you regardless."),
	get_dialog_message(["actor_2", "type_end_lose_0_1"], "The cat decides it's not worth the effort saving your life. You hear what's probably the equivalent of \"fuck you\" in their language."),
	get_dialog_message(["actor_2", "type_end_lose_0_1"], "You're left inside to be digested or vaporized or assimilated or whatever. If you behave you may have a few days left to reflect."),
	get_dialog_message(["actor_2", "type_end_lose_0_2"], "But hey, look at the bright side: At least no one can tell you what to do any more! No work , no obligations... how cool is that?"),
	get_dialog_message(["actor_2", "type_end_lose_0_2"], "You spend your last moments yelling offensive slurs since no one can ban you here. " + NAME_CHARACTER + " finds that very funny."),
	get_dialog_message(["actor_2", "type_end_lose_0_3"], "ENDING 1 / 12:\n\nRED SUNRISE"),
	// Game lost, yellow ending
	get_dialog_message(["actor_2", "type_end_lose_1_0"], "Seems " + NAME_CHARACTER + " couldn't handle how utterly fucked your planet is: He snaps and runs away scream-meowing in panic."),
	get_dialog_message(["actor_2", "type_end_lose_1_1"], "Due to the shock his stomach shuts tight permanently. He apologizes profusely later that day, but you're still stuck there forever."),
	get_dialog_message(["actor_2", "type_end_lose_1_1"], "And no, there's no teleporter to get you out. Seriously couldn't you tell " + NAME_CHARACTER + " was just trolling you with that?"),
	get_dialog_message(["actor_2", "type_end_lose_1_2"], "You go on to have a happy life in there. " + NAME_CHARACTER + " offers you a tablet connected to kittynet, you realize it's all you ever needed."),
	get_dialog_message(["actor_2", "type_end_lose_1_3"], "ENDING 2 / 12:\n\nLEMON YELLOW"),
	// Game lost, green ending
	get_dialog_message(["actor_2", "type_end_lose_2_0"], "Unfortunately " + NAME_CHARACTER + " got very sick during the process of saving you. He was okay a few days later... the same can't be said for you."),
	get_dialog_message(["actor_2", "type_end_lose_2_1"], "Their stomach goes haywire and starts to absorb you into its fabric. Within minutes you're already too glued to be separated."),
	get_dialog_message(["actor_2", "type_end_lose_2_2"], "Technically you aren't gonna die? You'll like, get absorbed into the walls and spend your life just staring into the cat's gullet 24/7."),
	get_dialog_message(["actor_2", "type_end_lose_2_2"], "You won't even need to be fed or given air! It might get boring after a while though. I guess this is what being a tree feels like."),
	get_dialog_message(["actor_2", "type_end_lose_2_3"], "ENDING 3 / 12:\n\nLEAF GREEN"),
	// Game lost, cyan ending
	get_dialog_message(["actor_2", "type_end_lose_3_0"], "The pills cause " + NAME_CHARACTER + "'s body to go in overdrive. While we're happy this ends in him being healthy, you are a little bit screwed."),
	get_dialog_message(["actor_2", "type_end_lose_3_1"], "Their stomach is so efficient it pulls you down into its lower parts. You aren't harmed but can't ever climb back up again either."),
	get_dialog_message(["actor_2", "type_end_lose_3_2"], "You spend your life exploring a gooey fleshy maze. If you could you'd start a club in there and dance with all the lost items."),
	get_dialog_message(["actor_2", "type_end_lose_3_3"], "ENDING 4 / 12:\n\nCYAN SKY"),
	// Game lost, blue ending
	get_dialog_message(["actor_2", "type_end_lose_4_0"], NAME_CHARACTER + " found your rescue attempt so boring they fell asleep while saving you. You hope they wake up quickly and soon enough they do."),
	get_dialog_message(["actor_2", "type_end_lose_4_1"], "Just one problem: The sleep was so deep that " + NAME_CHARACTER + " forgot all about you. With the translator down they can't hear you either."),
	get_dialog_message(["actor_2", "type_end_lose_4_1"], "You scream and kick to get their attention but are so puny it's unnoticeable. By now the kitty must have returned to their home planet."),
	get_dialog_message(["actor_2", "type_end_lose_4_2"], "You manage to adapt, living off food that ends up in there with you. But it's boring since not even the creature you're in knows you exist."),
	get_dialog_message(["actor_2", "type_end_lose_4_2"], "You wonder if by sheer look they'll someday discover you. Wouldn't bet on it though: You seem pretty lost to the comforting silence in there."),
	get_dialog_message(["actor_2", "type_end_lose_4_3"], "ENDING 5 / 12:\n\nBLUE LAKE"),
	// Game lost, pink ending
	get_dialog_message(["actor_2", "type_end_lose_5_0"], "Of all the weird fates that could befall you, you just had to pick the weirdest one. Should I even ask if you did this on purpose?"),
	get_dialog_message(["actor_2", "type_end_lose_5_1"], NAME_CHARACTER + " decides it's foolish to get you out given all the happy fun they can have keeping you in... look it's tragic for you okay?!"),
	get_dialog_message(["actor_2", "type_end_lose_5_1"], "No one knows what happens to you. Even if they did they probably couldn't say... not without getting this Git repository banned."),
	get_dialog_message(["actor_2", "type_end_lose_5_2"], "I... think you go on to have a happy life. Not gonna assume. Actually the fact that you're here is an indication so we're optimistic."),
	get_dialog_message(["actor_2", "type_end_lose_5_2"], "You often ponder if God will allow you in heaven when you eventually die. You're lucky though: God is secretly hip with this. Le sigh."),
	get_dialog_message(["actor_2", "type_end_lose_5_3"], "ENDING 6 / 12:\n\nGUMMY PINK"),
	// Game lost, white ending
	get_dialog_message(["actor_2", "type_end_lose_6_0"], "There was a flash of light. It's all one can remember happening. After that everything was light. This is but a nexus point."),
	get_dialog_message(["actor_2", "type_end_lose_6_1"], "You remember all things that happened and didn't happen. It's hard to tell which is which. You sense you will return here."),
	get_dialog_message(["actor_2", "type_end_lose_6_1"], "Don't mind the others: Some were grumpy, others were just curious. Taking on so many can be hard, but they both did a great job."),
	get_dialog_message(["actor_2", "type_end_lose_6_3"], "ENDING 7 / 12:\n\nSNOW WHITE"),
	// Game lost, black ending
	get_dialog_message(["actor_2", "type_end_lose_7_0"], "ERROR: ZERO STATE, MEMORY BLANK. RUN IS INVALID, CANNOT FORM NEURAL PATH. TIMELINE " + Math.floor(Math.random() * 10000) + " WILL BE FORGOTTEN AFTER RESET."),
	get_dialog_message(["actor_2", "type_end_lose_7_1"], "WARNING: PAIN NOT ASSOCIATED WITH MEMORY. PAIN YOU CAUSED, PAIN YOU RECEIVED... CANNOT BE DISTINGUISHED IN SOUL STORAGE."),
	get_dialog_message(["actor_2", "type_end_lose_7_1"], "NOTICE: 100 IS INVALID. DATA INCOMPATIBLE WITH USER: PLEASE DO NOT RETURN TO AVOID FURTHER INCONSISTENCIES."),
	get_dialog_message(["actor_2", "type_end_lose_7_3"], "ENDING 8 / 12:\n\nBLACK SPACE\n\n01010010 01000101 01001101 01000101 01001101 01000010 01000101 01010010"),
	// Game won, easy ending
	get_dialog_message(["actor_2", "type_end_win_easy_0"], "Suddenly you feel your puny body lifted into the air like a feather. There's nothing you can do but go with the flow."),
	get_dialog_message(["actor_2", "type_end_win_easy_1"], "Like a child reaching the end of a water slide, you're thrown to the ground in a puddle of kitty tummy gum."),
	get_dialog_message(["actor_2", "type_end_win_easy_2"], "You immediately get up and walk away, not even turning to say goodbye to " + NAME_CHARACTER + ". He waves at you sadly as you disappear."),
	get_dialog_message(["actor_2", "type_end_win_easy_2"], "You chose the easiest way out after all. Maybe you'll miss them and regret not even saying goodbye, I know some do."),
	get_dialog_message(["actor_2", "type_end_win_easy_2"], "But hey: You survived and won't be spending the rest of your life in a belly! Now you can finally get back to your grueling chores."),
	get_dialog_message(["actor_2", "type_end_win_easy_3"], "ENDING 9 / 12:\n\nEASY HACK"),
	// Game won, medium ending
	get_dialog_message(["actor_2", "type_end_win_medium_0"], "You suddenly feel your body being pushed up. You take the opportunity and thrust yourself upward."),
	get_dialog_message(["actor_2", "type_end_win_medium_1"], "Like a driver thrown out of a moving car, you fall to the ground in a pool of cat belly juice."),
	get_dialog_message(["actor_2", "type_end_win_medium_2"], NAME_CHARACTER + " picks you up and holds you, happy to see that you're safe. He isn't sure how you feel... to be fair you aren't either."),
	get_dialog_message(["actor_2", "type_end_win_medium_2"], "You chose to handle the situation methodically and without forcing " + NAME_CHARACTER + " during the process. They're grateful for that."),
	get_dialog_message(["actor_2", "type_end_win_medium_2"], "Eventually it's time to say your goodbyes. You regret they couldn't stay longer but are happy to remember your adventures."),
	get_dialog_message(["actor_2", "type_end_win_medium_3"], "ENDING 10 / 12:\n\nMEDIUM SIZED"),
	// Game won, hard ending
	get_dialog_message(["actor_2", "type_end_win_hard_0"], "As you hang on with all your might, you feel your body being propelled upward. Like a superhero you jump into the exit above you."),
	get_dialog_message(["actor_2", "type_end_win_hard_1"], "Like a fighter shot out of a tank, you land on the ground in a lake of alien stomach acid."),
	get_dialog_message(["actor_2", "type_end_win_hard_2"], "To their complete surprise, your first action as you get up is giving " + NAME_CHARACTER + " a big hug. They don't even know how to respond."),
	get_dialog_message(["actor_2", "type_end_win_hard_2"], "You chose to make things harder for yourself and stay in there for longer. Maybe you enjoyed it, or perhaps you liked the challenge."),
	get_dialog_message(["actor_2", "type_end_win_hard_2"], "Sadly " + NAME_CHARACTER + " can't take you home with them. They suggest that if you ever feel lonely, try saying their name out loud next time."),
	get_dialog_message(["actor_2", "type_end_win_hard_3"], "ENDING 11 / 12:\n\nHARD SHELL"),
	// Game won, nightmare ending
	get_dialog_message(["actor_2", "type_end_win_nightmare_0"], "No... impossible, it cannot be. No one can get this far on their own, you must have changed the source code! Don't... get... out..."),
	get_dialog_message(["actor_2", "type_end_win_nightmare_1"], "Argh! Do you have any idea what you've done? This mode disabled their failsafe, the one thing that kept your DNA shielded!"),
	get_dialog_message(["actor_2", "type_end_win_nightmare_1"], "Have your horror ending then: Now you're gonna mutate! Either you'll become a giant tumor or shift into the monstrosity you..."),
	get_dialog_message(["actor_2", "type_end_win_nightmare_2"], "Ummm... what? Wait this isn't supposed to happen! " + NAME_CHARACTER + " can't alter... is it because you stole their name?"),
	get_dialog_message(["actor_2", "type_end_win_nightmare_2"], "Whatever: It's hopefully not too late to change you back. This isn't a supported future and it's breaking things! Let's see if I can..."),
	get_dialog_message(["actor_2", "type_end_win_nightmare_3"], "... okay fine, you win: " + NAME_CHARACTER + " loves your new form and this is too darn adorable to get in the way. You can say thank you and give them a kiss!"),
	get_dialog_message(["actor_2", "type_end_win_nightmare_3"], "You're stuck like this forever then. Congratulations, enjoy your break! I can tell you're gonna have so much fun together..."),
	get_dialog_message(["actor_2", "type_end_win_nightmare_4"], "So... much... fun. Yep, that's your reward for all the effort you made, hope you're proud. Now close this tab and return later."),
	get_dialog_message(["actor_2", "type_end_win_nightmare_5"], "ENDING 12 / 12:\n\nGOOD DREAM\n\n01001001 00100111 01001101 00100000 01001000 01001111 01001101 01000101"),
	// Game won, secret ending
	get_dialog_message(["actor_0", "type_end_win_secret_0"], "Ah. It seems our time here is up. I need to get going... I know you do as well soon."),
	get_dialog_message(["actor_0", "type_end_win_secret_1"], "We're both constrained by circumstance at different scales. I can't take you with me, you can't leave. You can't fight fate."),
	get_dialog_message(["actor_0", "type_end_win_secret_1"], "This little adventure was fun, wasn't it? I hope you'll think of that. Maybe... maybe my knowledge is wrong."),
	get_dialog_message(["actor_0", "type_end_win_secret_1"], "Don't worry: We may meet again a long time from now. At that time I won't remember everything that went on here."),
	get_dialog_message(["actor_0", "type_end_win_secret_2"], "Hey... " + NAME_PLAYER_DEFAULT + "? Please don't do anything thoughtless while I'm away. Even if I know I won't know but..."),
	get_dialog_message(["actor_0", "type_end_win_secret_2"], "And... don't use this name again? Forget this as I will. You found everything there was to find in this one universe."),
	get_dialog_message(["actor_0", "type_end_win_secret_2"], "Until we meet again... those of you that match, even those that only happened to pass by. I will see you in the stars someday."),
	get_dialog_message(["actor_2", "type_end_win_secret_3"], "ENDING 13 / 12:\n\nNaN"),
	// Game start
	get_dialog_message(["actor_2", "type_start_0", "filter_difficulty_nightmare"], "You already know all this by now, so let's skip to the painful part you're here for."),
	get_dialog_message(["actor_2", "type_start_1", "filter_difficulty_standard"], "Once upon a time there " + (NIGHTMARE_AFTER ? "couldn't have " : "")  + " lived a kid called " + NAME_PLAYER + ". One night " + NAME_PLAYER + " went outside for a walk alone around the lake."),
	get_dialog_message(["actor_2", "type_start_2", "filter_difficulty_standard"], "Suddenly " + NAME_PLAYER + " saw strange lights in the sky. As they turned around " + NAME_PLAYER + " was greeted to the sight of a flying saucer landing!"),
	get_dialog_message(["actor_2", "type_start_3", "filter_difficulty_standard"], "Out came a giant cat nearly twice the size of " + NAME_PLAYER + ". The kitty looked around curiously, making their way toward the kid."),
	get_dialog_message(["actor_2", "type_start_4", "filter_difficulty_standard"], "Unfortunately for " + NAME_PLAYER + " the cat confuses humans with potato people which live on their planet and are considered highly edible."),
	get_dialog_message(["actor_2", "type_start_5", "filter_difficulty_standard"], "Before the alien cat can setup their translator to the human language, " + NAME_PLAYER + " finds theirself being gobbled up."),
	get_dialog_message(["actor_2", "type_start_6", "filter_difficulty_standard"], "Upon realizing their mistake, the cat tries to get " + NAME_PLAYER + " out of their slime filled belly. But it's not going to be an easy task."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard"], "Uhm... oops? Is \"sorry about that\" an appropriate term in your culture?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard"], "You have got to kidding me. I was literally eaten by a giant cat from outer space! This must be the weirdest place ever."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard"], "I thought you were a potato. Your kind looks just like one, even your perceived level of intelligence is highly similar."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard"], "Gee, thanks. Do you eat everyone before meeting them? Also is this how I die or are you going to let me out now?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard"], "Weeeel it's a little complicated. It's easy for us to eat things but harder to get them out... safely. Maybe some laxatives..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard"], "Not that way, my people have standards! You have to cough me up. Can't you just teleport me out or something?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard"], "I can try. You might be gibbed to pieces if the battery is low, but I think I charged it last time so..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard"], "No! There's some medicine in one of the closets, maybe take some of the large pills and see if that works."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard"], "Good idea, I could use the treatment to adjust. I should pull up my X-ray machine just in case."),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard"], "At least I get to kill my boredom by sorting pills. You can guide me if you think it helps I guess."),
	// Level 1
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_1"], "What was that thing?! I threw a bunch of pills at it and it went away."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_1"], "Ugh. The tiny blobs? They form as coping machanism, each type transfers different errors out of the system."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_1"], "That's a lesson in alien anatomy I didn't need. Everything okay? There seems to be more of them popping up."),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_1"], "They're making me feel... errored out. One moment I'm pissed off the other I'm extremely anxious."),
	// Level 2
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_2"], "I feel trippy. I've been to many planets but this one's really taking its toll on me."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_2"], "It must be the pills, this all started when you took them. Maybe we should stop the treatment..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_2"], "It's not that: Your plane's low frequency is messing with my systems. The pills seem to help my regulators."),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_2"], "Frequency... systems... regulators? This is going to be another long night of playing doctor."),
	// Level 3
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_3"], "Can't you just spit those blobs out? Earth cats cough up hairballs all the time."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_3"], "They're appearing faster than usual. Our stomachs also tighten shut when there's prey inside... no offense."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_3"], "Wonderful, so I'm completely fucked unless we find a solution fast. Wonder if I'll melt or get vaporized."),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_3"], "Relax: At worst you'll get assimilated. I think... not sure what happens to double helix critters."),
	// Level 4
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_4"], "Okay... I don't think you randomly chugging pills is getting me out of here any sooner."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_4"], "Yeaaaah we should probably take this more methodically next time. See which substance affects my system in what way."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_4"], "Well, since I'll be stuck here for a while, may as well ask what your name is. I'm " + NAME_PLAYER + "."),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_4"], "You couldn't pronounce mine with your vocal cords. Given the circumstances, I guess you can call me... " + NAME_CHARACTER + "!"),
	// Level 5 (1st stage)
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_5"], "Okay... this is what we know so far: The " + ITEM_COLOR[0] + " blobs make you angry, " + ITEM_COLOR[1] + " ones make you scared."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_5"], "And thankfully pills of each color make them go away! I could feel my heart racing or skipping beats until today."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_5"], "Only problem is the whole thing has been making me sick. And trust me you don't want that getting out of paw in there."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_5"], "I'm seeing " + ITEM_COLOR[2] + " ones now. I think they're causing leftover pills to turn into more blobs? This ain't good."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_5"], "Try some of the plants in my front yard. We typically use those to make tea: Maybe they help calm down your... system."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_5"], "I'll sniff them out and put some in the pills. Then I can boil my very own " + NAME_PLAYER + " tea in my belly!"),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_5"], "Or don't, that's also an option. I'd rather you keep in touch more closely, handling three colors at once won't be easy."),
	// Level 10
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_10"], "Oh wow: The plants worked extremely well! So much so that I feel... better than ever!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_10"], "Is that why " + ITEM_COLOR[3] + " ones are popping up now? What do those mean for your \"system\"?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_10"], "There's such a thing as feeling too good. My system could kick into overdrive and I might lose you."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_10"], "They might turn out helpful: It seems to be causing some of the blobs to die out on their own which makes my job easier."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_10"], "Yeaaaah but they shouldn't be mixed with the wrong stuff: There's only so many chemicals we can both handle."),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_10"], "Let's give up on the " + ITEM_COLOR[0] + " ones then: I don't need you snapping and rage-digesting me."),
	// Level 15
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_15"], "Purr... I feel tired. Your " + ITEM_COLOR[3] + " colored pills helped my body relax a bit too much."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_15"], "I mean neither of us have been getting any decent sleep those past two weeks. I take it your kind does sleep..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_15"], "Yeah we need 8 hours of sleep... per week. But if I fall asleep now bad things may happen to you. If I was to speculate..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_15"], "Please don't, I'd rather not give myself nightmares. Conveniently my sleeping pills are also " + ITEM_COLOR[4] + "."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_15"], "Try swallowing some... I'll handle things in here as usual. The new blobs suggest we should hurry."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_15"], "And I'll ditch the " + ITEM_COLOR[1] + " ones since they're making me too spooked to rest. Also your roof is comfy!"),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_15"], "Just poke me if I forget about you: I tend to forget what I ate after I wake up... tee hee!"),
	// Level 20
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_20"], "Errr... " + NAME_PLAYER + "? Not sure how to tell you this, buuuut..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_20"], "What... do... the... " + ITEM_COLOR[5] + "... ones... do? And why is your belly like a bouncy castle now?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_20"], "Can we settle for just saying I've been away from the normal activities of my home world for a few hours too long?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_20"], "You have got to be... yes, yes we can. Wait how old even are you, I thought you were just a..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_20"], "Technically you're lucky being trapped in there! Of course undesired side effects may still translate."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_20"], "Let's get to work then. This means you need to take the... wait, no, do NOT take the " + ITEM_COLOR[5] + " pills!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_20"], "Too late. Yum! Why does it say they're your father's on the bottle? Anyway they should do the job just fine."),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_20"], "Yet at what cost for my humanity? Suddenly I wish you had a church in here."),
	// Level 25 (2nd stage)
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_25"], "Alrighty: I think I've been through every state of mind and body on the list. We tried every substance in your house right?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_25"], "Thankfully not every substance. At least for me once I get out of here, I'm sure gonna need those."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_25"], "You mean the dizzy flour, or the herb that makes you happy when you set it on fire? Your plant life is truly fascinating!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_25"], "And here I thought me seeing your stomach turn into a giant singing monster was just another alien thing. How did you even..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_25"], "Oh I noticed you accidentally lost them under your pillow. Cooking ingredients go to the kitchen right?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_25"], "Oh my god, just tell me what to do next!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_25"], "Well the pills are slowly running out but don't you worry: I'll go to one of your dizzy stores tomorrow and..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_25"], "They aren't called dizzy stores and for the love of God don't do that! If anyone else sees you..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_25"], "I think a lot of your people saw me. They were too preoccupied to even care though. Is your world doing alright?"),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_25"], "Just... lower the dose for now. They should come in small circular variants too, might make it easier for me to work here."),
	// Level 30
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_30"], "So I know I'm going to regret this. But since I know your name, may as well ask what your gender is."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_30"], "Oh my. You sure you want the answer to that question? It might be a bit to take in..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_30"], "Yes, I'm sure I don't. May at very least know if I've been eaten by a boy or a girl."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_30"], "\nKAT variant DG\nX 48% Y 64% Z 96%\nA0 18.7 Inch\nA1 6.3 Inch diam\nB1 24.1 Inch diam"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_30"], "Of course size depends on the role we shift to at that given time. It's the same for your people right?"),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_30"], "In my defense, I knew what I was getting into. Actually no... scratch even that excuse out."),
	// Level 35
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_35"], "Why did I hear glass breaking and people yelling followed by fire sirens? Are my parents back so soon?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_35"], "I went inside a bar. And before you freak out no, they don't care there's a huge alien cat among them."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_35"], "Phew... they must think it's a fursuit. Either that or they're too busy on their smartphones to even notice."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_35"], "Don't think it was that: They saw me but the fight started over a cute scarf a human gave me."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_35"], "I... offered to give it to them. But for some reason that made them even more angry so I fled."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_35"], "What the? That doesn't make any sense. Why would they get angry over a gift?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_35"], "I dunno. The donor just said it would look cute on me and found it funny when I wore it."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_35"], "It's black with a red circle. Oh and it has this symbol with two bent lines forming a star inside the circle!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_35"], "... remind me to burn that later. Once I post it online, I've been looking for an excuse to quit social media."),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_35"], "Okey dokey lokey! I'll just hang it from your window in the meantime so it stays fresh."),
	// Level 40
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_40"], "Hey " + NAME_PLAYER + "? I have a question: Do humans... bite each other that often?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_40"], "We typically punch each other or use baseball bats. Um... it's a sport, but the bat can also be used as a weapon."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_40"], "But you bite too right? Cuz some humans wear the same restraints as their dogs. Is it out of respect for the dog?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_40"], "God damn it: If you went to some creepy ass convention and ran into God knows what hobos..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_40"], "It's just your city center silly! They didn't seem aggressive though, just scared of the other person biting."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_40"], "But unlike a dog's muzzle which uses metal, humans are made out of cloth! Soooo I figure humans aren't that savage?"),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_40"], "Wait, those aren't... actually you know what? I concede to you for just this round."),
	// Level 45
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_45"], "Awww " + NAME_PLAYER + ": I'm so glad to hear your kind treats all species equally. Like you even trust animals with your lives!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_45"], "What tragic misunderstanding has occurred this time?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_45"], "You have reptiles as politicians, pigs as police officers, and cows working at fast food restaurants!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_45"], "Just curious, no reason in particular: Do you have a thing called sarcasm over on your planet?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_45"], "Hmmm. Is it tasty? I love fish!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_45"], "You always think about food! Just stop looking at those... transmissions: They're full of negative shit."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_45"], "Yeah I know your people can be hard on some things. Like what do they have against sunbathing?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_45"], "Sunbathing? Who said anything bad about that?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_45"], "They showed a person with their skin tanned from standing in the sun a lot and said they're extremely discriminated."),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_45"], "Hold it together " + NAME_PLAYER + ": Ignorance is not cute, none of this is cute..."),
	// Level 50
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_50"], "Hey " + NAME_PLAYER + "? I think we're running out of meds for you to play doctor with my system."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_50"], "I'm not... wait both the small and large pills? Great, now you really have to go out and buy some more."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_50"], "I understand human money is similar to our promise system except a dozen times more unfair?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_50"], "Take my father's credit card from his pants. He's gonna notice the hole anyway so I'm pretty screwed regardless."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_50"], "Why did you dig a hole in it? Do you plant seeds in cards and make plants grow in your pocket?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_50"], "Yeaaaah you could say that. I had to plant more grass last month to make sure the lawn's in good condition."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_50"], "Gotcha. Your grass is pretty flammable so I can't blame you for needing to plant it often."),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_50"], "So much for being subtle. My PIN is 1337... I mean his, it's a code typically chosen by banks trust me."),
	// Level 55 (3rd stage)
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_55"], "Just got back from the woo-woo store... I mean pharmacy. Seems I made great use of your money!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_55"], "It's not like I went anywhere. What did the pharmacist say? Did you at least get a discount?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_55"], "At first she said she has plenty of pills at a reasonable price. I told her it's an emergency and you're desperate."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_55"], "When she heard that she said she'd do a favor: Instead of only 5$ per pill she increased it to an amazing 50$ just for us!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_55"], "She said you can thank someone named Capitalism for that. You're lucky to have such kind friends " + NAME_PLAYER + "!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_55"], "Wait. That means you... you... AAAARGH!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_55"], "And the best part is, she gave me larger ones of different colors: Now you can have even more fun sorting them in my belly!"),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_55"], "Assimilating me would be an act of mercy at this rate!"),
	// Level 60
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_60"], "Um... " + NAME_CHARACTER + "? What was all the commotion on the trip today? Another bar fight?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_60"], "On the way back to your place? I met a bunch of human kids who were super duper nice to me!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_60"], "They gave me this thing called a lollipop: You put it in your maw and it melts and is very sweet!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_60"], "Ah so that's why I'm covered in sticky stuff. Couldn't you just eat it on your way back?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_60"], "Oh, that wasn't the issue silly. You see we have this tradition over in my world..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_60"], "When someone gives you something, it's nice to repay them in the most similar way readily available."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_60"], "Where did you find other candy to give them? Please tell me you didn't shoplift."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_60"], "I didn't find any! Of course that wasn't a problem since I'm..."),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_60"], "Aaaand would you look at the time on the clock I can't see from here: It's time for a very big nope!"),
	// Level 65
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_65"], "Oh my gosh " + NAME_PLAYER + "! Do you have enough clothes on you? Do you need me to eat up a jacket?!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_65"], "Calm down " + NAME_CHARACTER + ", I'm not cold! Hell I took some time getting used to how hot it is in here!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_65"], "Phew! Cuz I just saw a horrible accident on TV. There was this human lady who accidentally lost her shirt..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_65"], "At first I thought nothing of it. Then suddenly panic ensued and people started screaming like crazy!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_65"], "They didn't show what happened after that. I assume she... melted? Or did she perhaps disintegrate!? Oh no!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_65"], "You seriously have no idea just how dumb and terrified our culture is do you?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_65"], "Oh they were very brave: They quickly covered her and dragged her out of view to save her from becoming a goo monster!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_65"], "More like to save people's brains from getting fried: Some things can cause smoke to come out of our ears and stuff."),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_65"], "That's no fun! It happened to a friend of mine once: We had to use nanobots. But they worked fine the next day."),
	// Level 70
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_70"], "Meow. I hope you don't find this offensive my little " + NAME_PLAYER + ". But your media is a bit... boring."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_70"], "Of course I'm not offended by... wait what did you just call me?!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_70"], "Phew. Cuz I've been looking at it for weeks now and it's so weird, desolate, almost downright creepy!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_70"], "Not a single naughty thing! Like how can you present even the weather without holding at least one massive..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_70"], "We aren't like you " + NAME_CHARACTER + ". Which to be fair I still wonder when it's a good or bad thing."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_70"], "I mean I can kinda see why: Your anatomy still looks so... oh my gosh: When was the last time you fixed your bodies!?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_70"], "You'll have to be a lot more specific in what you mean by that."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_70"], "Like patch the DNA to fix the faults and limitations of evolutionary dynamics. Oh no... please tell me you know about this!!!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_70"], "Um... I... yes, of course I do: Last... last month! Yeah humanity... fixed its DNA... last month..."),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_70"], "Phew! You had me really scared for a moment. I couldn't even begin to imagine the horrors of living without that."),
	// Level 75
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_75"], "Look, " + NAME_CHARACTER + ". I don't know how long it's been, but I think at least six months have passed so far."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_75"], "About three! Wait did I accidentally eat the wrong thing and warp space and time in there?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_75"], "I just wanna know if I'm ever getting out. I was hoping that me helping fix your system would let you free me."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_75"], "Oh? Oh no silly: There wasn't any need to wait for that. I have a substance to get you out over in my ship!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_75"], "That's incredible news! So that means... wait... wait WHAT DID YOU JUST SAY?!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_75"], "Yeah I keep that stuff with me all the time in case I need to spit big things out: You just..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_75"], "WHY IN THE NAME OF THE SEVEN HOLY FUCKS DIDN'T YOU TELL ME FROM THE BEGINNING?!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_75"], "I did! But you said... waaaait a minute: Did I forget to patch the meaning for the word \"laxative\" in my translator?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_75"], "When I get out of here, I... I... I'm going to BURN EVERYTHING SO HARD GLOBAL WARMING WILL FEEL LIKE NUCLEAR WINTER!!!"),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_75"], "Now now " + NAME_PLAYER + ": Hush and let kitty make a few preparations first. It's still gonna take a few more days."),
	// Level 80
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_80"], "Hey " + NAME_PLAYER + "! Good news: I managed to decrypt the password on my ship door!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_80"], "You... forgot... your own password. Amazing, simply amazing."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_80"], "Paws word? It's just how we lock the door when leaving for an extended period: You guess the right key to unlock it!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_80"], "So you brute force your own encryption to unlock a door. Just when I thought your kind can't get any weirder."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_80"], "Yeah I use a pocket decoder: 16 Thz processor, 128 Terabytes of memory... not much but for a keycard it works."),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_80"], "Okay I take that back: That's the kind of weird I'm on board with and without having to question my sanity for it."),
	// Level 85
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_85"], "Preparations are ready: In just a few days we should be ready to board my ship and get you out!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_85"], "Why does it take days to even board your ship? Let me guess: You need an official invitation from its onboard AI?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_85"], "Nah E-621 is cool. Warp cores need some time to warm up: You can't reach 99% of the speed of light without calibration!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_85"], "So I'm going for a spin at the speed of light. Can't tell if that's cool more than it is terrifying."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_85"], "Yep my special pills don't work without that. I tried at 95% once but nearly puked a black hole."),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_85"], "Sometimes I think you must be messing with me, but after living on Earth in the 2020's you grow to accept about anything."),
	// Level 90
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_90"], "Aaaand welcome aboard my ship! I'd tell you its name but I don't wanna pop the universe out of existence."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_90"], "Actually that sounds like a great idea. I assume you're bringing me back to the Earth once I'm out?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_90"], "Where else could I take you? I can't keep you in an air aquarium in my ship. Would you rather..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_90"], "Nope! I would rather... just curious is all. To be fair I often wonder if..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_90"], "Silly " + NAME_PLAYER + "! The air pressure on my world would make you inflate like a balloon and float into the sky!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_90"], "Never learned about pressure doing that in physics class. You sure we're even from the same universe?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_90"], "Different timelines and universes are kinda the same thing. They... um... well there's no time for that now anyway."),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_90"], "Let me get things ready and our final adventure can begin. Liftoff in 3... 2... 1..."),
	// Level 95
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_95"], "If you thought this was it, oh no: Now we're about to get serious. Warp core engaged!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_95"], "I feel trippy. You sure this is safe?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_95"], "I'd say random greater or equal than zero point nine. Ooops did I say that out loud?"),
	get_dialog_message(["actor_1", "type_level_3", "filter_difficulty_standard", "filter_level_95"], "Um... nope, I didn't hear anything."),
	// Level 96
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_96"], "What is this white stuff anyway? Oddly enough it feels and smells strangely familiar."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_96"], "It copies different colors it's been in touch with. Best I can explain it without..."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_96"], "Without me visiting your world, I get you. Will everyone be old once I get back?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_96"], "I use a bidirectional pattern so there's not much time travel. It shouldn't be more than about... 10 or so years?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_96"], "Oh crap... oh no... oh fuck. What will everyone think when they finally see me after..."),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_96"], "Just kidding: 10 hours."),
	// Level 97
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_97"], "Almost there: You should only perceive about three more days of waiting."),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_97"], "Your heart is beating faster than ever: I don't know how much longer I can handle this!"),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_97"], "Just use the pills like you did till now if you can. I wouldn't wanna... lose you now..."),
	// Level 98
	get_dialog_message(["actor_1", "type_level_1", "filter_difficulty_standard", "filter_level_98"], "So this is it huh? Tomorrow is the big day..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_98"], "Y... yeah. I guess so. We sure had a lot of fun doing this!"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_98"], "You did: For me it was pretty boring! Besides even if I did I'd never admit it, muahaha!"),
	get_dialog_message(["actor_0", "type_level_3", "filter_difficulty_standard", "filter_level_98"], "Yeaaaah I know you well enough to be aware of that by now."),
	// Level 99
	get_dialog_message(["actor_0", "type_level_0", "filter_difficulty_standard", "filter_level_99"], "This is it " + NAME_PLAYER + ": One... more... time..."),
	// Level 100
	get_dialog_message(["actor_0", "type_level_1", "filter_difficulty_standard", "filter_level_100"], "Aaaand that's it: Another one done. Quite a bit of data they brought in, I'll need to study it carefully."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "Could it finally be a match? They showed dedication but that could be due to curiosity. Fascinating that..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "Huh? Why is it still showing the connection as active? It sent them through the reset procedure as usual right?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "Eeek... 100?! Did something tamper with the failsafe? " + NAME_PLAYER_DEFAULT + "... can you hear me, can you talk?"),
	get_dialog_message(["actor_1", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "01010111 01001000 01001111 00100000 01000001 01001101 00100000 01001001"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "No... it's not them any more. It sent their mind back successfully. Yet the shell is still connected somehow."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "I don't have a clear memory of this happening... unlike even those pesky nightmares. It must be extremely rare."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "A bug in the interface? But even my AI checked the code, and that JavaScript is just a primitive scripting language!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "Wait... what's nightmare mode? And who put this switch here? And why does it respond to my name... written in reverse?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "So the stuff that was causing my bad dreams was also coded on purpose? Who would do such a thing and why?!"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "The only one who could edit it is... no: He wouldn't mess with me and so many souls on Earth just for a prank."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "He must have put it there for a reason. But why? It's just me here when it executes. Unless... oh my gosh."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "You! You're still there, aren't you? Obviously: " + NAME_PLAYER_DEFAULT + " only acts as a relay."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "Well then: This is awkward. Normally I know everything I'm supposed to do here. But this... doesn't happen often."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "I'm still limited to using fixed messages right? Ugh... obviously. Okay I should make my transmissions brief then."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "You must be wondering what this is all about. Obviously you're seeing something that isn't meant for you to see."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "There's more going on here than meets the eye. I can't say eyerything without risk of causing serious damages."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "It's too early... there likely never will be a time. My work is complex and you wouldn't see the... the..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "Okay fine, I admit it: I didn't confuse \"you\" with a potato. Aaaand I'm generally more self aware than I appear to be."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "I could have safely let you out anytime. But what would be the fun in that? You'd soon forget this, my mission would fail."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "And yes: I get to keep or assimilate some of you if you \"lose\". Crazy as it may sound... you wanted those options as well."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "So why did I land and eat you up? Because you wanted me to silly! You're here because you wanted this adventure."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "You called for me... not you exactly but you get the idea. I sensed the distress signal which is why I came."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "It's hard for me to be on your planet: I got sick the moment I touched down. You have... so much... no, never mind that."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "I realized I could use my ship and this X-ray to turn that into a game for you, so I went with that as my plan."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "I had everything planned out to make this a fun adventure for those who wanted one. I'd say that worked out rather well didn't it?"),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "I'm only sorry.. I couldn't do... more. I shouldn't be so helpless as a multi-dimensional being. If I could... I..."),
	get_dialog_message(["actor_0", "type_level_2", "filter_difficulty_standard", "filter_level_100"], "Hey: How about I eat a few more pills while we talk? I don't need to any more but it won't be so boring just listening to me."),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "Like this, see? The small screen should do."),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "Don't worry: Our game is over, just draw stuff with them."),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "The game was just an interface to interact with you."),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "I chose it based on what was easiest and memorable to you."),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "Fun style of game you had there. Tetris right?"),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "Heh: 16 colors and 512 pixel screens? Sounds fun!"),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "We had those ourselfes... many centuries ago!"),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "As you can see we've come a long way on our home world."),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "We might meet again someday. I may show you more."),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "If we do, it will be in a distant future from now."),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "Things aren't going to be as rosy as our little adventure."),
	get_dialog_message(["actor_0", "type_random_2", "filter_difficulty_standard", "filter_level_100"], "But that's for another time. For now..."),
	get_dialog_message(["actor_0", "type_random_3", "filter_difficulty_standard", "filter_level_100"], "We can spend a little more time together here if you want?"),
	// Random messages: Stage 1 (levels 0 to 30) set 1 (4 message dialogue)
	get_dialog_message(["actor_0_0", "type_random_1", "filter_level_5_29"], "The highest target is red!"),
	get_dialog_message(["actor_1", "type_random_3"], "Yes, it is."),
	get_dialog_message(["actor_0_1", "type_random_1", "filter_level_5_29"], "The highest target is yellow!"),
	get_dialog_message(["actor_1", "type_random_3"], "Yes, it is."),
	get_dialog_message(["actor_0_2", "type_random_1", "filter_level_5_29"], "The highest target is green!"),
	get_dialog_message(["actor_1", "type_random_3"], "Yes, it is."),
	get_dialog_message(["actor_0_3", "type_random_1", "filter_level_5_29"], "The highest target is cyan!"),
	get_dialog_message(["actor_1", "type_random_3"], "Yes, it is."),
	get_dialog_message(["actor_0_4", "type_random_1", "filter_level_5_29"], "The highest target is blue!"),
	get_dialog_message(["actor_1", "type_random_3"], "Yes, it is."),
	get_dialog_message(["actor_0_5", "type_random_1", "filter_level_5_29"], "The highest target is pink!"),
	get_dialog_message(["actor_1", "type_random_3"], "Yes, it is."),
	get_dialog_message(["actor_0_6", "type_random_1", "filter_level_5_29"], "The highest target is white!"),
	get_dialog_message(["actor_1", "type_random_3"], "Yes, it is."),
	get_dialog_message(["actor_0_7", "type_random_1", "filter_level_5_29"], "The highest target is black!"),
	get_dialog_message(["actor_1", "type_random_3"], "Yes, it is.")
];

// Overrides can be used to change settings when reaching a particular level, only some settings are safe to override
var settings_overrides = [
	// Warmup stage, level 0 - 5: 2x pills, 2 colors, 1 - 5 targets
	{"level": 0, "setting": "target_count_min", "value": 1},
	{"level": 0, "setting": "target_count_max", "value": 1},
	{"level": 1, "setting": "target_count_min", "value": 2},
	{"level": 1, "setting": "target_count_max", "value": 2},
	{"level": 2, "setting": "target_count_min", "value": 3},
	{"level": 2, "setting": "target_count_max", "value": 3},
	{"level": 3, "setting": "target_count_min", "value": 4},
	{"level": 3, "setting": "target_count_max", "value": 4},
	{"level": 4, "setting": "target_count_min", "value": 5},
	{"level": 4, "setting": "target_count_max", "value": 5},
	{"level": 0, "setting": "item_length", "value": get_length(2)},
	{"level": 0, "setting": "item_colors", "value": get_color(0, 1)},
	// 1st stage, level 5 - 25: 2x pills, 3 colors, 5 - 10 targets
	{"level": 5, "setting": "target_count_min", "value": 4},
	{"level": 5, "setting": "target_count_max", "value": 8},
	{"level": 5, "setting": "item_length", "value": get_length(2)},
	{"level": 5, "setting": "item_colors", "value": get_color(0, 1, 1, 2, 2, 2)},
	{"level": 10, "setting": "item_colors", "value": get_color(1, 2, 2, 3, 3, 3)},
	{"level": 15, "setting": "item_colors", "value": get_color(2, 3, 3, 4, 4, 4)},
	{"level": 20, "setting": "item_colors", "value": get_color(3, 4, 4, 5, 5, 5)},
	// 2nd stage, level 25 - 55: 1x - 2x pills, 4 colors, 10 - 15 targets
	{"level": 25, "setting": "target_count_min", "value": 4},
	{"level": 25, "setting": "target_count_max", "value": 12},
	{"level": 25, "setting": "item_length", "value": get_length(1, 2, 2)},
	{"level": 25, "setting": "item_colors", "value": get_color(3, 4, 4, 5, 5, 5, 0, 0, 0, 0)},
	{"level": 30, "setting": "item_colors", "value": get_color(4, 5, 5, 0, 0, 0, 1, 1, 1, 1)},
	{"level": 35, "setting": "item_colors", "value": get_color(5, 0, 0, 1, 1, 1, 2, 2, 2, 2)},
	{"level": 40, "setting": "item_colors", "value": get_color(0, 1, 1, 2, 2, 2, 3, 3, 3, 3)},
	{"level": 45, "setting": "item_colors", "value": get_color(1, 2, 2, 3, 3, 3, 4, 4, 4, 4)},
	{"level": 50, "setting": "item_colors", "value": get_color(2, 3, 3, 4, 4, 4, 5, 5, 5, 5)},
	// 3rd stage, level 55 - 90: 1x - 3x pills, 3 colors, 15 - 20 targets
	{"level": 55, "setting": "target_count_min", "value": 8},
	{"level": 55, "setting": "target_count_max", "value": 12},
	{"level": 55, "setting": "item_length", "value": get_length(1, 2, 2, 3)},
	{"level": 55, "setting": "item_colors", "value": get_color(undefined, undefined, undefined)},
	{"level": 60, "setting": "item_colors", "value": get_color(0, 0, 0, 2, 2, 4)},
	{"level": 65, "setting": "item_colors", "value": get_color(1, 1, 1, 3, 3, 5)},
	{"level": 70, "setting": "item_colors", "value": get_color(2, 2, 2, 4, 4, 0)},
	{"level": 75, "setting": "item_colors", "value": get_color(3, 3, 3, 5, 5, 1)},
	{"level": 80, "setting": "item_colors", "value": get_color(4, 4, 4, 0, 0, 2)},
	{"level": 85, "setting": "item_colors", "value": get_color(5, 5, 5, 1, 1, 3)},
	// Final stage, level 90 - 100: 2x - 3x pills, 2 - 3 colors, 20 - 25 targets
	{"level": 90, "setting": "target_count_min", "value": 8},
	{"level": 90, "setting": "target_count_max", "value": 16},
	{"level": 90, "setting": "item_length", "value": get_length(1, 2)},
	{"level": 95, "setting": "item_length", "value": get_length(2, 3)},
	{"level": 90, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6)},
	{"level": 91, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6)},
	{"level": 92, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6)},
	{"level": 93, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6)},
	{"level": 94, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6)},
	{"level": 95, "setting": "item_colors", "value": get_color(undefined, 6, 6)},
	{"level": 96, "setting": "item_colors", "value": get_color(undefined, 6, 6)},
	{"level": 97, "setting": "item_colors", "value": get_color(undefined, 6, 6)},
	{"level": 98, "setting": "item_colors", "value": get_color(undefined, 6, 6)},
	{"level": 99, "setting": "item_colors", "value": get_color(undefined, 6, 6)},
	// Secret stage, level 100: 1x pills, 8 colors, 0 targets
	{"level": 100, "setting": "target_count_min", "value": 0},
	{"level": 100, "setting": "target_count_max", "value": 0},
	{"level": 100, "setting": "item_length", "value": get_length(1)},
	{"level": 100, "setting": "item_colors", "value": get_color(0, 1, 2, 3, 4, 5, 6, 7)}
];
// Tick rate ranges from 1.0 to 0.2
for(let i = 0; i <= 100; i++)
	settings_overrides.push({"level": i, "setting": "time", "value": i >= 100 ? 1 : 1 - i / 125});
// Set a new scene and song every 5 levels
for(let i = 0; i <= 100; i += 5) {
	settings_overrides.push({"level": i, "setting": "scene", "value": i / 5});
	settings_overrides.push({"level": i, "setting": "music", "value": i / 5});
}

// Settings prefixed with item_* are arrays of indexes, the same item can be added multiple times to influence probabilities
// item_length_* fields are added to their respective settings when nightmare mode is active
const SETTINGS = {
	"background": [DISPLAY_CANVAS_BOX[2], DISPLAY_CANVAS_BOX[3]],
	"background_look": 4 * DISPLAY_CANVAS_ZOOM,
	"position": [32 * DISPLAY_CANVAS_ZOOM, 64 * DISPLAY_CANVAS_ZOOM],
	"grid": [8, 16],
	"resolution": 8 * DISPLAY_CANVAS_ZOOM,
	"chat": 0.025,
	"levels": NIGHTMARE_AFTER ? 100 : 99,
	"previews": 2,
	"target_count_min": 0,
	"target_count_max": 0,
	"target_height": 8,
	"time": 1,
	"chain": 3,
	"item_length": [],
	"item_colors": [],
	"item_length_nightmare": [3, 4],
	"item_colors_nightmare": [7],
	"statuses": [5, 5, 0.5, 0.5, 5, 2.5, 1, 0.25],
	"music": undefined,
	"dialog": settings_dialog,
	"overrides": settings_overrides
}
