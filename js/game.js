// ITEM_COLOR must contain color names matching their respective image and sound file names, should be 8 in total to match statuses
// ITEM_SPRITE_SEGMENT_* is based on item angle: 0 = up, 1 = right, 2 = down, 3 = left
const DISPLAY_CANVAS_ZOOM = 3;
const DISPLAY_CANVAS_BOX = [512, 0, 128 * DISPLAY_CANVAS_ZOOM, 256 * DISPLAY_CANVAS_ZOOM];
const DISPLAY_GAME_PADDING = 2;
const DISPLAY_LABEL_LIMIT = 9999;
const ITEM_COLOR = ["red", "yellow", "green", "cyan", "blue", "pink", "white", "black"];
const ITEM_SPRITE_TARGET = "target";
const ITEM_SPRITE_SINGLE = "center";
const ITEM_SPRITE_SEGMENT_START = ["bottom", "left", "top", "right"];
const ITEM_SPRITE_SEGMENT_CENTER = ["vertical", "horizontal", "vertical", "horizontal"];
const ITEM_SPRITE_SEGMENT_END = ["top", "right", "bottom", "left"];

// Returns a random entry from an array
function random_array(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

// Sets the position of an element to the given box
function css_box(element, box) {
	element.style["left"] = box[0] + "px";
	element.style["top"] = box[1] + "px";
	element.style["width"] = box[2] + "px";
	element.style["height"] = box[3] + "px";
}

// Overrides can be used to change settings when reaching a particular level, only some settings are safe to override
var settings_overrides = [
	// Warmup cycle: 2x pills, 2 colors max
	{ "level": 0, "setting": "item_length", "value": [2] },
	{ "level": 0, "setting": "item_colors", "value": [0, 1] },
	// 1st cycle: 2x pills, 3 colors max
	{ "level": 5, "setting": "item_length", "value": [2] },
	{ "level": 5, "setting": "item_colors", "value": [0, 0, 0, 1, 1, 2] },
	{ "level": 10, "setting": "item_colors", "value": [1, 1, 1, 2, 2, 3] },
	{ "level": 15, "setting": "item_colors", "value": [2, 2, 2, 3, 3, 4] },
	{ "level": 20, "setting": "item_colors", "value": [3, 3, 3, 4, 4, 5] },
	// 2nd cycle: 1x - 2x pills, 4 colors max
	{ "level": 25, "setting": "item_length", "value": [1, 2, 2] },
	{ "level": 30, "setting": "item_colors", "value": [4, 4, 4, 4, 5, 5, 5, 0, 0, 1] },
	{ "level": 35, "setting": "item_colors", "value": [5, 5, 5, 5, 0, 0, 0, 1, 1, 2] },
	{ "level": 40, "setting": "item_colors", "value": [0, 0, 0, 0, 1, 1, 1, 2, 2, 3] },
	{ "level": 45, "setting": "item_colors", "value": [1, 1, 1, 1, 2, 2, 2, 3, 3, 4] },
	{ "level": 50, "setting": "item_colors", "value": [2, 2, 2, 2, 3, 3, 3, 4, 4, 5] },
	// 3rd cycle: 1x - 3x pills, 3 colors max
	{ "level": 55, "setting": "item_length", "value": [1, 2, 2, 3] },
	{ "level": 60, "setting": "item_colors", "value": [0, 0, 0, 2, 2, 4] },
	{ "level": 65, "setting": "item_colors", "value": [1, 1, 1, 3, 3, 5] },
	{ "level": 70, "setting": "item_colors", "value": [2, 2, 2, 4, 4, 0] },
	{ "level": 75, "setting": "item_colors", "value": [3, 3, 3, 5, 5, 1] },
	{ "level": 80, "setting": "item_colors", "value": [4, 4, 4, 0, 0, 2] },
	{ "level": 85, "setting": "item_colors", "value": [5, 5, 5, 1, 1, 3] },
	// Final cycle: 2x - 4x pills, 3 colors max
	{ "level": 90, "setting": "item_length", "value": [2] },
	{ "level": 96, "setting": "item_length", "value": [1] },
	{ "level": 97, "setting": "item_length", "value": [2] },
	{ "level": 98, "setting": "item_length", "value": [3] },
	{ "level": 99, "setting": "item_length", "value": [4] },
	{ "level": 90, "setting": "item_colors", "value": [5, 5, 6, 7] },
	{ "level": 91, "setting": "item_colors", "value": [4, 4, 6, 7] },
	{ "level": 92, "setting": "item_colors", "value": [3, 3, 6, 7] },
	{ "level": 93, "setting": "item_colors", "value": [2, 2, 6, 7] },
	{ "level": 94, "setting": "item_colors", "value": [1, 1, 6, 7] },
	{ "level": 95, "setting": "item_colors", "value": [0, 0, 6, 7] },
	{ "level": 96, "setting": "item_colors", "value": [6, 7] }
];
for(let i = 0; i <= 99; i++) {
	// Tick rate ranges from 1.0 to 0.2 for 100 levels
	// Target chance ranges from 0.5 to 0.25: For the best difficulty curve it peaks at level 50 then decreases again
	settings_overrides.push({ "level": i, "setting": "time", "value": 1 - i / 125 });
	settings_overrides.push({ "level": i, "setting": "target_chance", "value": 0.25 + (Math.abs(50 - i) / 50) * 0.25 });
}

// Settings prefixed with item_* are arrays of indexes, the same item can be added multiple times to influence probabilities
const settings = {
	"background": [DISPLAY_CANVAS_BOX[2], DISPLAY_CANVAS_BOX[3]],
	"position": [32 * DISPLAY_CANVAS_ZOOM, 64 * DISPLAY_CANVAS_ZOOM],
	"grid": [8, 16],
	"resolution": 8 * DISPLAY_CANVAS_ZOOM,
	"levels": 99,
	"previews": 2,
	"target_chance": 0.25,
	"target_height": 8,
	"time": 1,
	"chain": 3,
	"item_length": [],
	"item_colors": [],
	"statuses": [5, 5, 2.5, 2.5, 3.75, 3.75, 1, 1],
	"overrides": settings_overrides
}

// Static class used to load and read assets universally
class data {
	static counter = 0;
	static images = {};
	static audio = {};

	// Called with true when an asset is added and false when it finished loading, the game launches once the counter is zero
	static count(add) {
		data.counter += add ? -1 : +1;
		if(data.counter == 0)
			new game(canvas, settings);
	}

	// Load an image asset
	static load_image(name) {
		if(data.images.hasOwnProperty(name))
			return;
		data.count(true);
		data.images[name] = new Image();
		data.images[name].src = "img/" + name + ".gif";
		data.images[name].onload = function() {
			data.count(false);
		};
	}

	// Load an audio asset
	static load_audio(name) {
		if(data.audio.hasOwnProperty(name))
			return;
		data.count(true);
		data.audio[name] = new Audio();
		data.audio[name].src = "snd/" + name + ".ogg";
		data.audio[name].oncanplaythrough = function() {
			data.count(false);
		};
	}

	// Preload all assets used by the game
	static load() {
		data.load_image("background");
		data.load_image("effect_clear");
		data.load_image("effect_drop");
		data.load_audio("tick");
		data.load_audio("game_lost");
		data.load_audio("game_won");
		data.load_audio("game_continue");
		data.load_audio("item_drop_small");
		data.load_audio("item_drop_large");
		for(let c in ITEM_COLOR) {
			data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_TARGET);
			data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_SINGLE);
			for(let t in ITEM_SPRITE_SEGMENT_START)
				data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_SEGMENT_START[t]);
			for(let t in ITEM_SPRITE_SEGMENT_CENTER)
				data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_SEGMENT_CENTER[t]);
			for(let t in ITEM_SPRITE_SEGMENT_END)
				data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_SEGMENT_END[t]);
			data.load_audio("item_clear_" + ITEM_COLOR[c]);
		}
	}
}

