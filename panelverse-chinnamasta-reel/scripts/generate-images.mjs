#!/usr/bin/env node
/**
 * Placeholder list for manual / agent image generation.
 * Images should be saved to public/scenes/scene-XX.jpg
 */
import fs from "fs";
const scenes = JSON.parse(fs.readFileSync("src/scenes.json", "utf8"));
const missing = scenes.filter((s) => !fs.existsSync("public/" + s.file));
console.log(JSON.stringify({ total: scenes.length, missing: missing.length, files: missing.map((m) => m.file) }, null, 2));
