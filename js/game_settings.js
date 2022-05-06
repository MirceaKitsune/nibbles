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
const DISPLAY_FONT_DURATION_CHARACTER = 0.05;
const DISPLAY_LABEL_LIMIT = 9999;
const DISPLAY_LABEL_SPEED = 0.0125;
const ITEM_COLOR = ["red", "yellow", "green", "cyan", "blue", "pink", "white", "black"];
const ITEM_SPRITE_TARGET = "target";
const ITEM_SPRITE_SINGLE = "center";
const ITEM_SPRITE_SEGMENT_START = ["bottom", "left", "top", "right"];
const ITEM_SPRITE_SEGMENT_CENTER = ["vertical", "horizontal", "vertical", "horizontal"];
const ITEM_SPRITE_SEGMENT_END = ["top", "right", "bottom", "left"];
const DATA_BACKGROUNDS = ["easy", "medium", "hard", "nightmare"];
const DATA_DIALOGS = ["random", "interactive"];
const DATA_VOICES = ["default_1", "default_2", "default_3", "default_4", "character_1", "character_2", "character_3", "character_4", "character_nightmare_1", "character_nightmare_2", "character_nightmare_3", "character_nightmare_4", "player_1", "player_2", "player_3", "player_4"];
const DATA_MUSIC = ["biohazard_opening", "biohazard", "die_hard_battle", "no_stars", "overdrive", "pushing_yourself", "chipped_urgency", "hydrostat_prototype", "tecnological_messup", "dance_field", "start_of_rise", "decesive_frontier", "one_last_time", "on_your_toes", "dawn_of_hope", "nightmare", "heavens_forbid", "zenostar", "hail_the_arbiter", "hail_the_arbiter_metal", "the_one_who_stands_distant"];

// Character name is fixed, player name can be set via URL parameter
// Nightmare mode is unlocked when the player uses the same name as the main character
const NAME_CHARACTER = "Nibbles";
const NAME_PLAYER_FALLBACK = "Selbbin";
const NAME_PLAYER = window.location.hash.substring(1).slice(0, 8) || "Player";
const NIGHTMARE = NAME_PLAYER.toLowerCase() == NAME_CHARACTER.toLowerCase();
const NIGHTMARE_AFTER = NAME_PLAYER.toLowerCase() == NAME_PLAYER_FALLBACK.toLowerCase();
if(NIGHTMARE)
	window.location.hash = NAME_PLAYER_FALLBACK;
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

// Function for compiling dialog triggers
function get_dialog_trigger(difficulty, level, color, act) {
	return { "difficulty": difficulty, "level": level, "color": color, "act": act };
}

// Function for compiling dialog messages
function get_dialog_message(color, height, background, sound, music, interactive, name, message) {
	const text = name ? name + ": " + message : message;
	return { "color": color, "height": height, "background": background, "sound": sound, "music": music, "interactive": interactive, "text": text };
}

// This contains the chat messages used in between levels or shown idly during the game
const voice_default = [DATA_VOICES[0], DATA_VOICES[1], DATA_VOICES[2], DATA_VOICES[3]];
const voice_character = NIGHTMARE ? [DATA_VOICES[8], DATA_VOICES[9], DATA_VOICES[10], DATA_VOICES[11]] : [DATA_VOICES[4], DATA_VOICES[5], DATA_VOICES[6], DATA_VOICES[7]];
const voice_player = [DATA_VOICES[12], DATA_VOICES[13], DATA_VOICES[14], DATA_VOICES[15]];
const height_random = DISPLAY_FONT_SIZE * 5;
const height_interactive = (DISPLAY_CANVAS_BOX[3] / 2) + (DISPLAY_FONT_SIZE * 4);
var settings_dialog = [
	{ "triggers": get_dialog_trigger(undefined, undefined, undefined, 2), "messages": [
		get_dialog_message("#ffffff", height_interactive, 1, undefined, undefined, true, undefined, "The game was lost.")
	] },
	{ "triggers": get_dialog_trigger(undefined, undefined, undefined, 3), "messages": [
		get_dialog_message("#ffffff", height_interactive, 1, undefined, undefined, true, undefined, "The game was won.")
	] },
	{ "triggers": get_dialog_trigger(undefined, [0], undefined, 1), "messages": [
		get_dialog_message("#ffffff", height_interactive, 1, voice_default, undefined, true, undefined, "A fun new game has begun. Press Enter to continue.")
	] },
	{ "triggers": get_dialog_trigger(undefined, [5], undefined, 1), "messages": [
		get_dialog_message("#ffffff", height_interactive, 1, voice_default, undefined, true, undefined, "This concludes the trial for text. Aren't you excited for what will unfold here at some point? Come back next Git commit!")
	] },
	{ "triggers": get_dialog_trigger(undefined, [0, 1, 2, 3, 4, 5], undefined, 0), "messages": [
		get_dialog_message("#ffffff", height_random, 0, voice_character, undefined, false, NAME_CHARACTER, "Oh hey: We can chat here now! What do you think about that?"),
		get_dialog_message("#000000", height_random, 0, voice_player, undefined, false, NAME_PLAYER, "Isn't that just great...")
	] },
	{ "triggers": get_dialog_trigger(undefined, [0, 1, 2, 3, 4, 5], undefined, 0), "messages": [
		get_dialog_message("#000000", height_random, 0, voice_player, undefined, false, NAME_PLAYER, "I want to have more interesting things to say."),
		get_dialog_message("#ffffff", height_random, 0, voice_character, undefined, false, NAME_CHARACTER, "Tell the developer to stop sleeping 4 hours every night.")
	] }
];

