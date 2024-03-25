const canvas = document.getElementById("canvas");
const sidebar = document.querySelector(".sidebar");

canvas.height = window.innerHeight;
canvas.width = (window.innerWidth / 4) * 3;

let idCounter = 0;

const objects = [
    {
        id: ++idCounter,
        imageUrl:
            "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsX29mZmljZV8yNV9hX2N1dGVfM2RfYmxhbmtfc3RpY2t5X3Bvc3RfaXRfbm90ZV93aXRoX3RodV8wYTg4Y2U2Zi0zYjBiLTQ5NmItODUxOC0zZGExOTMyNzhkYWQucG5n.png",
    },
    {
        id: ++idCounter,
        imageUrl:
            "https://t3.ftcdn.net/jpg/06/27/37/52/360_F_627375264_RTjl9aWWhQLviA7nBHI4UAawA8OcAZ19.jpg",
    },
    {
        id: ++idCounter,
        imageUrl:
            "https://media.istockphoto.com/id/1428260142/photo/blue-pushpin-and-yellow-sticky-notes.webp?b=1&s=170667a&w=0&k=20&c=M9QWO0kV3lzNW0H4UX0o7AHQ6Z6t-lywhxJZWBnJgfY=",
    },
    {
        id: ++idCounter,
        imageUrl:
            "https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsX29mZmljZV8yNV9hX2N1dGVfM2RfYmxhbmtfc3RpY2t5X3Bvc3RfaXRfbm90ZV93aXRoX3RodV8wYTg4Y2U2Zi0zYjBiLTQ5NmItODUxOC0zZGExOTMyNzhkYWQucG5n.png",
    },
];

objects.forEach((object) => {
    const element = document.createElement("img");
    element.src = object.imageUrl;
    element.height = "100";
    element.width = "100";
    element.classList.add("draggable-image");
    element.draggable = "true";

    sidebar.appendChild(element);

    element.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("objectId", object.id);
    });
});

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Some docs I used:
 *
 * Summary: drop event will never function unless drag enter is defined
 * https://stackoverflow.com/questions/31528597/why-does-the-drop-event-not-fire-on-this-web-page
 *
 */
function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return new Vec2(x, y);
}

function handleDragEnter(e) {
    e.preventDefault();
}

canvas.addEventListener("dragover", handleDragEnter, false);

let renderedObjects = [];
let history = [];

canvas.addEventListener("drop", (event) => {
    event.preventDefault();
    const pos = getMousePosition(event.target, event);
    console.log(pos);
    console.log(event.dataTransfer);
    console.log(event.dataTransfer.getData("objectId"));

    const renderableObject = objects.find((object) => {
        return object.id === parseInt(event.dataTransfer.getData("objectId"));
    });

    console.log(renderableObject);

    renderedObjects.push({
        objectData: renderableObject,
        height: 100,
        width: 100,
        position: pos,
        loaded: false,
        imgElement: null,
        selected: false,
    });

    history.push({ event: "add" });
});

// If mouse down has happened within a canvas, we'll stop selected elements all together until mouseup happens
let elementMovingFlag = false;

// Holds a ref to a selected element inside of renderedObjects array
// multiscope multiple ownership mutable object, I know danger danger... fuck it....
// This can be fixed later with proper systems pipeline process, that's too much work for a POC
// no need to go full ECS for a POC
let elementMoving = null;

// Will be needed later when the canvas is a scaled view of a "world"
// world not implement for the POC, will be implement once rendered objects are properly managed with a render hash table
let elementMovingStartPos = null;

canvas.addEventListener("mousedown", (event) => {
    elementMovingFlag = true;
    // reversing before search because of the render order!
    // these will be "on top" in the render cycle because of how canvas works
    elementMoving = renderedObjects
        .slice()
        .reverse()
        .find((object) => {
            return object.selected === true;
        });

    // Not sure if this will be used until scaling (zooming) is implemented
    elementMovingStartPos = new Vec2(
        elementMoving.position.x,
        elementMoving.position.y
    );
});

canvas.addEventListener("mouseup", (event) => {
    history.push({
        event: "move",
        start: elementMovingStartPos,
        object: elementMoving,
    });

    elementMovingFlag = false;
    elementMoving = null;
    elementMovingStartPos = null;
});

function ctrlZ(e) {
    var evtobj = window.event ? event : e;
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
        if (renderedObjects.length === 0) {
            return;
        }

        const record = history.pop();

        if (record.event === "add") {
            renderedObjects.pop();
        } else if (record.event === "move") {
            record.object.position.x = record.start.x;
            record.object.position.y = record.start.y;
        }
    }
}

document.addEventListener("keydown", ctrlZ);

canvas.addEventListener("mousemove", (event) => {
    // Don't highlight objects if an object it in flight
    if (elementMovingFlag) {
        // we'll use the vector diff to move the item
        const newMousePosition = getMousePosition(event.target, event);

        elementMoving.position.x = newMousePosition.x;
        elementMoving.position.y = newMousePosition.y;

        return;
    }

    const pos = getMousePosition(event.target, event);
    console.log("firing", pos);

    let flag = false;

    renderedObjects.forEach((object) => {
        if (
            pos.x >= object.position.x - 50 &&
            pos.x <= object.position.x + object.width - 50 &&
            pos.y >= object.position.y - 50 &&
            pos.y <= object.position.y + object.height - 50
        ) {
            object.selected = true;
            flag = true;
        } else {
            object.selected = false;
        }
    });

    if (flag) {
        document.body.style.cursor = "pointer";
    } else {
        document.body.style.cursor = "default";
    }
});

const timeoutWrap = (fn, interval) => () => {
    setTimeout(fn, interval);
};

const update = () => {
    console.log("number of objects", renderedObjects.length);

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < renderedObjects.length; ++i) {
        // dirty select bounding box for POC
        if (renderedObjects[i].selected) {
            context.beginPath();
            context.rect(
                renderedObjects[i].position.x - 52,
                renderedObjects[i].position.y - 52,
                104,
                104
            );
            context.stroke();
        }

        // If an image url has already been loaded in memory, no need to wait for onload again
        // this prevents sprite flickering and needless loading
        // summary: https://stackoverflow.com/questions/43453693/canvas-flashing
        if (renderedObjects[i].loaded) {
            context.drawImage(
                renderedObjects[i].imgElement,
                renderedObjects[i].position.x - 50,
                renderedObjects[i].position.y - 50,
                renderedObjects[i].width,
                renderedObjects[i].height
            );

            continue;
        }

        let img = new Image();
        img.onload = function () {
            context.drawImage(
                img,
                renderedObjects[i].position.x - 50,
                renderedObjects[i].position.y - 50,
                100,
                100
            );
        };
        img.src = renderedObjects[i].objectData.imageUrl;

        renderedObjects[i].imgElement = img;
        renderedObjects[i].loaded = true;
    }

    requestAnimationFrame(timeoutWrap(update, 20));
};

update();
