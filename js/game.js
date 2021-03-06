// Returns a random entry from an array
function random_array(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

// Sets the position and scale of an element
function html_box(element, box) {
	element.style["left"] = box[0] + "px";
	element.style["top"] = box[1] + "px";
	element.style["width"] = box[2] + "px";
	element.style["height"] = box[3] + "px";
}

// Creates an HTML element with basic settings
function html_create(parent, type, css, box) {
	const element = document.createElement(type);
	element.setAttribute("class", css);
	html_box(element, box);
	parent.appendChild(element);
	return element;
}

// Static class used to load and read assets universally, also stores the active game instance
class data {
	static game = undefined;
	static counter = 0;
	static images = {};
	static audio = {};
	static element_canvas = undefined;
	static element_title = undefined;

	// Called with true when an asset is added and false when it finished loading, the game launches once the counter is zero
	static count(add) {
		data.counter += add ? -1 : +1;
		if(data.counter == 0)
			data.load_end();
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
		// data.load_image("title_loading");
		data.load_image("title");
		data.load_image("title_difficulty");
		data.load_image("title_difficulty_nightmare");
		data.load_image("background_easy");
		data.load_image("background_medium");
		data.load_image("background_hard");
		data.load_image("background_nightmare");
		data.load_image("foreground");
		data.load_image("eyes");
		data.load_image("effect_clear");
		data.load_image("effect_drop");
		data.load_audio("tick");
		data.load_audio("game_lost");
		data.load_audio("game_won");
		data.load_audio("game_continue");
		data.load_audio("item_drop_small");
		data.load_audio("item_drop_large");
		for(let c in ITEM_COLOR) {
			data.load_image("foreground_" + ITEM_COLOR[c]);
			data.load_image("eyes_" + ITEM_COLOR[c]);
			data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_TARGET);
			data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_SINGLE);
			for(let t in ITEM_SPRITE_SEGMENT_START)
				data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_SEGMENT_START[t]);
			for(let t in ITEM_SPRITE_SEGMENT_CENTER)
				data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_SEGMENT_CENTER[t]);
			for(let t in ITEM_SPRITE_SEGMENT_END)
				data.load_image("item_" + ITEM_COLOR[c] + "_" + ITEM_SPRITE_SEGMENT_END[t]);
			data.load_image("indicator_" + ITEM_COLOR[c]);
			data.load_audio("item_clear_" + ITEM_COLOR[c]);
			data.load_audio("item_indicator_" + ITEM_COLOR[c]);
		}
		for(let s in DATA_SCENE)
			data.load_image("scene/" + DATA_SCENE[s]);
		for(let d in DATA_DIALOGS)
			data.load_image("dialog/" + DATA_DIALOGS[d]);
		for(let v in DATA_VOICES)
			data.load_audio("voice/" + DATA_VOICES[v]);
		for(let m in DATA_MUSIC)
			data.load_audio("music/" + DATA_MUSIC[m]);
	}

	// Create the core element and title screen, the title screen isn't stored in the cache and is used to control the process
	static load_start() {
		document.body.style["background-color"] = DISPLAY_COLOR;
		data.element_canvas = html_create(document.body, "div", "canvas", [DISPLAY_CANVAS_BOX[0], DISPLAY_CANVAS_BOX[1], DISPLAY_CANVAS_BOX[2], DISPLAY_CANVAS_BOX[3]]);
		data.element_title = html_create(data.element_canvas, "img", "title", [0, 0, DISPLAY_CANVAS_BOX[2], DISPLAY_CANVAS_BOX[3]]);
		data.element_title.setAttribute("src", "img/title_loading.gif");
		data.element_title.style["display"] = "block";
		data.element_title.onload = function() {
			setTimeout(data.load, 1000);
		}
	}

	// Key actions after loading
	static load_end_key() {
		if(event.key == "Enter" || event.key == " ") {
			document.removeEventListener("keydown", data.load_end_key, false);
			data.selecting(true);
		}
	}

	// All data has loaded, update the title screen and wait for the player to start the game
	static load_end() {
		audio.configure();
		data.element_title.setAttribute("src", data.images["title"].src);
		document.addEventListener("keydown", data.load_end_key, false);
	}

	// Shut down the game and return to the title screen, refresh or close the window in or after nightmare mode to apply special settings
	static reset() {
		if(NIGHTMARE)
			location.reload();
		else if(NIGHTMARE_AFTER)
			window.close();
		else {
			data.game.remove();
			data.game = undefined;
			data.selecting(true);
		}
	}

	// Key actions for the title screen difficulty selector
	static selecting_key() {
		var difficulty = undefined;
		if((event.key == "ArrowLeft" || event.key == "a" || event.key == "A") && !NIGHTMARE)
			difficulty = 0.5;
		if((event.key == "ArrowRight" || event.key == "d" || event.key == "D") && !NIGHTMARE)
			difficulty = 1.5;
		if((event.key == "ArrowUp" || event.key == "w" || event.key == "W") && !NIGHTMARE)
			difficulty = 1;
		if((event.key == "ArrowDown" || event.key == "s" || event.key == "S") && NIGHTMARE)
			difficulty = 2;
		if(!isNaN(difficulty)) {
			data.selecting(false);
			data.game = new game(data.element_canvas, SETTINGS, difficulty);
		}
	}

	// Enable or disable difficulty selection and the title screen with it
	static selecting(show) {
		if(show) {
			document.addEventListener("keydown", data.selecting_key, false);
			if(NIGHTMARE) {
				window.location.hash = NAME_PLAYER = NAME_PLAYER_DEFAULT;
				data.element_title.setAttribute("src", data.images["title_difficulty_nightmare"].src);
				audio.play_music(MUSIC_TITLE_NIGHTMARE);
			} else {
				window.location.hash = NAME_PLAYER;
				data.element_title.setAttribute("src", data.images["title_difficulty"].src);
				audio.play_music(MUSIC_TITLE);
			}
		} else
			document.removeEventListener("keydown", data.selecting_key, false);
		data.element_title.style["display"] = show ? "block" : "none";
	}
}