// Static class for the audio system
class audio {
	static channel_sound = new Audio();
	static busy = false;
	static sound_default = "tick";
	static sound = undefined;

	// Setup the default channels and their settings
	static configure() {
		audio.channel_sound.volume = 0.5;
		audio.channel_sound.loop = false;
		audio.channel_sound.onended = function() {
			audio.busy = false;
		}
	}

	// Play a custom sound if one is scheduled, the default sound is played otherwise
	// Custom sounds have higher priority and may interrupt any ongoing sound, the default sound has low priority and may never cut another sound
	static play() {
		if(audio.sound) {
			audio.channel_sound.src = data.audio[audio.sound].src;
			audio.channel_sound.play().catch(() => {});
			audio.busy = true;
		} else if(!audio.busy) {
			audio.channel_sound.src = data.audio[audio.sound_default].src;
			audio.channel_sound.play().catch(() => {});
		}
		audio.sound = undefined;
	}
}
audio.configure();

// Visual effect, shows for a given amount of time then removes itself
class effect {
	constructor(parent, position, resolution, image, duration) {
		this.element = document.createElement("img");
		this.element.setAttribute("class", "effect");
		this.element.setAttribute("src", data.images[image].src);
		css_box(this.element, [position[0] * resolution, position[1] * resolution, resolution, resolution]);
		parent.appendChild(this.element);
		setTimeout(this.remove.bind(this), duration * 1000);
	}

