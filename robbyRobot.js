const DIRECTIONS = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
const DIFFS = {
  'UP': {x: 0, y: -1},
  'RIGHT': {x: 1, y: 0},
  'DOWN': {x: 0, y: 1},
  'LEFT': {x: -1, y: 0}
};

function MinHeap(array, comparator) {

    /**
     * Storage for heap.
     * @private
     */
	this.heap = array || new Array();

    /**
     * Default comparator used if an override is not provided.
     * @private
     */
	this.compare = comparator || function(item1, item2) {
		return item1 == item2 ? 0 : item1 < item2 ? -1 : 1;
	};

    /**
     * Retrieve the index of the left child of the node at index i.
     * @private
     */
	this.left = function(i) {
		return 2 * i + 1;
	};
    /**
     * Retrieve the index of the right child of the node at index i.
     * @private
     */
	this.right = function(i) {
		return 2 * i + 2;
	};
    /**
     * Retrieve the index of the parent of the node at index i.
     * @private
     */
	this.parent = function(i) {
		return Math.ceil(i / 2) - 1;
	};

    /**
     * Ensure that the contents of the heap don't violate the
     * constraint.
     * @private
     */
	this.heapify = function(i) {
		var lIdx = this.left(i);
		var rIdx = this.right(i);
		var smallest;
		if (lIdx < this.heap.length
				&& this.compare(this.heap[lIdx], this.heap[i]) < 0) {
			smallest = lIdx;
		} else {
			smallest = i;
		}
		if (rIdx < this.heap.length
				&& this.compare(this.heap[rIdx], this.heap[smallest]) < 0) {
			smallest = rIdx;
		}
		if (i != smallest) {
			var temp = this.heap[smallest];
			this.heap[smallest] = this.heap[i];
			this.heap[i] = temp;
			this.heapify(smallest);
		}
	};

    /**
     * Starting with the node at index i, move up the heap until parent value
     * is less than the node.
     * @private
     */
	this.siftUp = function(i) {
		var p = this.parent(i);
		if (p >= 0 && this.compare(this.heap[p], this.heap[i]) > 0) {
			var temp = this.heap[p];
			this.heap[p] = this.heap[i];
			this.heap[i] = temp;
			this.siftUp(p);
		}
	};

    /**
     * Heapify the contents of an array.
     * This function is called when an array is provided.
     * @private
     */
	this.heapifyArray = function() {
		// for loop starting from floor size/2 going up and heapify each.
		var i = Math.floor(this.heap.length / 2) - 1;
		for (; i >= 0; i--) {
			this.heapify(i);
		}
	};

	// If an initial array was provided, then heapify the array.
	if (array != null) {
		this.heapifyArray();
	}
	;
}

MinHeap.prototype.push = function(item) {
	this.heap.push(item);
	this.siftUp(this.heap.length - 1);
};

MinHeap.prototype.pop = function() {
	var value;
	if (this.heap.length > 1) {
		value = this.heap[0];
		// Put the bottom element at the top and let it drift down.
		this.heap[0] = this.heap.pop();
		this.heapify(0);
	} else {
		value = this.heap.pop();
	}
	return value;
};

function turnsToDirection(dir1, dir2) {
  const turns = Math.abs(DIRECTIONS.indexOf(dir1) - DIRECTIONS.indexOf(dir2));
  return turns < 2 ? turns : 2;
}

function turnsToTarget (pos, dir, target) {
  // find all the valid initial directions for reaching target
  const targetDirs = [];
  if (pos.x !== target.x) {
    targetDirs.push(pos.x < target.x ? 'RIGHT' : 'LEFT');
  }
  if (pos.y !== target.y) {
    targetDirs.push(pos.y < target.y ? 'DOWN' : 'UP');
  }
  if (!targetDirs.length) { return 0; }
  // minimum turns to reach a valid direction plus one if target is not inline with pos
  return Math.min(...targetDirs.map(targetDir => {
    return turnsToDirection(dir, targetDir);
  })) + (targetDirs.length === 2 ? 1 : 0);
}

function movesToTarget (pos, target) {
  return Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y);
}

const MazeNode = function (pos, direction, parent, target) {
  this.pos = pos;
  this.direction = direction;
  this.parent = parent;
  this.score = this.distToStart() + this.distToTarget(target);
};