// Static class for the audio system
class audio {
	static channel_sound = new Audio();
	static channel_music = new Audio();
	static sound_busy = false;
	static sound = undefined;
	static music_speed = 1;

	// Setup the default channels and their settings
	static configure() {
		audio.channel_music.volume = 0.5;
		audio.channel_music.loop = true;
		audio.channel_sound.volume = 0.5;
		audio.channel_sound.loop = false;
		audio.channel_sound.onended = function() {
			audio.sound_busy = false;
		}
	}

	// Play a custom sound if one is scheduled, the default sound is played otherwise
	// Custom sounds have higher priority and may interrupt any ongoing sound, the tick sound has low priority and may never cut another sound
	static play_sound() {
		if(audio.sound) {
			if(audio.channel_sound.src != data.audio[audio.sound].src)
				audio.channel_sound.src = data.audio[audio.sound].src;
			audio.channel_sound.play().catch(() => {});
			audio.sound_busy = true;
		} else if(!audio.sound_busy) {
			if(audio.channel_sound.src != data.audio[SOUND_TICK].src)
				audio.channel_sound.src = data.audio[SOUND_TICK].src;
			audio.channel_sound.play().catch(() => {});
		}
		audio.sound = undefined;
	}

	// Loop the given song, the value must be an index in the music object or undefined to stop the song
	static play_music(index) {
		if(!isNaN(index)) {
			const name = "music/" + DATA_MUSIC[index];
			if(audio.channel_music.src != data.audio[name].src)
				audio.channel_music.src = data.audio[name].src;
			if(audio.channel_music.paused)
				audio.channel_music.play().catch(() => {});
			audio.channel_music.playbackRate = audio.music_speed;
		} else
			audio.channel_music.pause();
	}
}