	remove() {
		this.element.remove();
	}
}

// Static item, used for visual purposes
class item_static {
	constructor(parent, items, settings, colors) {
		this.parent = parent;
		this.items = items;
		this.items.push(this);
		this.settings = settings;
		this.colors = colors;
		this.position = [0, 0];
		this.angle = 0;
		this.target = false;
		this.active = false;
		this.elements = [];
	}

	remove() {
		for(let element in this.elements)
			this.elements[element].remove();
		this.items.splice(this.get_index(), 1);
	}

	// Update the HTML element of a specific segment, create a new element if the index doesn't already exist
	update_element(index, pos, color, type) {
		if(!this.elements[index]) {
			this.elements[index] = document.createElement("img");
			this.elements[index].setAttribute("class", "item");
			this.parent.appendChild(this.elements[index]);
		}
		this.elements[index].setAttribute("src", data.images["item_" + color + "_" + type].src);
		css_box(this.elements[index], [(pos[0] + this.settings.offset[0]) * this.settings.resolution, (pos[1] + this.settings.offset[1]) * this.settings.resolution, this.settings.resolution, this.settings.resolution]);
	}

	// Update all segments of this item
	update() {
		const segments = this.get_segments();
		for(let s in segments) {
			var type = this.target ? ITEM_SPRITE_TARGET : ITEM_SPRITE_SINGLE;
			if(this.colors.length > 1)
				if(s == 0)
					type = ITEM_SPRITE_SEGMENT_START[this.angle];
				else if(s == this.colors.length - 1)
					type = ITEM_SPRITE_SEGMENT_END[this.angle];
				else
					type = ITEM_SPRITE_SEGMENT_CENTER[this.angle];
			this.update_element(s, segments[s], ITEM_COLOR[segments[s][2]], type);
		}
	}

	// Get the index of this item from the item list, as no two items should occupy the same space use position as the identifier
	get_index() {
		for(let i in this.items)
			if(this.items[i].position == this.position)
				return i;
		return undefined;
	}

	// Returns the segment at index as [x, y, color], given the specified item position / angle
	get_segment_at(position, angle, index) {
		var dir = [0, 0];
		if(angle == 0)
			dir = [0, -1];
		else if(angle == 1)
			dir = [+1, 0];
		else if(angle == 2)
			dir = [0, +1];
		else if(angle == 3)
			dir = [-1, 0];

		// The center is based on item length, if the item has an even number of segments the origin must be offset to ensure rotation occurs at the same position
		var center = Math.floor((this.colors.length - 1) / 2);
		if(this.colors.length % 2 == 0 && (dir[0] < 0 || dir[1] < 0))
			center++;
		return [(position[0] - center * dir[0]) + (index * dir[0]), (position[1] - center * dir[1]) + (index * dir[1]), this.colors[index]];
	}

