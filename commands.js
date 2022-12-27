import eventCommand from './commands/event.js';
import bugCommand from './commands/bug.js';
import roadmapCommand from './commands/roadmap.js';
import configCommand from './commands/config.js';

const commands = [];
commands.push(eventCommand);
commands.push(bugCommand);
commands.push(roadmapCommand);
commands.push(configCommand);

export default commands;
