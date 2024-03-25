## Changelog

### Monday 25/03

#### Implemented

-   Objects in sidebar rendered from object list (could be fetched from API in future)
-   Can add objects to canvas using the cursor position within the canvas, as well as the `drop` event
    -   drop event doesn't work, but I found I could just define an empty prevent default `dragstart` event
-   Rendering loop and user events are decoupled (all data oriented rendering, only 1 scope actually touches the document)
-   Historical events for move and add implemented, can scan back through history with `ctrl-z`

#### Todo:

-   ctrl-y for redo (E.g: `redo.push(history.pop())`)
-   Canvas viewport scaling POC (`onscroll` de/increments scaling factor)
    -   scaling factor will have to be used to normalize coordinates and dimensions of objects
-   adding content to notes
    -   `edit` event on typing debounce or typing end (to function with ctrl-z and ctrl-y)
-   split logic into systems, there is too much logic in handlers
    -   CursorSystem -> sets cursor meta information in state
    -   InputSystem -> sets keyboard meta information in state
    -   RenderSystem -> basically what the existing update function is
-   Override browser drag and drop, object to be rendered with absolute positioning instead of relying on the greyed out drag placeholder
-   Proper event type / object definitions (everything is very loosely typed right now)