	// Returns an array containing the positions and colors of all segments as [x, y, color]
	get_segments() {
		var segments = [];
		for(let c = 0; c < this.colors.length; c++)
			segments.push(this.get_segment_at(this.position, this.angle, c));
		return segments;
	}

	// Set the item to this position and angle
	set_pos(position, angle) {
		this.position = position;
		this.angle = angle;
		this.update();
	}

	// Change the color at the given segment
	set_color(color, index) {
		this.colors[index] = color;
		this.update();
	}

	// Set this item as a target or normal item, only 1 x 1 items can be targets
	set_target(target) {
		if(this.colors.length != 1)
			return;
		this.active = false;
		this.target = target;
		this.update();
	}
}

// Dynamic item, supports physics and movement
class item extends item_static {
	// Check if the item would collide with other items or world boundaries at the given position
	collides(position, angle) {
		// Check world boundaries
		const pos_start = this.get_segment_at(position, angle, 0);
		const pos_end = this.get_segment_at(position, angle, this.colors.length - 1);
		const box = [Math.min(pos_start[0], pos_end[0]), Math.min(pos_start[1], pos_end[1]), Math.max(pos_start[0], pos_end[0]), Math.max(pos_start[1], pos_end[1])];
		if(box[0] < 0 || box[1] < 0 || box[2] >= this.settings.grid[0] || box[3] >= this.settings.grid[1])
			return true;

		// Check other items, scan every segment on this item and see if its position is taken by any segment on the other item
		const index = this.get_index();
		for(let i in this.items) {
			if(i == index)
				continue;
			for(let c1 = 0; c1 < this.colors.length; c1++) {
				const pos1 = this.get_segment_at(position, angle, c1);
				for(let c2 = 0; c2 < this.items[i].colors.length; c2++) {
					const pos2 = this.items[i].get_segment_at(this.items[i].position, this.items[i].angle, c2);
					if(pos1[0] == pos2[0] && pos1[1] == pos2[1])
						return true;
				}
			}
		}
		return false;
	}

	// Check if the item is currently standing on something, targets are always pinned
	sitting() {
		if(this.target)
			return true;
		return this.collides([this.position[0], this.position[1] + 1], this.angle)
	}

	// Move the item based on position and angle offset, targets can't be moved
	move(position, angle) {
		if(this.target)
			return;

		var new_position = [this.position[0] + position[0], this.position[1] + position[1]];
		var new_angle = this.angle + angle;
		if(new_angle > 3 || this.colors.length == 1)
			new_angle = 0;
		else if(new_angle < 0)
			new_angle = 3;

		if((new_position[0] != this.position[0] || new_position[1] != this.position[1] || new_angle != this.angle) && !this.collides(new_position, new_angle)) {
			this.set_pos(new_position, new_angle);
			if(this.sitting()) {
				const segments = this.get_segments();
				for(let s in segments)
					new effect(this.parent, [segments[s][0] + this.settings.offset[0], segments[s][1] + this.settings.offset[1]], this.settings.resolution, "effect_drop", 0.25);
				audio.sound = segments.length == 1 ? "item_drop_small" : "item_drop_large";
			}
		}
	}
}

// Game background, handles backdrop images and visual details
class game_background {
	constructor(parent, box) {
		this.element_background = document.createElement("img");
		this.element_background.setAttribute("class", "background");
		this.element_background.setAttribute("src", data.images["background"].src);
		css_box(this.element_background, box);
		parent.appendChild(this.element_background);
	}
}