// Visual effect, shows for a given amount of time then removes itself
class effect {
	constructor(parent, position, resolution, image, duration) {
		this.element = html_create(parent, "img", "effect", [position[0] * resolution, position[1] * resolution, resolution, resolution]);
		this.element.setAttribute("src", data.images[image].src);
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
		const box = [(pos[0] + this.settings.offset[0]) * this.settings.resolution, (pos[1] + this.settings.offset[1]) * this.settings.resolution, this.settings.resolution, this.settings.resolution];
		if(!this.elements[index])
			this.elements[index] = html_create(this.parent, "img", "item", box);
		else
			html_box(this.elements[index], box);

		const src = data.images["item_" + color + "_" + type].src;
		if(this.elements[index].getAttribute("src") != src)
			this.elements[index].setAttribute("src", src);
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

// Game dialog, handles showing chat messages
class game_dialog {
	constructor(parent, box, messages) {
		this.box = box;
		this.messages = messages;
		this.index = undefined;
		this.interactive = false;
		this.ending = false;
		this.timeout = undefined;
		this.timer = undefined;

		this.element_foreground = html_create(parent, "img", "dialog", this.box);
		this.element_foreground.setAttribute("src", data.images["dialog/" + DATA_DIALOGS[0]].src);
		this.element_foreground.style["display"] = "none";
		this.element_label = html_create(parent, "label", "label label_dialog label_left", this.box);
		this.element_label.style["font-size"] = DISPLAY_FONT_SIZE + "px";
		this.element_label.innerHTML = "";
	}

	remove() {
		clearInterval(this.timer);
		clearTimeout(this.timeout);
		this.timer = undefined;
		this.timeout = undefined;
		this.element_foreground.remove();
		this.element_label.remove();
	}

	// Hide the dialog without removing its object while waiting for new messages
	hide() {
		clearInterval(this.timer);
		clearTimeout(this.timeout);
		this.timer = undefined;
		this.timeout = undefined;
		this.interactive = false;
		this.ending = false;
		this.index = undefined;
		this.element_foreground.style["display"] = "none";
		this.element_label.innerHTML = "";
	}

	// Pick a random message based on game characteristics, undefined filters are ignored
	// trigger_at: 0 = no trigger, 1 = random, 2 = next level, 3 = game was lost, 4 = game was won
	// trigger_difficulty: 0 = easy, 1 = medium, 2 = hard, 3 = nightmare
	pick(at, difficulty, level, color) {
		var indexes = [];
		for(let i in this.messages) {
			if(this.messages[i].trigger_at != at)
				continue;
			if(this.messages[i].trigger_difficulty && !this.messages[i].trigger_difficulty.includes(Math.floor(difficulty * 2) - 1))
				continue;
			if(this.messages[i].trigger_level && !this.messages[i].trigger_level.includes(level))
				continue;
			if(this.messages[i].trigger_color && !this.messages[i].trigger_color.includes(color))
				continue;
			indexes.push(i);
		}
		if(indexes.length > 0) {
			this.index = +indexes[Math.floor(Math.random() * indexes.length)];
			this.read();
		}
	}

	// Advances to the next message or hides the dialog if this was the last entry, returns true if a valid message exists
	// If this is an endgame dialog, refresh the window or close it for nightmare mode
	advance() {
		if(this.messages[this.index].next && this.index + this.messages[this.index].next >= 0 && this.index + this.messages[this.index].next < this.messages.length) {
			this.index += this.messages[this.index].next;
			this.read();
			return true;
		} else if(this.ending)
			data.reset();
		this.hide();
		return false;
	}

	// Add a new character to the string each tick until the full message is displayed
	print() {
		const text = this.messages[this.index].name ? this.messages[this.index].name + ": " + this.messages[this.index].text : this.messages[this.index].text;
		if(this.element_label.innerHTML.length < text.length)
			this.element_label.innerHTML += text.charAt(this.element_label.innerHTML.length);
		else {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	// Begin reading the current message in the list, start printing and set a timeout for message expiration in case this isn't an interactive message
	read() {
		clearInterval(this.timer);
		clearTimeout(this.timeout);
		this.interactive = this.messages[this.index].interactive;
		this.ending = this.ending ? true : this.messages[this.index].trigger_at == 3 || this.messages[this.index].trigger_at == 4;
		this.timer = setInterval(this.print.bind(this), DISPLAY_LABEL_SPEED * 1000);
		this.timeout = this.interactive ? undefined : setTimeout(this.advance.bind(this), DISPLAY_FONT_DURATION * 1000);

		this.element_foreground.setAttribute("src", data.images["dialog/" + DATA_DIALOGS[this.messages[this.index].background]].src);
		this.element_foreground.style["display"] = "block";
		this.element_label.style["color"] = this.messages[this.index].color;
		this.element_label.style["text-shadow"] = "none";
		this.element_label.innerHTML = "";
		html_box(this.element_label, [this.box[0] + DISPLAY_FONT_SIZE, this.box[1] + this.box[3] - this.messages[this.index].height, this.box[2] - (DISPLAY_FONT_SIZE * 2), this.messages[this.index].height]);

		if(this.messages[this.index].color != DISPLAY_FONT_SHADOW_COLOR)
			this.element_label.style["text-shadow"] = (+DISPLAY_FONT_SHADOW + "px 0px 0px " + DISPLAY_FONT_SHADOW_COLOR) + ", " + (-DISPLAY_FONT_SHADOW + "px 0px 0px " + DISPLAY_FONT_SHADOW_COLOR) + ", " + ("0px " + +DISPLAY_FONT_SHADOW + "px 0px " + DISPLAY_FONT_SHADOW_COLOR) + ", " + ("0px " + -DISPLAY_FONT_SHADOW + "px 0px " + DISPLAY_FONT_SHADOW_COLOR);
		if(!isNaN(this.messages[this.index].music))
			audio.play_music(this.messages[this.index].music);
		if(this.messages[this.index].sound)
			audio.sound = "voice/" + DATA_VOICES[this.messages[this.index].sound[Math.floor(Math.random() * this.messages[this.index].sound.length)]];
		audio.play_sound();
	}
}

// Game background, handles backdrop images and visual details
class game_background {
	constructor(parent, box, difficulty) {
		const background = DATA_BACKGROUNDS[Math.floor(difficulty * 2) - 1];
		this.box = box;
		this.element_scene = html_create(parent, "img", "scene", this.box);
		this.element_scene.setAttribute("src", data.images["scene/" + DATA_SCENE[0]].src);
		this.element_scene.style["display"] = "block";
		this.element_background = html_create(parent, "img", "background", this.box);
		this.element_background.setAttribute("src", data.images["background_" + background].src);
		this.element_eyes = html_create(parent, "img", "foreground", this.box);
		this.element_eyes.setAttribute("src", data.images["eyes"].src);
		this.element_foreground = html_create(parent, "img", "foreground", this.box);
		this.element_foreground.setAttribute("src", data.images["foreground"].src);
	}

	remove() {
		this.element_background.remove();
		this.element_eyes.remove();
		this.element_foreground.remove();
	}

	// Update or clear the scene and background color
	set_scene(index) {
		var src = isNaN(index) ? undefined : data.images["scene/" + DATA_SCENE[index]].src;
		if(src && this.element_scene.getAttribute("src") != src)
			this.element_scene.setAttribute("src", src);
		this.element_scene.style["display"] = isNaN(index) ? "none" : "block";
		document.body.style["background-color"] = isNaN(index) ? DISPLAY_COLOR : DATA_SCENE_COLOR[index];
	}

	// Update the foreground with a particular color
	set_foreground(color) {
		const src = isNaN(color) ? data.images["foreground"].src : data.images["foreground_" + ITEM_COLOR[color]].src;
		if(this.element_foreground.getAttribute("src") != src)
			this.element_foreground.setAttribute("src", src);
	}

	// Update the eyes with a particular color and position offset
	set_eyes(color, position) {
		const src = isNaN(color) ? data.images["eyes"].src : data.images["eyes_" + ITEM_COLOR[color]].src;
		if(this.element_eyes.getAttribute("src") != src)
			this.element_eyes.setAttribute("src", src);
		html_box(this.element_eyes, [this.box[0] + position[0], this.box[1] + position[1], this.box[2], this.box[3]]);
	}
}

// Game, handles all logics and mechanics
class game {
	constructor(parent, settings, difficulty) {
		this.settings = settings;
		this.difficulty = difficulty;
		this.level = 0;
		this.score = 0;
		this.items = [];
		this.items_next = [];
		this.timer = undefined;
		this.timer_extra = undefined;
		this.timer_interval = 0;

		const box = [0, 0, this.settings.background[0], this.settings.background[1]];
		this.center = Math.floor((this.settings.grid[0] - 1) / 2);
		this.settings_item = { "grid": this.settings.grid, "offset": [0, this.settings.previews + DISPLAY_GAME_PADDING], "resolution": this.settings.resolution };
		this.settings_item_next = { "grid": this.settings.grid, "offset": [0, DISPLAY_GAME_PADDING], "resolution": this.settings.resolution };
		this.background = new game_background(parent, box, this.difficulty);
		this.dialog = new game_dialog(parent, box, this.settings.dialog);

		this.element = html_create(parent, "div", "game", [this.settings.position[0], this.settings.position[1], this.settings.grid[0] * this.settings.resolution, (this.settings.grid[1] + this.settings.previews + DISPLAY_GAME_PADDING) * this.settings.resolution]);
		this.element_indicator = html_create(parent, "img", "indicator", box);
		this.element_indicator.setAttribute("src", data.images["indicator_" + ITEM_COLOR[0]].src);
		this.element_indicator.style["display"] = "none";
		this.element_label_score = html_create(parent, "label", "label label_score", [this.settings.position[0], this.settings.position[1], this.settings.resolution * this.settings.grid[0], this.settings.resolution]);
		this.element_label_score.style["font-size"] = DISPLAY_FONT_SIZE + "px";
		this.element_label_score.innerHTML = 0;
		this.element_label_level = html_create(parent, "label", "label label_level", [this.settings.position[0], this.settings.position[1], this.settings.resolution * this.settings.grid[0], this.settings.resolution]);
		this.element_label_level.style["font-size"] = DISPLAY_FONT_SIZE + "px";
		this.element_label_level.innerHTML = 0;

		// Register key presses, the event must be the first parameter of the target function
		document.addEventListener("keydown", this.key.bind(this), false);
		this.game_start();
	}

	remove() {
		clearInterval(this.timer);
		clearTimeout(this.timer_extra);
		this.timer = this.timer_extra = undefined;

		this.background.remove();
		this.dialog.remove();
		this.element.remove();
		this.element_label_score.remove();
		this.element_label_level.remove();
		audio.play_music(undefined);
		document.removeEventListener("keydown", this.key.bind(this), false);
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

		// Spawn target items across the bottom area, at least one target must be spawned otherwise the game is won from the start
		if(this.settings.target_count_max > 0) {
			const count = this.settings.target_count_min + Math.floor(Math.random() * (this.settings.target_count_max - this.settings.target_count_min + 1));

			// X: Valid positions are more probable the closer they are to either edge
			// Y: Valid positions are more probable the closer they get to the bottom
			var positions_x = [];
			var positions_y = [];
			for(let x = 0; x < this.settings.grid[0]; x++)
				for(let i = 0; i <= Math.abs(x - Math.floor(this.settings.grid[0] / 2)); i++)
					positions_x.push(x);
			for(let y = this.settings.target_height; y < this.settings.grid[1]; y++)
				for(let i = 0; i <= y - this.settings.target_height; i++)
					positions_y.push(y);

			// Keep trying to spawn targets at random positions until the chosen count has been achieved
			spawn:
			while(this.items.length < count) {
				// We can never spawn two items in the same location, retry if the same spot was picked twice
				const pos = [random_array(positions_x), random_array(positions_y)];
				for(let i in this.items)
					if(this.items[i].position[0] == pos[0] && this.items[i].position[1] == pos[1])
						continue spawn;

				// Spawn a new target
				const it = new item(this.element, this.items, this.settings_item, [random_array(this.settings.item_colors)]);
				it.set_pos(pos, 0);
				it.set_target(true);

				// Instantly clear any chains that may form or this would happen during the first game loop
				if(this.items.length >= this.settings.chain)
					this.chain(false);
			}
		}

		audio.music_speed = NIGHTMARE ? 0.5 : 1;
		audio.play_music(this.settings.music);
		this.background.set_scene(this.settings.scene);
		this.timer_interval = Math.max(this.settings.time / this.difficulty * 1000, 1);
		this.timer = setInterval(this.update.bind(this), this.timer_interval);
		this.update();
		this.dialog.pick(2, this.difficulty, this.level, undefined);
	}

	// End the existing game
	game_end(success) {
		clearInterval(this.timer);
		clearTimeout(this.timer_extra);
		this.timer = this.timer_extra = undefined;
		this.element_indicator.style["display"] = "none";
		this.dialog.hide();
		audio.music_speed = 1;

		// If this level is set up to contains no targets, losing always counts as success
		const won = success || this.settings.target_count_max == 0;
		const targets = this.targets();
		const color = targets.indexOf(Math.max(...targets));
		if(won && this.level >= this.settings.levels) {
			// The round was won and this was the final level
			if(NIGHTMARE)
				window.location.hash = NAME_PLAYER = NAME_PLAYER_NIGHTMARE;
			this.background.set_scene(undefined);
			this.dialog.pick(4, this.difficulty, this.level, color);
			audio.sound = "game_won";
			audio.play_sound();
		} else if(won) {
			// The round was won
			audio.sound = "game_continue";
			audio.play_sound();
			this.level++;
			this.element_label_level.innerHTML = Math.min(this.level, DISPLAY_LABEL_LIMIT);
			this.game_start();
		} else {
			// The game was lost
			this.background.set_scene(undefined);
			this.dialog.pick(3, this.difficulty, this.level, color);
			audio.sound = "game_lost";
			audio.play_sound();
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

	// Returns the number of targets present in the scene for each color
	targets() {
		var targets = [];
		for(let c in ITEM_COLOR)
			targets[c] = 0;
		for(let i in this.items)
			if(this.items[i].target)
				targets[this.items[i].colors[0]]++;
		return targets;
	}

	// Random activation of a status effect for the given color and count, probability accounts for tick rate
	update_status(count, index) {
		var active = (count / (this.settings.grid[0] * this.settings.grid[1])) * this.settings.statuses[index] * (this.timer_interval / 1000) * this.difficulty > Math.random();
		if(active) {
			this.element_indicator.setAttribute("src", data.images["indicator_" + ITEM_COLOR[index]].src);
			this.element_indicator.style["display"] = "block";
			audio.sound = "item_indicator_" + ITEM_COLOR[index];
		}
		return active;
	}

	// Update function that executes every tick
	update() {
		if(this.dialog.interactive || !this.timer || !document.hasFocus())
			return;

		// Determine the position of the active item and total amount of target colors in the scene, used for status checks and background indicators
		const targets = this.targets();
		var active_pos = [this.center, 0];
		for(let i in this.items)
			if(this.items[i].active)
				active_pos = this.items[i].position;

		// Apply background updates, the status indicator is hidden so it may be set from here on if a status executes
		const color = targets.indexOf(Math.max(...targets));
		const active_pos_x = Math.round(((active_pos[0] * 2) - this.settings.grid[0]) / this.settings.grid[0]) * this.settings.background_look;
		const active_pos_y = Math.round(((active_pos[1] * 2) - this.settings.grid[1]) / this.settings.grid[1]) * this.settings.background_look;
		this.background.set_foreground(targets[color] > 1 ? color : undefined);
		this.background.set_eyes(targets[color] > 0 ? color : undefined, [active_pos_x, active_pos_y]);
		this.element_indicator.style["display"] = "none";

		// Status 0 & 1: Preform an extra update or skip this tick
		if(this.update_status(targets[0], 0)) {
			clearTimeout(this.timer_extra);
			this.timer_extra = setTimeout(this.update.bind(this), (this.timer_interval * 0.25) + (this.timer_interval * 0.5 * Math.random()));
		}
		if(this.update_status(targets[1], 1)) {
			audio.play_sound();
			return;
		}

		// Handle item movement and status effects
		const float = this.update_status(targets[4], 4);
		for(let i in this.items) {
			// Status 2 & 3: Convert 1 x 1 items to or from a target and normal item if they're below the target spawn height
			if(this.items[i].position[1] >= this.settings.target_height) {
				if(this.update_status(targets[2], 2) && !this.items[i].target)
					this.items[i].set_target(true);
				if(this.update_status(targets[3], 3) && this.items[i].target)
					this.items[i].set_target(false);
			}

			// Status 4 & 5: Apply gravity and random movements
			this.items[i].move([0, float ? -1 : +1], 0);
			if(this.update_status(targets[5], 5))
				this.items[i].move([Math.random() < 0.5 ? -1 : +1, 0], 0);

			// Status 6 & 7: Change the colors of item segments for cloning and spreading
			const segments = this.items[i].get_segments();
			for(let s in segments) {
				if(this.update_status(targets[6], 6) && segments[s][2] == 6)
					this.items[i].set_color(random_array(this.settings.item_colors), s);
				if(this.update_status(targets[7], 7) && segments[s][2] != 7)
					this.items[i].set_color(7, s);
			}

			// If the active item landed or became a target deactivate it
			if(this.items[i].active && this.items[i].sitting())
				this.items[i].active = false;
		}

		// Clear chains and add the cleared item count as score, count is raised by the power of two to reward clearing multiple items in one go
		this.score += 1 + Math.floor((this.chain(true) ** 2) / this.settings.chain);
		this.element_label_score.innerHTML = Math.min(this.score, DISPLAY_LABEL_LIMIT);

		// Game over: Win if no target items are left
		var has_active = false;
		var has_target = false;
		for(let i in this.items) {
			if(this.items[i].target)
				has_target = true;
			if(this.items[i].active)
				has_active = true;
			if(this.items[i].target && this.items[i].active)
				break;
		}
		if(!has_target && this.settings.target_count_max > 0)
			return this.game_end(true);

		// If there's no active item, get the colors of the next item and spawn one
		// Game over: Lose if the active item collides right after being spawned
		if(!has_active) {
			var colors = [];
			const segments = this.next();
			for(let s in segments)
				colors.push(segments[s][2]);

			const it = new item(this.element, this.items, this.settings_item, colors);
			it.set_pos([this.center, 0], 1);
			it.active = true;

			if(it.collides([it.position[0], it.position[1]], it.angle)) {
				it.remove();
				return this.game_end(false);
			}
		}

		// Pick a random dialog that matches the allowed filters, don't interrupt existing dialogue
		if(!this.dialog.index && this.settings.chat * (this.timer_interval / 1000) > Math.random())
			this.dialog.pick(1, this.difficulty, this.level, color);
		audio.play_sound();
	}

	// Fires when a key is pressed
	key(event) {
		// If an interactive dialog has focus, use Enter / Space to advance it then return
		// Resume playing the normal level music if a song was previously set by the dialog and the match is still going
		if(this.dialog.interactive) {
			if(event.key == "Enter" || event.key == " ")
				if(!this.dialog.advance() && this.timer)
					audio.play_music(this.settings.music);
			return;
		} else if(!this.timer || event.repeat)
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
					this.timer = setInterval(this.update.bind(this), this.timer_interval);
					this.items[i].active = false;
					this.update();
				}
				break;
			}

		// Cheat to jump to the next level, disabled in nightmare mode
		if(event.key == "Backspace" && !NIGHTMARE && !NIGHTMARE_AFTER)
			this.game_end(true);

		// Display gameplay instructions as well as status effects for active colors
		if(event.key == "`") {
			if(NIGHTMARE)
				alert("Error: The game has encountered a paradox and may not work properly, expect unpredictable results. Unless you're a masochist you better not hope to win this. Active statuses as follows...");
			else
				alert("Use the arrow keys or WASD to control the active item: Left and right to move, up to rotate, down to lower the item faster. Can you beat all " + this.settings.levels + " levels and escape? Chain at least " + this.settings.chain + " items of the same color to clear a line, remove all targets to advance. Different colors induce different effects, active statuses as follows...");

			if(this.settings.item_colors.includes(0))
				alert(ITEM_COLOR[0] + " / anger: Opposite of " + ITEM_COLOR[1] + " / fear. Has a chance of " + this.settings.statuses[0] + "x per tick. Induces aggitation and increases the creature's heart rate, may introduce extra ticks causing time to flow faster than normal.");
			if(this.settings.item_colors.includes(1))
				alert(ITEM_COLOR[1] + " / fear: Opposite of " + ITEM_COLOR[0] + " / anger. Has a chance of " + this.settings.statuses[1] + "x per tick. Increases anxiety which may cause the heart to skip beats, resulting in some ticks being lost and time freezing.");
			if(this.settings.item_colors.includes(2))
				alert(ITEM_COLOR[2] + " / nausea: Opposite of " + ITEM_COLOR[3] + " / serenity. Has a chance of " + this.settings.statuses[2] + "x per tick. Causes feelings of sickness due to germs that encourage targets to multiply, leftover 1 x 1 pills may turn into targets which will also need to be neutralized.");
			if(this.settings.item_colors.includes(3))
				alert(ITEM_COLOR[3] + " / serenity: Opposite of " + ITEM_COLOR[2] + " / nausea. Has a chance of " + this.settings.statuses[3] + "x per tick. Induces a state of calm thus helping the creature's own immune system, targets may automatically become neutralized and turn into 1 x 1 sized pills of the same color.");
			if(this.settings.item_colors.includes(4))
				alert(ITEM_COLOR[4] + " / sleep: Complementary to " + ITEM_COLOR[5] + " / excitement. Has a chance of " + this.settings.statuses[4] + "x per tick. This makes the creature sleepy and tempted to lay down, items in the stomach will sometimes float upward instead of falling down normally.");
			if(this.settings.item_colors.includes(5))
				alert(ITEM_COLOR[5] + " / excitement: Complementary to " + ITEM_COLOR[4] + " / sleep. Has a chance of " + this.settings.statuses[5] + "x per tick. Makes the creature more horny which may cause random spastic movement of the muscles, pills may get thrown around the stomach and move sideways on their own.");
			if(this.settings.item_colors.includes(6))
				alert(ITEM_COLOR[6] + " / absorption: Reverse of " + ITEM_COLOR[7] + " / spread. Has a chance of " + this.settings.statuses[6] + "x per tick. Affects items and segments of the same color, this mysterious substance absorbs and replicates nearby substances causing its own color to transform into another color.");
			if(this.settings.item_colors.includes(7))
				alert(ITEM_COLOR[7] + " / spread: Reverse of " + ITEM_COLOR[6] + " / absorption. Has a chance of " + this.settings.statuses[7] + "x per tick. Affects items and segments of other colors, when this classified substance is present pills and targets may absorb it causing them to lose their color and become like this.");
		}
	}
}

// Ask for confirmation before closing the window if a game is running
window.onbeforeunload = function() {
	if(data.game)
		return "Closing this page will erase the current game, are you sure?"
}

// Load the data
data.load_start();
