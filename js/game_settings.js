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
const DISPLAY_FONT_DURATION = 4;
const DISPLAY_FONT_DURATION_CHARACTER = 0.05;
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
const DATA_DIALOGS = ["random_multi_start", "random_multi", "random_multi_end", "random_single", "level_multi_start", "level_multi", "level_multi_end", "level_single", "game_start", "game_start", "game_start", "game_start", "game_end", "game_end", "game_end", "game_end", "game_end", "game_end", "game_end", "game_end"];
const DATA_VOICES = ["character_color_red", "character_color_yellow", "character_color_green", "character_color_cyan", "character_color_blue", "character_color_pink", "character_color_white", "character_color_black", "character_random_1", "character_random_2", "character_random_3", "character_random_4", "player_random_1", "player_random_2", "player_random_3", "player_random_4", "default_random_1", "default_random_2"];
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

// Function and objects for compiling dialog messages, minimizes the number of settings necessary by guessing the purpose of each message based on its background and sound
// While the engine itself allows more features and message combinations, this helps simplify the definitions as the default game configuration follows simple patterns
// Dialog background indexes are categorized based on their trigger: 0 = First message in a chain, 1 to * = Continuation in a chain, 2 = Last message in a chain, 3 = Singular message
// Dialog sound indexes are sorted by character and circumstance: Only character messages can be color specific, generic character messages are white and player messages are black
// The variables below must be carefully kept in sync with DATA_DIALOGS and DATA_VOICES, see the comments on how each setting is interpreted for more information
const dialog_background = { "random": [0, 1, 2, 3], "level": [4, 5, 6, 7], "game_start": [8, 9, 10, 11], "game_end_lose": [12, 13, 14, 15], "game_end_win": [16, 17, 18, 19] };
const dialog_sound = { "character_color": [0, 1, 2, 3, 4, 5, 6, 7], "character": [8, 9, 10, 11], "player": [12, 13, 14, 15], "default": [16, 17] };
function get_dialog_message(trigger_difficulty, trigger_level, background, sound, music, message) {
	// The sound used by the message tells us the character and target color it refers to
	// Sounds 0 to 7 match item colors, 8 to 11 are random character messages, 12 to 15 are random player messages, 16 to 17 are system messages
	const colors = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffffff", "#000000", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#000000", "#000000", "#000000", "#000000", "#ffffff", "#ffffff"];
	const color = colors[sound];
	const trigger_color = sound < 8 ? [sound] : undefined;

	// The trigger of the message is determined based on which category its background is defined in
	// The message is only triggered if its background is either the start of a chain or a singular message, meaning the first or last entry of its category
	// Trigger at: 0 = No trigger, 1 = Random, 2 = Next level, 3 = Game was lost, 4 = Game was won
	var trigger_at = 0;
	if(background == dialog_background.random[0] || background == dialog_background.random[dialog_background.random.length - 1])
		trigger_at = 1;
	if(background == dialog_background.level[0] || background == dialog_background.level[dialog_background.level.length - 1])
		trigger_at = 2;
	if(background == dialog_background.game_start[0] || background == dialog_background.game_start[dialog_background.game_start.length - 1])
		trigger_at = 2;
	if(background == dialog_background.game_end_lose[0] || background == dialog_background.game_end_lose[dialog_background.game_end_lose.length - 1])
		trigger_at = 3;
	if(background == dialog_background.game_end_win[0] || background == dialog_background.game_end_win[dialog_background.game_end_win.length - 1])
		trigger_at = 4;

	// If the chosen background is the start or middle segment of a dialog chain, we know the message after it is meant to be shown next
	var next = 0;
	for(let i in dialog_background)
		if(dialog_background[i].slice(0, dialog_background[i].length - 2).includes(background))
			next = 1;

	// Prefix the name if there's an actor speaking
	var text = message;
	if(sound >= 0 && sound <= 11)
		text = NAME_CHARACTER + ": " + message;
	else if(sound >= 12 && sound <= 15)
		text = NAME_PLAYER + ": " + message;

	// We know this is an interactive message if the background isn't that of the random message
	// Random messages are shown at the bottom (4 lines max) whereas interactive ones appear at the center (8 lines max)
	const interactive = background >= 4;
	const height = interactive ? (DISPLAY_CANVAS_BOX[3] / 2) + (DISPLAY_FONT_SIZE * 4) : DISPLAY_FONT_SIZE * 5;
	return { "trigger_at": trigger_at, "trigger_difficulty": trigger_difficulty, "trigger_level": trigger_level, "trigger_color": trigger_color, "next": next, "height": height, "color": color, "background": background, "sound": sound, "music": music, "interactive": interactive, "text": text };
}

// This contains the chat messages shown when winning / losing or in between levels or idly during the game
var settings_dialog = [
	// Game start
	get_dialog_message(undefined, [0], dialog_background.game_start[3], dialog_sound.default[0], undefined, "A fun new game has begun. Press Enter to continue."),
	// Game lost, 8 different endings based on the predominant target color at the moment of losing
	get_dialog_message(undefined, undefined, dialog_background.game_end_lose[3], dialog_sound.default[1], undefined, "The game was lost."),
	// Game won, 4 different endings based on the difficulty
	get_dialog_message(undefined, undefined, dialog_background.game_end_win[3], dialog_sound.default[2], undefined, "The game was won."),
	// Level milestones, a conversation takes place every 5 levels
	get_dialog_message(undefined, [5], dialog_background.level[3], dialog_sound.default[0], undefined, "You've reached the first level milestone."),
	// Random messages test, will be removed later as all randoms are color related
	get_dialog_message(undefined, undefined, dialog_background.random[0], dialog_sound.character[0], undefined, "Oh hey: We can chat here now! What do you think about that?"),
	get_dialog_message(undefined, undefined, dialog_background.random[1], dialog_sound.player[0], undefined, "Isn't that just great..."),
	get_dialog_message(undefined, undefined, dialog_background.random[1], dialog_sound.character[1], undefined, "Come on now: It's not THAT weird!"),
	get_dialog_message(undefined, undefined, dialog_background.random[2], dialog_sound.player[1], undefined, "You're going to make it that way."),
	get_dialog_message(undefined, undefined, dialog_background.random[0], dialog_sound.player[2], undefined, "I want to have more interesting things to say."),
	get_dialog_message(undefined, undefined, dialog_background.random[2], dialog_sound.character[2], undefined, "Tell the developer to stop sleeping 4 hours every night."),
	// Random messages based on the top active color, a different set is registered for every 25 levels
	get_dialog_message(undefined, undefined, dialog_background.random[3], dialog_sound.character_color[0], undefined, "The highest target is red!"),
	get_dialog_message(undefined, undefined, dialog_background.random[3], dialog_sound.character_color[1], undefined, "The highest target is yellow!"),
	get_dialog_message(undefined, undefined, dialog_background.random[3], dialog_sound.character_color[2], undefined, "The highest target is green!"),
	get_dialog_message(undefined, undefined, dialog_background.random[3], dialog_sound.character_color[3], undefined, "The highest target is cyan!"),
	get_dialog_message(undefined, undefined, dialog_background.random[3], dialog_sound.character_color[4], undefined, "The highest target is blue!"),
	get_dialog_message(undefined, undefined, dialog_background.random[3], dialog_sound.character_color[5], undefined, "The highest target is pink!"),
	get_dialog_message(undefined, undefined, dialog_background.random[3], dialog_sound.character_color[6], undefined, "The highest target is white!"),
	get_dialog_message(undefined, undefined, dialog_background.random[3], dialog_sound.character_color[7], undefined, "The highest target is black!"),
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