// Game, handles all logics and mechanics
class game {
	constructor(parent, settings) {
		this.settings = settings;
		this.level = 0;
		this.score = 0;
		this.items = [];
		this.items_next = [];
		this.timer = undefined;

		this.background = new game_background(parent, [0, 0, this.settings.background[0], this.settings.background[1]]);
		this.center = Math.floor((this.settings.grid[0] - 1) / 2);
		this.settings_item = { "grid": this.settings.grid, "offset": [0, this.settings.previews + DISPLAY_GAME_PADDING], "resolution": this.settings.resolution };
		this.settings_item_next = { "grid": this.settings.grid, "offset": [0, DISPLAY_GAME_PADDING], "resolution": this.settings.resolution };

		this.element = document.createElement("div");
		this.element.setAttribute("class", "game");
		css_box(this.element, [this.settings.position[0], this.settings.position[1], this.settings.grid[0] * this.settings.resolution, (this.settings.grid[1] + this.settings.previews + DISPLAY_GAME_PADDING) * this.settings.resolution]);
		parent.appendChild(this.element);

		this.element_label_score = document.createElement("label");
		this.element_label_score.setAttribute("class", "label label_left");
		this.element_label_score.style["font-size"] = Math.floor(this.settings.resolution / 1.5) + "px";
		this.element_label_score.innerHTML = 0;
		css_box(this.element_label_score, [this.settings.position[0], this.settings.position[1], this.settings.resolution * this.settings.grid[0], this.settings.resolution]);
		parent.appendChild(this.element_label_score);

		this.element_label_level = document.createElement("label");
		this.element_label_level.setAttribute("class", "label label_right");
		this.element_label_level.style["font-size"] = Math.floor(this.settings.resolution / 1.5) + "px";
		this.element_label_level.innerHTML = 0;
		css_box(this.element_label_level, [this.settings.position[0], this.settings.position[1], this.settings.resolution * this.settings.grid[0], this.settings.resolution]);
		parent.appendChild(this.element_label_level);

		// Register key presses, the event must be the first parameter of the target function
		document.addEventListener("keydown", this.key.bind(this), false);
		this.game_start();
	}

	// Start a new game
	game_start() {
		// Apply level overrides to the settings
		for(let i in this.settings.overrides) {
			const override = this.settings.overrides[i];
			if(this.level >= override.level)
				this.settings[override.setting] = override.value;
		}

		// Clear the grid of existing items and prepare the upcoming ones
		for(let i = this.items.length - 1; i >= 0; i--)
			this.items[i].remove();
		for(let i = 0; i < this.settings.previews; i++)
			this.next();

		// Spawn target items across the bottom area, probability increases with lower positions
		// Instantly clear any chains that form instead of waiting for the first game loop
		// At least one target must be spawned otherwise the game is won from the start
		while(this.items.length == 0) {
			for(let x = 0; x < this.settings.grid[0]; x++)
				for(let y = this.settings.target_height; y < this.settings.grid[1]; y++) {
					const probability = 1 - (this.settings.grid[1] - y) / (this.settings.grid[1] - this.settings.target_height);
					if(probability * this.settings.target_chance > Math.random()) {
						const it = new item(this.element, this.items, this.settings_item, [random_array(this.settings.item_colors)]);
						it.set_pos([x, y], 0);
						it.set_target(true);
					}
				}
			this.chain(false);
		}

		this.timer = setInterval(this.update.bind(this), this.settings.time * 1000);
	}

	// End the existing game
	game_end(success) {
		clearInterval(this.timer);
		this.timer = undefined;

		if(success && this.level >= this.settings.levels) {
			audio.sound = "game_won";
			audio.play();
			alert("Game over: You won! Thank you for playing.");
		} else if(success) {
			audio.sound = "game_continue";
			audio.play();
			this.level++;
			this.element_label_level.innerHTML = Math.min(this.level, DISPLAY_LABEL_LIMIT);
			this.game_start();
		} else {
			audio.sound = "game_lost";
			audio.play();
			alert("Game over: You lost! Press the ` key for help.");
		}
	}

