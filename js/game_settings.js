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
const DATA_DIALOGS = ["random_single", "random_multi_start", "random_multi", "random_multi_end", "level_single", "level_multi_start", "level_multi", "level_multi_end", "game_start_nightmare", "game_start_1", "game_start_2", "game_start_3", "game_start_4", "game_start_5", "game_start_6", "game_end"];
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
// Each set is typically numbered as: 0 = Singular message (triggered, ends), 1 = First message in a chain (triggered, continues), 2 to * = Middle message in a chain (not triggered, continues), 3 = Last message in a chain (not triggered, ends)
const dialog_presets_height_interactive = (DISPLAY_CANVAS_BOX[3] / 2) + (DISPLAY_FONT_SIZE * 4);
const dialog_presets_height_random = DISPLAY_FONT_SIZE * 5;
const dialog_presets = {
	// Random character messages when the highest target color is red
	"random_character_color_red_0": { "trigger_color": [0], "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 0, "color": "#ff0000", "name": NAME_CHARACTER },
	"random_character_color_red_1": { "trigger_color": [0], "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 0, "color": "#ff0000", "name": NAME_CHARACTER },
	"random_character_color_red_2": { "trigger_color": [0], "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 0, "color": "#ff0000", "name": NAME_CHARACTER },
	"random_character_color_red_3": { "trigger_color": [0], "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 0, "color": "#ff0000", "name": NAME_CHARACTER },
	// Random character messages when the highest target color is yellow
	"random_character_color_yellow_0": { "trigger_color": [1], "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 1, "color": "#ffff00", "name": NAME_CHARACTER },
	"random_character_color_yellow_1": { "trigger_color": [1], "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 1, "color": "#ffff00", "name": NAME_CHARACTER },
	"random_character_color_yellow_2": { "trigger_color": [1], "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 1, "color": "#ffff00", "name": NAME_CHARACTER },
	"random_character_color_yellow_3": { "trigger_color": [1], "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 1, "color": "#ffff00", "name": NAME_CHARACTER },
	// Random character messages when the highest target color is green
	"random_character_color_green_0": { "trigger_color": [2], "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 2, "color": "#00ff00", "name": NAME_CHARACTER },
	"random_character_color_green_1": { "trigger_color": [2], "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 2, "color": "#00ff00", "name": NAME_CHARACTER },
	"random_character_color_green_2": { "trigger_color": [2], "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 2, "color": "#00ff00", "name": NAME_CHARACTER },
	"random_character_color_green_3": { "trigger_color": [2], "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 2, "color": "#00ff00", "name": NAME_CHARACTER },
	// Random character messages when the highest target color is cyan
	"random_character_color_cyan_0": { "trigger_color": [3], "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 3, "color": "#00ffff", "name": NAME_CHARACTER },
	"random_character_color_cyan_1": { "trigger_color": [3], "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 3, "color": "#00ffff", "name": NAME_CHARACTER },
	"random_character_color_cyan_2": { "trigger_color": [3], "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 3, "color": "#00ffff", "name": NAME_CHARACTER },
	"random_character_color_cyan_3": { "trigger_color": [3], "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 3, "color": "#00ffff", "name": NAME_CHARACTER },
	// Random character messages when the highest target color is blue
	"random_character_color_blue_0": { "trigger_color": [4], "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 4, "color": "#0000ff", "name": NAME_CHARACTER },
	"random_character_color_blue_1": { "trigger_color": [4], "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 4, "color": "#0000ff", "name": NAME_CHARACTER },
	"random_character_color_blue_2": { "trigger_color": [4], "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 4, "color": "#0000ff", "name": NAME_CHARACTER },
	"random_character_color_blue_3": { "trigger_color": [4], "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 4, "color": "#0000ff", "name": NAME_CHARACTER },
	// Random character messages when the highest target color is pink
	"random_character_color_pink_0": { "trigger_color": [5], "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 5, "color": "#ff00ff", "name": NAME_CHARACTER },
	"random_character_color_pink_1": { "trigger_color": [5], "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 5, "color": "#ff00ff", "name": NAME_CHARACTER },
	"random_character_color_pink_2": { "trigger_color": [5], "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 5, "color": "#ff00ff", "name": NAME_CHARACTER },
	"random_character_color_pink_3": { "trigger_color": [5], "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 5, "color": "#ff00ff", "name": NAME_CHARACTER },
	// Random character messages when the highest target color is white
	"random_character_color_white_0": { "trigger_color": [6], "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 6, "color": "#ffffff", "name": NAME_CHARACTER },
	"random_character_color_white_1": { "trigger_color": [6], "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 6, "color": "#ffffff", "name": NAME_CHARACTER },
	"random_character_color_white_2": { "trigger_color": [6], "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 6, "color": "#ffffff", "name": NAME_CHARACTER },
	"random_character_color_white_3": { "trigger_color": [6], "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 6, "color": "#ffffff", "name": NAME_CHARACTER },
	// Random character messages when the highest target color is black
	"random_character_color_black_0": { "trigger_color": [7], "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 7, "color": "#000000", "name": NAME_CHARACTER },
	"random_character_color_black_1": { "trigger_color": [7], "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 7, "color": "#000000", "name": NAME_CHARACTER },
	"random_character_color_black_2": { "trigger_color": [7], "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 7, "color": "#000000", "name": NAME_CHARACTER },
	"random_character_color_black_3": { "trigger_color": [7], "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 7, "color": "#000000", "name": NAME_CHARACTER },
	// Random character messages
	"random_character_0": { "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 8, "color": "#ffffff", "name": NAME_CHARACTER },
	"random_character_1": { "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 9, "color": "#ffffff", "name": NAME_CHARACTER },
	"random_character_2": { "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 10, "color": "#ffffff", "name": NAME_CHARACTER },
	"random_character_3": { "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 11, "color": "#ffffff", "name": NAME_CHARACTER },
	// Random player messages
	"random_player_0": { "trigger_at": 1, "next": 0, "height": dialog_presets_height_random, "background": 0, "sound": 12, "color": "#000000", "name": NAME_PLAYER },
	"random_player_1": { "trigger_at": 1, "next": 1, "height": dialog_presets_height_random, "background": 1, "sound": 13, "color": "#000000", "name": NAME_PLAYER },
	"random_player_2": { "trigger_at": 0, "next": 1, "height": dialog_presets_height_random, "background": 2, "sound": 14, "color": "#000000", "name": NAME_PLAYER },
	"random_player_3": { "trigger_at": 0, "next": 0, "height": dialog_presets_height_random, "background": 3, "sound": 15, "color": "#000000", "name": NAME_PLAYER },
	// Level messages, character speaking
	"level_character_0": { "interactive": true, "trigger_at": 2, "next": 0, "height": dialog_presets_height_interactive, "background": 4, "sound": 8, "color": "#ffffff", "name": NAME_CHARACTER },
	"level_character_1": { "interactive": true, "trigger_at": 2, "next": 1, "height": dialog_presets_height_interactive, "background": 5, "sound": 9, "color": "#ffffff", "name": NAME_CHARACTER },
	"level_character_2": { "interactive": true, "trigger_at": 0, "next": 1, "height": dialog_presets_height_interactive, "background": 6, "sound": 10, "color": "#ffffff", "name": NAME_CHARACTER },
	"level_character_3": { "interactive": true, "trigger_at": 0, "next": 0, "height": dialog_presets_height_interactive, "background": 7, "sound": 11, "color": "#ffffff", "name": NAME_CHARACTER },
	// Level messages, player speaking
	"level_player_0": { "interactive": true, "trigger_at": 2, "next": 0, "height": dialog_presets_height_interactive, "background": 4, "sound": 12, "color": "#000000", "name": NAME_PLAYER },
	"level_player_1": { "interactive": true, "trigger_at": 2, "next": 1, "height": dialog_presets_height_interactive, "background": 5, "sound": 13, "color": "#000000", "name": NAME_PLAYER },
	"level_player_2": { "interactive": true, "trigger_at": 0, "next": 1, "height": dialog_presets_height_interactive, "background": 6, "sound": 14, "color": "#000000", "name": NAME_PLAYER },
	"level_player_3": { "interactive": true, "trigger_at": 0, "next": 0, "height": dialog_presets_height_interactive, "background": 7, "sound": 15, "color": "#000000", "name": NAME_PLAYER },
	// Game intro
	"game_start_0": { "interactive": true, "trigger_at": 2, "trigger_level": [0], "next": 0, "height": dialog_presets_height_interactive, "background": 8, "sound": 16, "music": 21 },
	"game_start_1": { "interactive": true, "trigger_at": 2, "trigger_level": [0], "next": 1, "height": dialog_presets_height_interactive, "background": 9, "sound": 16, "music": 21 },
	"game_start_2": { "interactive": true, "trigger_at": 0, "trigger_level": [0], "next": 1, "height": dialog_presets_height_interactive, "background": 10, "sound": 16 },
	"game_start_3": { "interactive": true, "trigger_at": 0, "trigger_level": [0], "next": 1, "height": dialog_presets_height_interactive, "background": 11, "sound": 16 },
	"game_start_4": { "interactive": true, "trigger_at": 0, "trigger_level": [0], "next": 1, "height": dialog_presets_height_interactive, "background": 12, "sound": 16 },
	"game_start_5": { "interactive": true, "trigger_at": 0, "trigger_level": [0], "next": 1, "height": dialog_presets_height_interactive, "background": 13, "sound": 16 },
	"game_start_6": { "interactive": true, "trigger_at": 0, "trigger_level": [0], "next": 1, "height": dialog_presets_height_interactive, "background": 14, "sound": 16 },
	// Game outro
	"game_end_lose_0": { "interactive": true, "trigger_at": 3, "next": 0, "height": dialog_presets_height_random, "background": 15, "sound": 17 },
	"game_end_win_0": { "interactive": true, "trigger_at": 4, "next": 0, "height": dialog_presets_height_random, "background": 15, "sound": 17 }
};

// Function for compiling dialog messages, uses presets to minimize the number of overrides necessary to specify per message
// Overrides are specified as an object with the same structure to apply more specific settings on top of the preset
function get_dialog_message(preset, overrides, text) {
	var settings = { "trigger_at": undefined, "trigger_difficulty": undefined, "trigger_level": undefined, "trigger_color": undefined, "next": 0, "height": 0, "color": "#ffffff", "background": 0, "sound": 0, "music": undefined, "interactive": false, "name": undefined, "text": "" };
	if(preset)
		for(let i in dialog_presets[preset])
			settings[i] = dialog_presets[preset][i];
	if(overrides)
		for(let i in overrides)
			settings[i] = overrides[i];
	settings.text = text;
	return settings;
}

// This contains the chat messages shown when winning / losing or in between levels or idly during the game
// Random messages are based on the top active color, a different set is registered every 30 levels plus the final 10 levels, as the game gets harder each set get shorter as to remain easy to read
const random_levels_1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
const random_levels_2 = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59];
const random_levels_3 = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89];
const random_levels_4 = [90, 91, 92, 93, 94, 95, 96, 97, 98, 99];
const settings_dialog = [
	// Game start: One message for nightmare mode, the full chain for normal difficulties
	get_dialog_message("game_start_0", { "trigger_difficulty": [3] }, "You already know all this by now, so let's skip to the painful part you're here for."),
	get_dialog_message("game_start_1", { "trigger_difficulty": [0, 1, 2] }, "Once upon a time there lived a kid called " + NAME_PLAYER + ". One night " + NAME_PLAYER + " went outside for a walk alone around the lake."),
	get_dialog_message("game_start_2", undefined, "Suddenly " + NAME_PLAYER + " saw strange lights in the sky. As they turned around " + NAME_PLAYER + " was greeted to the sight of a flying saucer landing!"),
	get_dialog_message("game_start_3", undefined, "Out came a giant cat nearly twice the size of " + NAME_PLAYER + ". The kitty looked around curiously, making their way toward the kid."),
	get_dialog_message("game_start_4", undefined, "Unfortunately for " + NAME_PLAYER + " the cat confuses humans with potato people which live on their planet and are considered highly edible."),
	get_dialog_message("game_start_5", undefined, "Before the alien cat can setup their translator to the human language, " + NAME_PLAYER + " finds theirself being gobbled up."),
	get_dialog_message("game_start_6", undefined, "Upon realizing their mistake, the cat tries to get " + NAME_PLAYER + " out of their slime filled belly. But it's not going to be an easy task."),
	get_dialog_message("level_character_2", undefined, "Uhm... oops? Is \"sorry about that\" an appropriate term in your culture?"),
	get_dialog_message("level_player_2", undefined, "You have got to kidding me. I was literally eaten by a giant cat from outer space! This must be the weirdest place ever."),
	get_dialog_message("level_character_2", undefined, "I thought you were a potato. Your kind looks just like one, even your perceived level of intelligence is highly similar."),
	get_dialog_message("level_player_2", undefined, "Gee, thanks. Do you eat everyone before you meet them? Also is this how I die or are you going to let me out now?"),
	get_dialog_message("level_character_2", undefined, "Weeeel it's a little complicated. It's easy for us to eat things but harder to get them out... safely. Maybe some laxatives..."),
	get_dialog_message("level_player_2", undefined, "Not that way, my people have standards! You have to cough me up. Can't you just teleport me out or something?"),
	get_dialog_message("level_character_2", undefined, "I can try. You might be gibbed to pieces if the battery is low, but I think I charged it last time so..."),
	get_dialog_message("level_player_2", undefined, "No! There's some medicine in one of the closets, try taking a few pills and see if that works."),
	get_dialog_message("level_character_2", undefined, "Okie, but my belly might be sensitive to certain chemicals! I should pull up my X-ray machine just in case."),
	get_dialog_message("level_player_2", undefined, "Well my body might be sensitive to your stomach juices! I'll sort them carefully, you can guide me I guess."),
	get_dialog_message("level_character_2", undefined, "Just don't be surprised if I act weird: Chemicals tend to affect our mood and I already ate some weird stuff before landing."),
	get_dialog_message("level_player_3", undefined, "With you I can imagine. This is going to be a long night."),
	// Game lost: 8 different endings based on the predominant target color at the moment of losing
	get_dialog_message("game_end_lose_0", undefined, "The game was lost."),
	// Game won: 4 different endings based on the difficulty
	get_dialog_message("game_end_win_0", undefined, "The game was won."),
	// Level milestones: a conversation takes place every 5 levels
	get_dialog_message("level_character_0", { "trigger_level": [5] }, "You've reached the first level milestone."),
	// Random messages based on active color: levels 0 to 30, set 1 (4 message dialogue)
	get_dialog_message("random_character_color_red_1", { "trigger_level": random_levels_1 }, "The highest target is red!"),
	get_dialog_message("random_player_3", { "trigger_level": random_levels_1 }, "Yes, it is."),
	get_dialog_message("random_character_color_yellow_1", { "trigger_level": random_levels_1 }, "The highest target is yellow!"),
	get_dialog_message("random_player_3", { "trigger_level": random_levels_1 }, "Yes, it is."),
	get_dialog_message("random_character_color_green_1", { "trigger_level": random_levels_1 }, "The highest target is green!"),
	get_dialog_message("random_player_3", { "trigger_level": random_levels_1 }, "Yes, it is."),
	get_dialog_message("random_character_color_cyan_1", { "trigger_level": random_levels_1 }, "The highest target is cyan!"),
	get_dialog_message("random_player_3", { "trigger_level": random_levels_1 }, "Yes, it is."),
	get_dialog_message("random_character_color_blue_1", { "trigger_level": random_levels_1 }, "The highest target is blue!"),
	get_dialog_message("random_player_3", { "trigger_level": random_levels_1 }, "Yes, it is."),
	get_dialog_message("random_character_color_pink_1", { "trigger_level": random_levels_1 }, "The highest target is pink!"),
	get_dialog_message("random_player_3", { "trigger_level": random_levels_1 }, "Yes, it is."),
	get_dialog_message("random_character_color_white_1", { "trigger_level": random_levels_1 }, "The highest target is white!"),
	get_dialog_message("random_player_3", { "trigger_level": random_levels_1 }, "Yes, it is."),
	get_dialog_message("random_character_color_black_1", { "trigger_level": random_levels_1 }, "The highest target is black!"),
	get_dialog_message("random_player_3", { "trigger_level": random_levels_1 }, "Yes, it is.")
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
