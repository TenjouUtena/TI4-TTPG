/**
 * Trigger:
 * 
 *  globalEvents.TI4.onSystemActivated(object: system tile, player: Player)
 * 
 * when the active player drops a command token on a system tile.
 */

const { globalEvents, world, Vector } = require("@tabletop-playground/api");
const { isActivePlayer, isSystemTile, isCommandToken } = require("../lib/helpers");

// Register a listener to report (as well as test) system activation.
globalEvents.TI4.onSystemActivated.add((obj, player) => {
    const message = `${player.getName()} activated system "${obj.getTemplateMetadata()}"`
    for (const player of world.getAllPlayers()) {
        player.showMessage(message)
    }
})

// Called when a player drops a command token.
function onCommandTokenReleased(obj, player, thrown, grabPosition, grabRotation) {
    if (isActivePlayer(player)) {
        const src = obj.getPosition()
        const dst = new Vector(src.x, src.y, world.getTableHeight() - 5)
        const hits = world.lineTrace(src, dst)
        for (const hit of hits) {
            if (isSystemTile(hit.object)) {
                globalEvents.TI4.onSystemActivated.trigger(hit.object, player)
                break
            }
        }
    }
}

// Add our listener to future objects.
globalEvents.onObjectCreated.add((obj) => {
    if (isCommandToken(obj)) {
        obj.onReleased.add(onCommandTokenReleased)
    }
})

// Script reload doesn't onObjectCreated existing objects, load manually.
if (world.getExecutionReason() === 'ScriptReload') {
    for (const obj of world.getAllObjects()) {
        if (isCommandToken(obj)) {
            obj.onReleased.add(onCommandTokenReleased)
        }
    }
}