	// Check if enough items of the same color exist in a straight line, returns a position list if the chain is long enough
	chain_positions(flip) {
		const to_x = flip ? this.settings.grid[0] : this.settings.grid[1];
		const to_y = flip ? this.settings.grid[1] : this.settings.grid[0];
		var color_last = undefined;
		var positions = [];
		for(let x = 0; x < to_x; x++) {
			for(let y = 0; y < to_y; y++) {
				const pos = flip ? [x, y] : [y, x];
				var color = undefined;

				// Find the item and segment touching this position and get its color, only count items that aren't falling
				color:
				for(let i in this.items) {
					if(!this.items[i].sitting())
						continue;
					const segments = this.items[i].get_segments();
					for(let s in segments)
						if(segments[s][0] == pos[0] && segments[s][1] == pos[1]) {
							color = segments[s][2];
							break color;
						}
				}

				// If the chain broke, stop here if we have the necessary length, otherwise reset the chain and keep trying
				if(color_last != color)
					if(positions.length >= this.settings.chain)
						break;
					else
						positions = [];
				if(!isNaN(color))
					positions.push(pos);
				color_last = color;
			}

			// Return the chain if valid, move on to the next column / row otherwise
			if(positions.length >= this.settings.chain)
				return positions;
		}
		return undefined;
	}

	// Clear items that form a chain, returns the number of items that were removed
	chain(effects) {
		var count = 0;
		var type = undefined;
		var chain = undefined;
		while(chain = this.chain_positions(false) || this.chain_positions(true)) {
			var remove = [];
			var spawn = [];
			for(let i in this.items) {
				const segments = this.items[i].get_segments();

				// If any item segment touches this position in the chain, the item will be removed
				segments:
				for(let s in segments)
					for(let c in chain)
						if(segments[s][0] == chain[c][0] && segments[s][1] == chain[c][1]) {
							remove.push(i);
							break segments;
						}

				// If the item was flagged for removal, new 1 x 1 items will be spawned to replace segments that weren't cut
				if(remove.includes(i)) {
					count += segments.length;
					segments:
					for(let s in segments) {
						for(let c in chain)
							if(segments[s][0] == chain[c][0] && segments[s][1] == chain[c][1]) {
								type = segments[s][2];
								if(effects)
									new effect(this.element, [segments[s][0] + this.settings_item.offset[0], segments[s][1] + this.settings_item.offset[1]], this.settings.resolution, "effect_clear", 0.5);
								continue segments;
							}
						spawn.push(segments[s]);
						count--;
					}
				}
			}

			// Items to be removed are stored as an array of indexes
			// Since indexes will change, use an inverted loop to prevent addressing the wrong item
			for(let i = remove.length - 1; i >= 0; i--)
				this.items[remove[i]].remove();

			// Items to be spawned are stored as [x, y, color]
			for(let i in spawn) {
				const it = new item(this.element, this.items, this.settings_item, [spawn[i][2]]);
				it.set_pos(spawn[i], 0);
			}
		}

		if(!isNaN(type) && effects)
			audio.sound = "item_clear_" + ITEM_COLOR[type];
		return count;
	}

	// Update the list of upcoming items and their visual previews, returns the segments of the last item if one exists
	next() {
		// Store the segments of the last item, then remove it if the preview list is full
		const segments = this.items_next.length > 0 ? this.items_next[0].get_segments() : undefined;
		if(this.items_next.length >= this.settings.previews)
			this.items_next[0].remove();

		// Determine the colors of the new item and add it
		var colors = [];
		for(let i = 0; i < random_array(this.settings.item_length); i++)
			colors.push(random_array(this.settings.item_colors));
		new item_static(this.element, this.items_next, this.settings_item_next, colors);

		// Position all items in the list from the bottom up
		for(let i in this.items_next)
			this.items_next[i].set_pos([this.center, this.settings.previews - i - 1], 1);

		return segments;
	}

