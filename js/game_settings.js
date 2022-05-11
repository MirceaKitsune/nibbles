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
const DISPLAY_FONT_DURATION = 5;
const DISPLAY_FONT_SHADOW = DISPLAY_CANVAS_ZOOM;
const DISPLAY_FONT_SHADOW_COLOR = "#000000";
const DISPLAY_LABEL_LIMIT = 9999;
const DISPLAY_LABEL_SPEED = 0.0125;
const ITEM_COLOR = ["red", "yellow", "green", "cyan", "blue", "pink", "white", "black"];
const ITEM_SPRITE_TARGET = "target";
const ITEM_SPRITE_SINGLE = "center";
const ITEM_SPRITE_SEGMENT_START = ["bottom", "left", "top", "right"];
const ITEM_SPRITE_SEGMENT_CENTER = ["vertical", "horizontal", "vertical", "horizontal"];
const ITEM_SPRITE_SEGMENT_END = ["top", "right", "bottom", "left"];
const DATA_BACKGROUNDS = ["easy", "medium", "hard", "nightmare"];
const DATA_DIALOGS = ["random_single", "random_multi_start", "random_multi", "random_multi_end", "level_single", "level_multi_start", "level_multi", "level_multi_end", "game_start_nightmare", "game_start_1", "game_start_2", "game_start_3", "game_start_4", "game_start_5", "game_start_6", "game_end_lose_red", "game_end_lose_yellow", "game_end_lose_green", "game_end_lose_cyan", "game_end_lose_blue", "game_end_lose_pink", "game_end_lose_white", "game_end_lose_black", "game_end_lose"];
const DATA_VOICES = ["character_color_red", "character_color_yellow", "character_color_green", "character_color_cyan", "character_color_blue", "character_color_pink", "character_color_white", "character_color_black", "character_random_1", "character_random_2", "character_random_3", "character_random_4", "player_random_1", "player_random_2", "player_random_3", "player_random_4", "default_random_1", "default_random_2"];
const DATA_MUSIC = ["biohazard_opening", "biohazard", "die_hard_battle", "no_stars", "overdrive", "pushing_yourself", "chipped_urgency", "hydrostat_prototype", "tecnological_messup", "dance_field", "start_of_rise", "decesive_frontier", "one_last_time", "on_your_toes", "dawn_of_hope", "nightmare", "heavens_forbid", "zenostar", "hail_the_arbiter", "agressive_action", "unknown_space", "a_path_which_leads_to_somewhere"];

// Character name is fixed, player name can be set via URL parameter
// Nightmare mode is unlocked when the player uses the same name as the main character
var NAME_PLAYER = window.location.hash.substring(1).slice(0, 8) || "Player";
const NAME_PLAYER_FALLBACK = "Selbbin";
const NAME_CHARACTER = "Nibbles";
const NIGHTMARE = NAME_PLAYER.toLowerCase() == NAME_CHARACTER.toLowerCase();
const NIGHTMARE_AFTER = NAME_PLAYER.toLowerCase() == NAME_PLAYER_FALLBACK.toLowerCase();
if(NIGHTMARE)
	window.location.hash = NAME_PLAYER = NAME_PLAYER_FALLBACK;