// Overrides can be used to change settings when reaching a particular level, only some settings are safe to override
var settings_overrides = [
	// Warmup stage: 2x pills, 2 colors
	{ "level": 0, "setting": "item_length", "value": get_length(2) },
	{ "level": 0, "setting": "item_colors", "value": get_color(undefined, undefined) },
	// 1st stage: 2x pills, 3 colors
	{ "level": 5, "setting": "item_length", "value": get_length(2) },
	{ "level": 5, "setting": "item_colors", "value": get_color(0, 0, 0, 1, 1, 2) },
	{ "level": 10, "setting": "item_colors", "value": get_color(1, 1, 1, 2, 2, 3) },
	{ "level": 15, "setting": "item_colors", "value": get_color(2, 2, 2, 3, 3, 4) },
	{ "level": 20, "setting": "item_colors", "value": get_color(3, 3, 3, 4, 4, 5) },
	// 2nd stage: 1x - 2x pills, 4 colors
	{ "level": 25, "setting": "item_length", "value": get_length(1, 2, 2) },
	{ "level": 25, "setting": "item_colors", "value": get_color(3, 4, 4, 5, 5, 5, 0, 0, 0, 0) },
	{ "level": 30, "setting": "item_colors", "value": get_color(4, 5, 5, 0, 0, 0, 1, 1, 1, 1) },
	{ "level": 35, "setting": "item_colors", "value": get_color(5, 0, 0, 1, 1, 1, 2, 2, 2, 2) },
	{ "level": 40, "setting": "item_colors", "value": get_color(0, 1, 1, 2, 2, 2, 3, 3, 3, 3) },
	{ "level": 45, "setting": "item_colors", "value": get_color(1, 2, 2, 3, 3, 3, 4, 4, 4, 4) },
	{ "level": 50, "setting": "item_colors", "value": get_color(2, 3, 3, 4, 4, 4, 5, 5, 5, 5) },
	// 3rd stage: 1x - 3x pills, 3 colors
	{ "level": 55, "setting": "item_length", "value": get_length(1, 2, 2, 3) },
	{ "level": 55, "setting": "item_colors", "value": get_color(undefined, undefined, undefined) },
	{ "level": 60, "setting": "item_colors", "value": get_color(0, 0, 0, 2, 2, 4) },
	{ "level": 65, "setting": "item_colors", "value": get_color(1, 1, 1, 3, 3, 5) },
	{ "level": 70, "setting": "item_colors", "value": get_color(2, 2, 2, 4, 4, 0) },
	{ "level": 75, "setting": "item_colors", "value": get_color(3, 3, 3, 5, 5, 1) },
	{ "level": 80, "setting": "item_colors", "value": get_color(4, 4, 4, 0, 0, 2) },
	{ "level": 85, "setting": "item_colors", "value": get_color(5, 5, 5, 1, 1, 3) },
	// Final stage: 2x - 3x pills, 2 - 3 colors
	{ "level": 90, "setting": "item_length", "value": get_length(1, 2) },
	{ "level": 95, "setting": "item_length", "value": get_length(2, 3) },
	{ "level": 90, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6) },
	{ "level": 91, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6) },
	{ "level": 92, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6) },
	{ "level": 93, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6) },
	{ "level": 94, "setting": "item_colors", "value": get_color(undefined, undefined, 6, 6) },
	{ "level": 95, "setting": "item_colors", "value": get_color(undefined, 6, 6) },
	{ "level": 96, "setting": "item_colors", "value": get_color(undefined, 6, 6) },
	{ "level": 97, "setting": "item_colors", "value": get_color(undefined, 6, 6) },
	{ "level": 98, "setting": "item_colors", "value": get_color(undefined, 6, 6) },
	{ "level": 99, "setting": "item_colors", "value": get_color(undefined, 6, 6) },
	// Secret stage: 1x pills, 8 colors
	{ "level": 100, "setting": "item_length", "value": get_length(1) },
	{ "level": 100, "setting": "item_colors", "value": get_color(0, 1, 2, 3, 4, 5, 6, 7) }
];
for(let i = 0; i <= 100; i++) {
	// Tick rate ranges from 1.0 to 0.2 for 100 levels
	// Target chance ranges from 0.5 to 0.25: For the best difficulty curve it peaks at level 50 then decreases again
	settings_overrides.push({ "level": i, "setting": "time", "value": i >= 100 ? 1 : 1 - i / 125 });
	settings_overrides.push({ "level": i, "setting": "target_chance", "value": i >= 100 ? 0 : 0.25 + (Math.abs(50 - i) / 50) * 0.25 });
}
for(let i = 0; i <= 100; i += 5)
	// One new song every 5 levels
	settings_overrides.push({ "level": i, "setting": "music", "value": i / 5 });

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
	"target_chance": 0.25,
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