	// Return the random probability of a status effect for the given color and count
	status(count, index) {
		return (count / (this.settings.grid[0] * this.settings.grid[1])) * this.settings.statuses[index] > Math.random();
	}

	// Update function that executes every tick
	update() {
		// Determine the total amount of target colors present in the scene for status checks
		var targets = [];
		for(let i in this.items)
			if(this.items[i].target)
				targets[this.items[i].colors[0]] = isNaN(targets[this.items[i].colors[0]]) ? 0 : targets[this.items[i].colors[0]] + 1;

		// Status 0 & 1: Preform an extra update or skip this tick
		if(this.status(targets[0], 0))
			this.update();
		if(this.status(targets[1], 1))
			return;

		// Apply gravity and other item status effects
		// Game over: Lose if the active item landed while still at its spawn row
		var has_active = false;
		for(let i in this.items) {
			// Status 2 & 3: Convert 1 x 1 items to or from a target and normal item if they're below the target spawn height
			if(this.items[i].position[1] >= this.settings.target_height) {
				if(this.status(targets[2], 2) && !this.items[i].target)
					this.items[i].set_target(true);
				if(this.status(targets[3], 3) && this.items[i].target)
					this.items[i].set_target(false);
			}

			// Status 4 & 5: Apply movement and rotation
			this.items[i].move([0, 1], 0);
			if(this.status(targets[4], 4))
				this.items[i].move([0, 0], Math.random() < 0.5 ? -1 : +1);
			if(this.status(targets[5], 5))
				this.items[i].move([Math.random() < 0.5 ? -1 : +1, 0], 0);

			// Status 6 & 7: Change the colors of item segments for cloning and spreading
			const segments = this.items[i].get_segments();
			for(let s in segments) {
				if(this.status(targets[6], 6) && segments[s][2] == 6)
					this.items[i].set_color(random_array(this.settings.item_colors), s);
				if(this.status(targets[7], 7) && segments[s][2] != 7)
					this.items[i].set_color(7, s);
			}

			// If the active item landed or became a target deactivate it
			if(this.items[i].active && this.items[i].sitting()) {
				this.items[i].active = false;
				if(this.items[i].position[1] == 0)
					return this.game_end(false);
			}
			has_active = has_active ? true : this.items[i].active;
		}

		// Clear chains and add the cleared item count as score, count is raised by the power of two to reward clearing multiple items in one go
		this.score += 1 + this.chain(true) ** 2;
		this.element_label_score.innerHTML = Math.min(this.score, DISPLAY_LABEL_LIMIT);

		// Game over: Win if no target items are left
		var has_target = false;
		for(let i in this.items)
			if(this.items[i].target) {
				has_target = true;
				break;
			}
		if(!has_target)
			return this.game_end(true);

		// If there's no active item, get the colors of the next item and spawn one
		if(!has_active) {
			var colors = [];
			const segments = this.next();
			for(let s in segments)
				colors.push(segments[s][2]);

			const it = new item(this.element, this.items, this.settings_item, colors);
			it.set_pos([this.center, 0], 1);
			it.active = true;
		}
		audio.play();
	}