MazeNode.prototype.distToStart = function () {
  // count number of parent nodes
  let dist = 0;
  let node = this;
  while (node.parent) {
    node = node.parent;
    dist++;
  }
  return dist;
};

MazeNode.prototype.distToTarget = function (target) {
  return turnsToTarget(this.pos, this.direction, target) +
         movesToTarget(this.pos, target);
};

MazeNode.prototype.equals = function (node) {
  return this.pos.x === node.pos.x && this.pos.y === node.pos.y && this.direction === node.direction;
};

MazeNode.prototype.toString = function () {
  return `${this.direction}@${this.pos.x}X${this.pos.y}`;
};

MazeNode.prototype.commands = function () {
  // traverse tree upwards and reason commands
  let commands = [];
  let node = this;
  while (node.parent) {
    if (node.parent.pos.x !== node.pos.x || node.parent.pos.y !== node.pos.y) {
      commands.push('f');
    } else {
      let leftDirIdx = DIRECTIONS.indexOf(node.direction) - 1;
      if (leftDirIdx < 0) { leftDirIdx += DIRECTIONS.length; }
      if (node.parent.direction === DIRECTIONS[leftDirIdx]) {
        commands.push('r');
      } else {
        commands.push('l');
      }
    }
    node = node.parent;
  }
  return commands.reverse();
};

function getCommands(field, power) {
  // parse field
  const fieldSize = Math.sqrt(field.length);
  const start = {
    x: field.indexOf('S') % fieldSize,
    y: Math.floor(field.indexOf('S') / fieldSize)
  };
  const target = {
    x: field.indexOf('T') % fieldSize,
    y: Math.floor(field.indexOf('T') / fieldSize)
  };
  const fieldAt = function (x, y) {
    if (y < 0 || y >= fieldSize || x < 0 || x >= fieldSize) {
      return undefined;
    }
    return field[(y * fieldSize) + x];
  };

  // breadth first search
  const openList = new MinHeap([], function (node1, node2) {
    return node1.score === node2.score ? 0 : node1.score < node2.score ? -1 : 1;
  });
  const openListHash = {};
  const closedList = {};
  const lowestScoreNode = function () {
    const min = openList.pop();
    if (!min) { return undefined; }
    openListHash[min.toString()] = false;
    return min;
  };
  const considerNode = function (node) {
    // if the node is closed, off the field, or on a wall, then return
    const nodeStr = node.toString();
    if (closedList[nodeStr]) { return; }
    const fieldValue = fieldAt(node.pos.x, node.pos.y);
    if (!fieldValue || fieldValue === '#') { return; }
    // check open list for matching node
    const matchingOpenNode = openListHash[nodeStr];
    if (matchingOpenNode) {
      // overwrite open node if this one is better
      if (node.distToStart() < matchingOpenNode.distToStart()) {
        openList.push(node);
        openListHash[nodeStr] = node;
      }
    } else {
      openList.push(node);
      openListHash[nodeStr] = node;
    }
  };

  // add start node to openlist
  const startNode = new MazeNode(start, 'UP', null, target);
  openList.push(startNode);
  openListHash[startNode.toString()] = startNode;

  // loop until openlist is empty
  let node;
  while ((node = lowestScoreNode())) {
    const nodeStr = node.toString();
    // add to closedlist
    closedList[nodeStr] = true;

    // check if target has been reached
    if (fieldAt(node.pos.x, node.pos.y) === 'T') {
      const commands = node.commands();
      if (commands.length <= power) {
        return commands;
      } else {
        return [];
      }
    }

    // consider all possible moves
    // left
    let dirIdx = DIRECTIONS.indexOf(node.direction) - 1;
    if (dirIdx < 0) { dirIdx += DIRECTIONS.length; }
    considerNode(new MazeNode(node.pos, DIRECTIONS[dirIdx], node, target));

    // right
    dirIdx += 2;
    if (dirIdx >= DIRECTIONS.length) { dirIdx -= DIRECTIONS.length; }
    considerNode(new MazeNode(node.pos, DIRECTIONS[dirIdx], node, target));

    // forward
    const forwardPos = {
      x: node.pos.x + DIFFS[node.direction].x,
      y: node.pos.y + DIFFS[node.direction].y
    };
    considerNode(new MazeNode(forwardPos, node.direction, node, target));
  }

  return [];
}