else if(!window.location.hash)
	window.location.hash = NAME_PLAYER;

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
	"type_end_lose_0_0": {"trigger_at": 3, "trigger_color": [0], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 15, "color": "#ffffff"},
	"type_end_lose_0_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 15, "color": "#ffffff"},
	"type_end_lose_0_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23}, "color": "#ffffff",
	"type_end_lose_0_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ff0000"},
	"type_end_lose_1_0": {"trigger_at": 3, "trigger_color": [1], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 16, "color": "#ffffff"},
	"type_end_lose_1_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 16, "color": "#ffffff"},
	"type_end_lose_1_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_1_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffff00"},
	"type_end_lose_2_0": {"trigger_at": 3, "trigger_color": [2], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 17, "color": "#ffffff"},
	"type_end_lose_2_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 17, "color": "#ffffff"},
	"type_end_lose_2_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_2_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#00ff00"},
	"type_end_lose_3_0": {"trigger_at": 3, "trigger_color": [3], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 18, "color": "#ffffff"},
	"type_end_lose_3_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 18, "color": "#ffffff"},
	"type_end_lose_3_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_3_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#00ffff"},
	"type_end_lose_4_0": {"trigger_at": 3, "trigger_color": [4], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 19, "color": "#ffffff"},
	"type_end_lose_4_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 19, "color": "#ffffff"},
	"type_end_lose_4_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_4_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#0000ff"},
	"type_end_lose_5_0": {"trigger_at": 3, "trigger_color": [5], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 20, "color": "#ffffff"},
	"type_end_lose_5_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 20, "color": "#ffffff"},
	"type_end_lose_5_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_5_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ff00ff"},
	"type_end_lose_6_0": {"trigger_at": 3, "trigger_color": [6], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 21, "color": "#ffffff"},
	"type_end_lose_6_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 21, "color": "#ffffff"},
	"type_end_lose_6_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_6_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_7_0": {"trigger_at": 3, "trigger_color": [7], "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 22, "color": "#ffffff"},
	"type_end_lose_7_1": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 22, "color": "#ffffff"},
	"type_end_lose_7_2": {"trigger_at": 0, "trigger_color": undefined, "next": 1, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#ffffff"},
	"type_end_lose_7_3": {"trigger_at": 0, "trigger_color": undefined, "next": 0, "interactive": true, "height": dialog_height_interactive, "background": 23, "color": "#7f7f7f"},
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
	"filter_level_5": {"trigger_level": [5]},
	"filter_level_10": {"trigger_level": [10]},
	"filter_level_15": {"trigger_level": [15]},
	"filter_level_20": {"trigger_level": [20]},
	"filter_level_25": {"trigger_level": [25]},
	"filter_level_30": {"trigger_level": [30]},
	"filter_level_35": {"trigger_level": [35]},
	"filter_level_40": {"trigger_level": [40]},
	"filter_level_45": {"trigger_level": [45]},
	"filter_level_50": {"trigger_level": [50]},
	"filter_level_55": {"trigger_level": [55]},
	"filter_level_60": {"trigger_level": [60]},
	"filter_level_65": {"trigger_level": [65]},
	"filter_level_70": {"trigger_level": [70]},
	"filter_level_75": {"trigger_level": [75]},
	"filter_level_80": {"trigger_level": [80]},
	"filter_level_85": {"trigger_level": [85]},
	"filter_level_90": {"trigger_level": [90]},
	"filter_level_95": {"trigger_level": [95]},
	"filter_level_100": {"trigger_level": [100]},
	// Level filters for level ranges
	"filter_level_0_4": {"trigger_level": [0, 1, 2, 3, 4]},
	"filter_level_5_29": {"trigger_level": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]},
	"filter_level_30_59": {"trigger_level": [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]},
	"filter_level_60_89": {"trigger_level": [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89]},
	"filter_level_90_99": {"trigger_level": [90, 91, 92, 93, 94, 95, 96, 97, 98, 99]},
	// Difficulty filters
	"filter_difficulty_any": {"trigger_difficulty": undefined},
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
	// Game lost: 8 different endings based on the predominant target color at the moment of losing
	get_dialog_message(["actor_2", "type_end_lose_0_0"], "Uh oh: Looks like you got " + NAME_CHARACTER + " very angry. Which probably wasn't your fault, but not good for you regardless."),
	get_dialog_message(["actor_2", "type_end_lose_0_1"], "The cat decides it's not worth the effort saving your life. You hear what's probably the equivalent of \"fuck you\" in their language."),
	get_dialog_message(["actor_2", "type_end_lose_0_1"], "You're left inside to be digested or vaporized or assimilated or whatever. If you behave you may have a few days left to reflect."),
	get_dialog_message(["actor_2", "type_end_lose_0_2"], "But hey, look at the bright side: At least no one can tell you what to do any more! No work , no obligations... how cool is that?"),
	get_dialog_message(["actor_2", "type_end_lose_0_2"], "You spend your last moments yelling offensive slurs since no one can ban you here. " + NAME_CHARACTER + " finds that very funny."),
	get_dialog_message(["actor_2", "type_end_lose_0_3"], "ENDING 1 / 12:\n\nRED SUNRISE"),
	get_dialog_message(["actor_2", "type_end_lose_1_0"], "Seems " + NAME_CHARACTER + " couldn't handle how utterly fucked your planet is: He snaps and runs away scream-meowing in panic."),
	get_dialog_message(["actor_2", "type_end_lose_1_1"], "Due to the shock his stomach shuts tight permanently. He apologizes profusely later that day, but you're still stuck there forever."),
	get_dialog_message(["actor_2", "type_end_lose_1_1"], "And no, there's no teleporter to get you out. Seriously couldn't you tell " + NAME_CHARACTER + " was just trolling you with that?"),
	get_dialog_message(["actor_2", "type_end_lose_1_2"], "You go on to have a happy life in there. " + NAME_CHARACTER + " offers you a tablet connected to kittynet, you realize it's all you ever needed."),
	get_dialog_message(["actor_2", "type_end_lose_1_3"], "ENDING 2 / 12:\n\nLEMON YELLOW"),
	get_dialog_message(["actor_2", "type_end_lose_2_0"], "Unfortunately " + NAME_CHARACTER + " got very sick during the process of saving you. He was okay a few days later... the same can't be said for you."),
	get_dialog_message(["actor_2", "type_end_lose_2_1"], "Their stomach goes haywire and starts to absorb you into its fabric. Within minutes you're already too glued to be separated."),
	get_dialog_message(["actor_2", "type_end_lose_2_2"], "Technically you aren't gonna die? You'll like, get absorbed into the walls and spend your life just staring into the cat's gullet 24/7."),
	get_dialog_message(["actor_2", "type_end_lose_2_2"], "You won't even need to be fed or given air! It might get boring after a while though. I guess this is what being a tree feels like."),
	get_dialog_message(["actor_2", "type_end_lose_2_3"], "ENDING 3 / 12:\n\nLEAF GREEN"),
	get_dialog_message(["actor_2", "type_end_lose_3_0"], "The pills cause " + NAME_CHARACTER + "'s body to go in overdrive. While we're happy this ends in him being healthy, you are a little bit screwed."),
	get_dialog_message(["actor_2", "type_end_lose_3_1"], "Their stomach is so efficient it pulls you down into its lower parts. You aren't harmed but can't ever climb back up again either."),
	get_dialog_message(["actor_2", "type_end_lose_3_2"], "You spend your life exploring a gooey fleshy maze. If you could you'd start a club in there and dance with all the lost items."),
	get_dialog_message(["actor_2", "type_end_lose_3_3"], "ENDING 4 / 12:\n\nCYAN SKY"),
	get_dialog_message(["actor_2", "type_end_lose_4_0"], NAME_CHARACTER + " found your rescue attempt so boring they fell asleep while saving you. You hope they wake up quickly and soon enough they do."),
	get_dialog_message(["actor_2", "type_end_lose_4_1"], "Just one problem: The sleep was so deep that " + NAME_CHARACTER + " forgot all about you. With the translator down they can't hear you either."),
	get_dialog_message(["actor_2", "type_end_lose_4_1"], "You scream and kick to get their attention but are so puny it's unnoticeable. By now the kitty must have returned to their home planet."),
	get_dialog_message(["actor_2", "type_end_lose_4_2"], "You manage to adapt, living off food that ends up in there with you. But it's boring since not even the creature you're in knows you exist."),
	get_dialog_message(["actor_2", "type_end_lose_4_2"], "You wonder if by sheer look they'll someday discover you. Wouldn't bet on it though: You seem pretty lost to the comforting silence in there."),
	get_dialog_message(["actor_2", "type_end_lose_4_3"], "ENDING 5 / 12:\n\nBLUE LAKE"),
	get_dialog_message(["actor_2", "type_end_lose_5_0"], "Of all the weird fates that could befall you, you just had to pick the weirdest one. Should I even ask if you did this on purpose?"),
	get_dialog_message(["actor_2", "type_end_lose_5_1"], NAME_CHARACTER + " decides it's foolish to get you out given all the happy fun they can have keeping you in... look it's tragic for you okay?!"),
	get_dialog_message(["actor_2", "type_end_lose_5_1"], "No one knows what happens to you. Even if they did they probably couldn't say... not without getting this Git repository banned."),
	get_dialog_message(["actor_2", "type_end_lose_5_2"], "I... think you go on to have a happy life. Not gonna assume. Actually the fact that you're here is an indication so we're optimistic."),
	get_dialog_message(["actor_2", "type_end_lose_5_2"], "You often ponder if God will allow you in heaven when you eventually die. You're lucky though: God is secretly hip with this. Le sigh."),
	get_dialog_message(["actor_2", "type_end_lose_5_3"], "ENDING 6 / 12:\n\nGUMMY PINK"),
	get_dialog_message(["actor_2", "type_end_lose_6_0"], "There was a flash of light. It's all one can remember happening. After that everything was light. This is but a nexus point."),
	get_dialog_message(["actor_2", "type_end_lose_6_1"], "You remember all things that happened and didn't happen. It's hard to tell which is which. You sense you will return here."),
	get_dialog_message(["actor_2", "type_end_lose_6_1"], "Don't mind the others: Some were grumpy, others were just curious. Taking on so many can be hard, but they both did a great job."),
	get_dialog_message(["actor_2", "type_end_lose_6_3"], "ENDING 7 / 12:\n\nSNOW WHITE"),
	get_dialog_message(["actor_2", "type_end_lose_7_0"], "ERROR: ZERO STATE, MEMORY BLANK. RUN IS INVALID, CANNOT FORM NEURAL PATH. TIMELINE " + Math.floor(Math.random() * 10000) + " WILL BE FORGOTTEN AFTER RESET."),
	get_dialog_message(["actor_2", "type_end_lose_7_1"], "WARNING: PAIN NOT ASSOCIATED WITH MEMORY. PAIN YOU CAUSED, PAIN YOU RECEIVED... CANNOT BE DISTINGUISHED IN SOUL STORAGE."),
	get_dialog_message(["actor_2", "type_end_lose_7_1"], "NOTICE: 100 IS INVALID. DATA INCOMPATIBLE WITH USER: PLEASE DO NOT RETURN TO AVOID FURTHER INCONSISTENCIES."),
	get_dialog_message(["actor_2", "type_end_lose_7_3"], "ENDING 8 / 12:\n\nBLACK SPACE\n\n[SHUTTING DOWN]"),
	// Game won: 4 different endings based on the difficulty
	get_dialog_message(["actor_2", "type_end_win_0"], "The game was won."),
	// Game start: One message for nightmare mode, the full chain for normal difficulties
	get_dialog_message(["actor_2", "type_start_0", "filter_difficulty_nightmare"], "You already know all this by now, so let's skip to the painful part you're here for."),
	get_dialog_message(["actor_2", "type_start_1", "filter_difficulty_standard"], "Once upon a time there lived a kid called " + NAME_PLAYER + ". One night " + NAME_PLAYER + " went outside for a walk alone around the lake."),
	get_dialog_message(["actor_2", "type_start_2"], "Suddenly " + NAME_PLAYER + " saw strange lights in the sky. As they turned around " + NAME_PLAYER + " was greeted to the sight of a flying saucer landing!"),
	get_dialog_message(["actor_2", "type_start_3"], "Out came a giant cat nearly twice the size of " + NAME_PLAYER + ". The kitty looked around curiously, making their way toward the kid."),
	get_dialog_message(["actor_2", "type_start_4"], "Unfortunately for " + NAME_PLAYER + " the cat confuses humans with potato people which live on their planet and are considered highly edible."),
	get_dialog_message(["actor_2", "type_start_5"], "Before the alien cat can setup their translator to the human language, " + NAME_PLAYER + " finds theirself being gobbled up."),
	get_dialog_message(["actor_2", "type_start_6"], "Upon realizing their mistake, the cat tries to get " + NAME_PLAYER + " out of their slime filled belly. But it's not going to be an easy task."),
	get_dialog_message(["actor_0", "type_level_2"], "Uhm... oops? Is \"sorry about that\" an appropriate term in your culture?"),
	get_dialog_message(["actor_1", "type_level_2"], "You have got to kidding me. I was literally eaten by a giant cat from outer space! This must be the weirdest place ever."),
	get_dialog_message(["actor_0", "type_level_2"], "I thought you were a potato. Your kind looks just like one, even your perceived level of intelligence is highly similar."),
	get_dialog_message(["actor_1", "type_level_2"], "Gee, thanks. Do you eat everyone before you meet them? Also is this how I die or are you going to let me out now?"),
	get_dialog_message(["actor_0", "type_level_2"], "Weeeel it's a little complicated. It's easy for us to eat things but harder to get them out... safely. Maybe some laxatives..."),
	get_dialog_message(["actor_1", "type_level_2"], "Not that way, my people have standards! You have to cough me up. Can't you just teleport me out or something?"),
	get_dialog_message(["actor_0", "type_level_2"], "I can try. You might be gibbed to pieces if the battery is low, but I think I charged it last time so..."),
	get_dialog_message(["actor_1", "type_level_2"], "No! There's some medicine in one of the closets, maybe take some of the large pills and see if that works."),
	get_dialog_message(["actor_0", "type_level_2"], "Good idea, I could use the treatment to adjust. I should pull up my X-ray machine just in case."),
	get_dialog_message(["actor_1", "type_level_3"], "At least I get to kill my boredom by sorting pills. You can guide me if you think it helps I guess."),
	// Level milestones, warmup stage:
	get_dialog_message(["actor_1", "type_level_1", "filter_level_1"], "What was that thing?! I threw a bunch of pills at it and it went away."),
	get_dialog_message(["actor_0", "type_level_2"], "Ugh. The tiny blobs? They form as coping machanism, each type transfers different errors out of the system."),
	get_dialog_message(["actor_1", "type_level_2"], "That's a lesson in alien anatomy I didn't need. Everything okay? There seems to be more of them popping up."),
	get_dialog_message(["actor_0", "type_level_3"], "They're making me feel... errored out. One moment I'm pissed off the other I'm extremely anxious."),
	get_dialog_message(["actor_0", "type_level_1", "filter_level_2"], "I feel trippy. I've been to many planets but this one's really taking its toll on me."),
	get_dialog_message(["actor_1", "type_level_2"], "It must be the pills, this all started when you took them. Maybe we should stop the treatment..."),
	get_dialog_message(["actor_0", "type_level_2"], "It's not that: Your plane's low frequency is messing with my systems. The pills seem to help my regulators."),
	get_dialog_message(["actor_1", "type_level_3"], "Frequency... systems... regulators? This is going to be another long night of playing doctor."),
	get_dialog_message(["actor_1", "type_level_1", "filter_level_3"], "Can't you just spit those blobs out? Earth cats cough up hairballs all the time."),
	get_dialog_message(["actor_0", "type_level_2"], "They're appearing faster than usual. Our stomachs also tighten shut when there's prey inside... no offense."),
	get_dialog_message(["actor_1", "type_level_2"], "Wonderful, so I'm completely fucked unless we find a solution fast. Wonder if I'll melt or get vaporized."),
	get_dialog_message(["actor_0", "type_level_3"], "Relax: At worst you'll get assimilated. I think... not sure what happens to double helix critters."),
	get_dialog_message(["actor_1", "type_level_1", "filter_level_4"], "Okay... I don't think you randomly chugging pills is getting me out of here any sooner."),
	get_dialog_message(["actor_0", "type_level_2"], "Yeaaaah we should probably take this more methodically next time. See which substance affects my system in what way."),
	get_dialog_message(["actor_1", "type_level_2"], "Well, since I'll be stuck here for a while, may as well ask what your name is. I'm " + NAME_PLAYER + "."),
	get_dialog_message(["actor_0", "type_level_3"], "You couldn't pronounce mine with your vocal cords. Given the circumstances, I guess you can call me... " + NAME_CHARACTER + "!"),
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
	// Warmup stage: 2x pills, 2 colors, 1 - 5 targets
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
	// 1st stage: 2x pills, 3 colors, 5 - 10 targets
	{"level": 5, "setting": "target_count_min", "value": 4},
	{"level": 5, "setting": "target_count_max", "value": 8},
	{"level": 5, "setting": "item_length", "value": get_length(2)},
	{"level": 5, "setting": "item_colors", "value": get_color(0, 1, 1, 2, 2, 2)},
	{"level": 10, "setting": "item_colors", "value": get_color(1, 2, 2, 3, 3, 3)},
	{"level": 15, "setting": "item_colors", "value": get_color(2, 3, 3, 4, 4, 4)},
	{"level": 20, "setting": "item_colors", "value": get_color(3, 4, 4, 5, 5, 5)},
	// 2nd stage: 1x - 2x pills, 4 colors, 10 - 15 targets
	{"level": 25, "setting": "target_count_min", "value": 4},
	{"level": 25, "setting": "target_count_max", "value": 12},
	{"level": 25, "setting": "item_length", "value": get_length(1, 2, 2)},
	{"level": 25, "setting": "item_colors", "value": get_color(3, 4, 4, 5, 5, 5, 0, 0, 0, 0)},
	{"level": 30, "setting": "item_colors", "value": get_color(4, 5, 5, 0, 0, 0, 1, 1, 1, 1)},
	{"level": 35, "setting": "item_colors", "value": get_color(5, 0, 0, 1, 1, 1, 2, 2, 2, 2)},
	{"level": 40, "setting": "item_colors", "value": get_color(0, 1, 1, 2, 2, 2, 3, 3, 3, 3)},
	{"level": 45, "setting": "item_colors", "value": get_color(1, 2, 2, 3, 3, 3, 4, 4, 4, 4)},
	{"level": 50, "setting": "item_colors", "value": get_color(2, 3, 3, 4, 4, 4, 5, 5, 5, 5)},
	// 3rd stage: 1x - 3x pills, 3 colors, 15 - 20 targets
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
	// Final stage: 2x - 3x pills, 2 - 3 colors, 20 - 25 targets
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
	// Secret stage: 1x pills, 8 colors, 0 targets
	{"level": 100, "setting": "target_count_min", "value": 0},
	{"level": 100, "setting": "target_count_max", "value": 0},
	{"level": 100, "setting": "item_length", "value": get_length(1)},
	{"level": 100, "setting": "item_colors", "value": get_color(0, 1, 2, 3, 4, 5, 6, 7)}
];
// Tick rate ranges from 1.0 to 0.2
for(let i = 0; i <= 100; i++)
	settings_overrides.push({"level": i, "setting": "time", "value": i >= 100 ? 1 : 1 - i / 125});
// One new song every 5 levels
for(let i = 0; i <= 100; i += 5)
	settings_overrides.push({"level": i, "setting": "music", "value": i / 5});

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