	// Fires when a key is pressed
	key(event) {
		if(event.repeat)
			return;

		// Convert the input to a desired offset as [x, y, angle]
		var offset = [0, 0, 0];
		if(event.key == "ArrowLeft" || event.key == "a" || event.key == "A")
			offset = [-1, 0, 0];
		if(event.key == "ArrowRight" || event.key == "d" || event.key == "D")
			offset = [+1, 0, 0];
		if(event.key == "ArrowUp" || event.key == "w" || event.key == "W")
			offset = [0, 0, +1];
		if(event.key == "ArrowDown" || event.key == "s" || event.key == "S")
			offset = [0, +1, 0];

		// Apply the offset to the active item, if the item touched the ground instantly deactivate and preform an update
		for(let i in this.items)
			if(this.items[i].active) {
				this.items[i].move([offset[0], offset[1]], offset[2]);
				if(this.items[i].sitting()) {
					clearInterval(this.timer);
					this.timer = setInterval(this.update.bind(this), this.settings.time * 1000);
					this.items[i].active = false;
					this.update();
				}
				break;
			}

		// Cheat to instantly jump to the next level, should only be used for testing and may be subject to removal
		if(event.key == "Backspace")
			this.game_end(true);

		// Display gameplay instructions as well as status effects for active colors
		if(event.key == "`") {
			alert("Use the arrow keys or WASD to control the active item: Left and right to move, up to rotate, down to lower the item faster. Chain at least " + this.settings.chain + " items of the same color to clear a line, remove all targets to advance. Different colors induce different effects, active statuses as follows...");
			if(this.settings.item_colors.includes(0))
				alert(ITEM_COLOR[0] + " / anger: Opposite of " + ITEM_COLOR[1] + " / fear. Has a chance of " + this.settings.statuses[0] + "x per tick. Induces aggitation and increases the creature's heart rate, may introduce extra ticks causing time to flow faster than normal.");
			if(this.settings.item_colors.includes(1))
				alert(ITEM_COLOR[1] + " / fear: Opposite of " + ITEM_COLOR[0] + " / anger. Has a chance of " + this.settings.statuses[1] + "x per tick. Increases anxiety which may cause the heart to skip beats, resulting in some ticks being lost and time freezing.");
			if(this.settings.item_colors.includes(2))
				alert(ITEM_COLOR[2] + " / nausea: Opposite of " + ITEM_COLOR[3] + " / serenity. Has a chance of " + this.settings.statuses[2] + "x per tick. Causes feelings of sickness due to germs that encourage targets to multiply, leftover 1 x 1 pills may turn into targets which will also need to be neutralized.");
			if(this.settings.item_colors.includes(3))
				alert(ITEM_COLOR[3] + " / serenity: Opposite of " + ITEM_COLOR[2] + " / nausea. Has a chance of " + this.settings.statuses[3] + "x per tick. Induces a state of calm thus helping the creature's own immune system, targets may automatically become neutralized and turn into 1 x 1 sized pills of the same color.");
			if(this.settings.item_colors.includes(4))
				alert(ITEM_COLOR[4] + " / sleep: Complementary to " + ITEM_COLOR[5] + " / excitement. Has a chance of " + this.settings.statuses[4] + "x per tick. This makes the creature sleepy and less capable of regulating their gut's flow, large pills may get squeezed in place and slip causing them to change rotation.");
			if(this.settings.item_colors.includes(5))
				alert(ITEM_COLOR[5] + " / excitement: Complementary to " + ITEM_COLOR[4] + " / sleep. Has a chance of " + this.settings.statuses[5] + "x per tick. Makes the creature more horny which may cause random spastic movement of the muscles, pills may get thrown around the stomach and move sideways on their own.");
			if(this.settings.item_colors.includes(6))
				alert(ITEM_COLOR[6] + " / absorption: Reverse of " + ITEM_COLOR[7] + " / spread. Has a chance of " + this.settings.statuses[6] + "x per tick. Affects items and segments of the same color, this mysterious substance absorbs and replicates nearby substances causing its own color to transform into another color.");
			if(this.settings.item_colors.includes(7))
				alert(ITEM_COLOR[7] + " / spread: Reverse of " + ITEM_COLOR[6] + " / absorption. Has a chance of " + this.settings.statuses[7] + "x per tick. Affects items and segments of other colors, when this classified substance is present pills and targets may absorb it causing them to lose their color and become like this.");
		}
	}
}

let canvas = document.createElement("div");
canvas.setAttribute("class", "canvas");
css_box(canvas, [DISPLAY_CANVAS_BOX[0], DISPLAY_CANVAS_BOX[1], DISPLAY_CANVAS_BOX[2], DISPLAY_CANVAS_BOX[3]]);
document.body.appendChild(canvas);
data.load();
